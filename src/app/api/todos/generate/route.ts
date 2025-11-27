import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { fetchSlackData, fetchGmailData, fetchNotionData, SourceItem } from '@/lib/data-fetchers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 유사도 계산 (Levenshtein 기반 간단한 유사도)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const costs: number[] = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (shorter.charAt(i - 1) !== longer.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[longer.length] = lastValue;
  }
  
  return (longer.length - costs[longer.length]) / longer.length;
}

// 중복 체크
function isDuplicate(newTitle: string, existingTitles: string[], threshold = 0.75): boolean {
  return existingTitles.some(title => calculateSimilarity(newTitle.toLowerCase(), title.toLowerCase()) >= threshold);
}

// 오늘 날짜 정보 생성
function getTodayInfo() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'Asia/Seoul'
  };
  return {
    formatted: now.toLocaleDateString('ko-KR', options),
    date: now.toISOString().split('T')[0],
    dayOfWeek: now.toLocaleDateString('ko-KR', { weekday: 'long', timeZone: 'Asia/Seoul' }),
    hour: now.getHours(),
  };
}

// 소스 데이터를 AI에 전달하기 좋은 형태로 포맷팅
function formatSourceForAI(item: SourceItem, index: number): string {
  const parts = [
    `[${index + 1}] ID: ${item.id}`,
    `    타입: ${item.type}`,
    `    제목: ${item.title}`,
  ];
  
  if (item.content && item.content !== item.title) {
    parts.push(`    내용: ${item.content.substring(0, 200)}${item.content.length > 200 ? '...' : ''}`);
  }
  if (item.author) parts.push(`    작성자: ${item.author}`);
  if (item.channel) parts.push(`    채널: #${item.channel}`);
  if (item.timestamp) parts.push(`    시간: ${item.timestamp}`);
  
  // 마감일 정보 추가 (추출된 경우)
  if (item.dueDate) {
    const dueDate = new Date(item.dueDate);
    const dueDateStr = dueDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    parts.push(`    📅 마감일: ${dueDateStr}`);
  }
  
  // Notion 상태 정보 추가
  if (item.metadata?.status) {
    parts.push(`    상태: ${item.metadata.status}`);
  }
  
  parts.push(`    링크: ${item.link}`);
  
  return parts.join('\n');
}

export async function POST() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
          send({ type: 'error', message: 'Unauthorized' });
          controller.close();
          return;
        }
        
        const userId = session.user.id;
        const today = getTodayInfo();
        
        // 사용자 설정 가져오기
        const setting = await prisma.setting.findUnique({
          where: { userId },
        });
        
        if (!setting) {
          send({ type: 'error', message: '설정을 찾을 수 없습니다. 먼저 서비스를 연결해주세요.' });
          controller.close();
          return;
        }
        
        // 타입 캐스팅 (마이그레이션 후 새 필드들)
        const settingAny = setting as any;
        
        console.log('[Generate] Settings:', {
          slack: setting.slackConnected,
          gmail: setting.gmailConnected,
          notion: setting.notionConnected,
          notionApiKey: !!settingAny.notionApiKey,
        });
        
        // 기존 투두 목록 가져오기 (중복 방지용)
        const existingTodos = await prisma.todo.findMany({
          where: { userId },
          select: { title: true, sources: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        
        const existingTitles = existingTodos.map(t => t.title);
        console.log('[Generate] Existing todos count:', existingTodos.length);
        
        // 각 소스별로 데이터 수집
        const slackData: SourceItem[] = [];
        const gmailData: SourceItem[] = [];
        const notionData: SourceItem[] = [];
        
        // 권한 설정 가져오기 (마이그레이션 후 새 필드들)
        const allowedSlackChannels = settingAny.slackChannels as string[] | null;
        const allowedNotionPages = settingAny.notionPages as string[] | null;
        
        // 1. Slack 데이터 수집
        if (setting.slackConnected && setting.slackToken) {
          send({ type: 'status', step: 'slack', message: 'Slack 메시지 수집 중...' });
          try {
            const tokenData = JSON.parse(setting.slackToken);
            // 새 형식: access_token, team_id가 직접 저장됨
            // 구 형식: authed_user.access_token, team.id에 저장됨
            const accessToken = tokenData.access_token || tokenData.authed_user?.access_token;
            const teamId = tokenData.team_id || tokenData.team?.id || tokenData.original?.team?.id;
            console.log('[Generate] Slack token type:', tokenData.token_type || 'unknown', 'teamId:', teamId);
            
            if (accessToken) {
              const data = await fetchSlackData(accessToken, teamId, allowedSlackChannels);
              slackData.push(...data);
              console.log('[Generate] Slack data fetched:', data.length, 'items');
            }
          } catch (e) {
            console.error('[Generate] Slack token parse error:', e);
          }
        }
        
        // 2. Gmail 데이터 수집
        if (setting.gmailConnected && setting.gmailToken) {
          send({ type: 'status', step: 'gmail', message: 'Gmail 메일 수집 중...' });
          try {
            const tokenData = JSON.parse(setting.gmailToken);
            console.log('[Generate] Gmail token exists:', !!tokenData.access_token);
            if (tokenData.access_token) {
              const data = await fetchGmailData(tokenData.access_token);
              gmailData.push(...data);
              console.log('[Generate] Gmail data fetched:', data.length, 'items');
            }
          } catch (e) {
            console.error('[Generate] Gmail token parse error:', e);
          }
        }
        
        // 3. Notion 데이터 수집 (OAuth 또는 API 키)
        const notionAccessToken = settingAny.notionApiKey || 
          (setting.notionToken ? JSON.parse(setting.notionToken).access_token : null);
        
        if (notionAccessToken) {
          send({ type: 'status', step: 'notion', message: 'Notion 페이지 수집 중...' });
          try {
            console.log('[Generate] Notion token exists:', !!notionAccessToken);
            const data = await fetchNotionData(notionAccessToken, allowedNotionPages);
            notionData.push(...data);
            console.log('[Generate] Notion data fetched:', data.length, 'items');
          } catch (e) {
            console.error('[Generate] Notion data fetch error:', e);
          }
        }
        
        const totalData = slackData.length + gmailData.length + notionData.length;
        console.log('[Generate] Data collected - Slack:', slackData.length, 'Gmail:', gmailData.length, 'Notion:', notionData.length);
        
        send({ 
          type: 'status', 
          step: 'collecting', 
          message: `데이터 수집 완료: Slack ${slackData.length}개, Gmail ${gmailData.length}개, Notion ${notionData.length}개` 
        });
        
        if (totalData === 0) {
          send({ type: 'status', step: 'complete', message: '수집된 데이터가 없습니다. 서비스 연결을 확인해주세요.' });
          send({ type: 'done', todos: [] });
          controller.close();
          return;
        }
        
        // 4. AI 분석
        send({ type: 'status', step: 'ai', message: 'AI가 할 일을 분석 중...' });
        
        // 데이터 포맷팅
        const formattedSlack = slackData.slice(0, 15).map((item, i) => formatSourceForAI(item, i)).join('\n\n');
        const formattedGmail = gmailData.slice(0, 15).map((item, i) => formatSourceForAI(item, i)).join('\n\n');
        const formattedNotion = notionData.slice(0, 15).map((item, i) => formatSourceForAI(item, i)).join('\n\n');
        
        const prompt = `당신은 전문 비서이자 생산성 전문가입니다. 사용자의 Slack, Gmail, Notion 데이터를 분석하여 **오늘 꼭 처리해야 할 구체적인 할 일**을 추출합니다.

## 현재 시간
- 날짜: ${today.formatted}
- 요일: ${today.dayOfWeek}
- 현재 시간대: ${today.hour}시 (${today.hour < 12 ? '오전' : '오후'})

## 기존 투두 목록 (이미 추가된 것들 - 중복 생성 금지!)
${existingTitles.length > 0 ? existingTitles.slice(0, 20).map(t => `- ${t}`).join('\n') : '(아직 없음)'}

---

${slackData.length > 0 ? `## 📱 Slack 메시지 (${slackData.length}개)
다음은 Slack에서 수집된 최근 메시지입니다. 각 메시지의 맥락을 파악하고, 나에게 요청되거나 처리해야 할 업무가 있는지 분석하세요.

${formattedSlack}

---
` : ''}
${gmailData.length > 0 ? `## 📧 Gmail 이메일 (${gmailData.length}개)
다음은 Gmail에서 수집된 이메일입니다. 답장이 필요하거나 처리해야 할 요청이 있는지 분석하세요.

${formattedGmail}

---
` : ''}
${notionData.length > 0 ? `## 📝 Notion 페이지 (${notionData.length}개)
다음은 최근 수정된 Notion 페이지/데이터베이스입니다. 검토하거나 업데이트해야 할 문서가 있는지 분석하세요.

${formattedNotion}

---
` : ''}

## ⚠️ 중요 규칙

### 0. 날짜 기반 필터링 (이미 적용됨)
- 마감일이 이미 지난 항목들은 자동으로 제외되었습니다
- 아래 데이터에 📅 마감일 정보가 있다면 해당 날짜까지 해야하는 업무입니다
- Notion의 완료 상태(Done, Complete 등) 항목도 제외되었습니다

### 1. 투두 추출 기준 (이것만 추출!)
- **명확한 요청**: 누군가가 나에게 직접 요청한 작업
- **미팅/회의**: 오늘 예정된 미팅, 준비해야 할 자료
- **마감 임박**: 오늘/내일까지 완료해야 하는 업무 (📅 마감일 참고)
- **답장 필요**: 답장이나 확인이 필요한 메시지/이메일
- **문서 작업**: 검토하거나 업데이트해야 할 중요 문서

### 2. 제외할 것 (절대 투두로 만들지 마세요)
- 단순 정보 공유, 뉴스, 공지사항
- 광고, 뉴스레터, 마케팅 이메일
- 이미 완료된 것으로 보이는 대화
- 나와 관련 없는 다른 사람들 간의 대화
- 기존 투두와 유사하거나 중복되는 내용
- **과거에 이미 끝난 마감일을 언급하는 내용** (예: "어제까지였던 건 잘 마무리됐습니다")

### 3. 소스별 균등 배분 (매우 중요!)
${slackData.length > 0 && gmailData.length > 0 && notionData.length > 0 
  ? `**필수**: 3~6개의 투두 중 Slack에서 1-2개, Gmail에서 1-2개, Notion에서 1-2개를 균등하게 추출하세요.
- 한 소스에서만 3개 이상 추출하지 마세요!
- 각 소스에서 최소 1개는 반드시 포함하세요.` 
  : slackData.length > 0 && gmailData.length > 0 
    ? `**필수**: Slack과 Gmail에서 각각 최소 1개 이상씩 균등하게 추출하세요.`
    : slackData.length > 0 && notionData.length > 0
      ? `**필수**: Slack과 Notion에서 각각 최소 1개 이상씩 균등하게 추출하세요.`
      : gmailData.length > 0 && notionData.length > 0
        ? `**필수**: Gmail과 Notion에서 각각 최소 1개 이상씩 균등하게 추출하세요.`
        : '가능한 소스에서 추출하세요.'}

### 4. 제목 작성 규칙
- **구체적으로**: "미팅 참석" ❌ → "3시 김팀장님과 주간보고 미팅 참석 및 자료 준비" ✅
- **행동 중심**: 무엇을 해야 하는지 명확하게 (동사로 끝나도록)
- **40자 이내**: 핵심만 담아 간결하게

### 5. sources 필드 규칙 (매우 중요!)
- 각 투두는 **반드시** 원본 데이터의 id와 link를 포함해야 합니다
- 위 데이터에서 제공된 ID와 링크를 **그대로** 사용하세요
- **같은 업무가 여러 소스에서 언급된 경우**: sources 배열에 모든 관련 소스를 포함하세요!
  예: 슬랙에서 미팅 언급 + 노션에 미팅 일정 → sources에 둘 다 포함
- 링크가 없는 투두는 생성하지 마세요

## 출력 형식 (JSON 배열만, 3~6개)

\`\`\`json
[
  {
    "title": "구체적인 할 일 제목 (40자 이내)",
    "description": "추가 맥락 설명 (어떤 메시지/이메일에서 왔는지, 왜 해야 하는지)",
    "dueDate": "오늘 15:00까지 / 오늘 / 내일",
    "priority": "high | medium | low",
    "emoji": "적절한 이모지 1개",
    "tag": "미팅 | 업무 | 개발 | 메일 | 문서 | 리뷰",
    "tagColor": "text-purple-600 | text-orange-600 | text-blue-600 | text-emerald-600 | text-gray-600 | text-pink-600",
    "sources": [
      {
        "type": "slack",
        "id": "슬랙 메시지 ID",
        "link": "슬랙 채널 링크",
        "title": "슬랙 메시지 요약"
      },
      {
        "type": "notion",
        "id": "노션 페이지 ID (같은 업무면 추가)",
        "link": "노션 페이지 링크",
        "title": "노션 페이지 제목"
      }
    ]
  }
]
\`\`\`

**중요 규칙:**
1. 위 JSON 형식만 출력하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요.
2. sources 배열에는 반드시 id와 link가 포함되어야 합니다!
3. **같은 업무가 Slack과 Notion 모두에 있으면 sources에 2개 다 넣으세요!**
4. **Slack에서만 투두를 만들지 말고, 반드시 다른 소스도 활용하세요!**`;

        console.log('[Generate] Sending prompt to AI, length:', prompt.length);
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 2500,
        });
        
        const responseText = completion.choices[0]?.message?.content || '[]';
        console.log('[Generate] AI Response:', responseText.substring(0, 500));
        
        let generatedTodos: any[] = [];
        try {
          // JSON 추출 시도
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            generatedTodos = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.error('[Generate] JSON parse error:', parseError, responseText);
          send({ type: 'error', message: 'AI 응답 파싱 실패. 다시 시도해주세요.' });
          controller.close();
          return;
        }
        
        console.log('[Generate] Parsed todos count:', generatedTodos.length);
        
        // 5. 중복 체크 및 저장
        send({ type: 'status', step: 'saving', message: '투두 저장 중...' });
        
        const savedTodos: any[] = [];
        
        for (const todo of generatedTodos) {
          // 제목 유사도 체크
          if (isDuplicate(todo.title, existingTitles)) {
            console.log('[Generate] Skipping duplicate todo:', todo.title);
            continue;
          }
          
          // sources 배열 검증 및 정리
          let cleanedSources: any[] = [];
          if (Array.isArray(todo.sources)) {
            cleanedSources = todo.sources
              .filter((s: any) => s && s.id && s.link && s.type)
              .map((s: any) => ({
                type: s.type,
                id: String(s.id),
                link: String(s.link),
                title: s.title || '',
              }));
          }
          
          // sources가 없으면 스킵
          if (cleanedSources.length === 0) {
            console.log('[Generate] Skipping todo without valid sources:', todo.title);
            continue;
          }
          
          try {
            const saved = await prisma.todo.create({
              data: {
                title: todo.title,
                description: todo.description || null,
                dueDate: todo.dueDate || null,
                priority: todo.priority || 'medium',
                emoji: todo.emoji || null,
                tag: todo.tag || null,
                tagColor: todo.tagColor || null,
                sources: cleanedSources,
                userId,
              },
            });
            
            savedTodos.push(saved);
            existingTitles.push(todo.title);
            
            // 각 투두가 저장될 때마다 프론트엔드에 알림
            send({ type: 'todo', todo: saved });
            console.log('[Generate] Saved todo:', saved.title);
          } catch (saveError: any) {
            console.error('[Generate] Todo save error:', saveError.message);
          }
        }
        
        send({ type: 'status', step: 'complete', message: `${savedTodos.length}개의 할 일이 생성되었습니다.` });
        send({ type: 'done', todos: savedTodos });
        
      } catch (error) {
        console.error('[Generate] Error:', error);
        send({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });
  
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
