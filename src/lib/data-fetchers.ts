export interface SourceItem {
  type: 'slack' | 'email' | 'notion';
  id: string;
  link: string;
  title: string;
  content?: string;
  channel?: string;
  author?: string;
  timestamp?: string;
  dueDate?: string;  // ISO 날짜 문자열 (마감일 추론용)
  metadata?: Record<string, any>;
}

/**
 * 날짜가 현재 시간 기준으로 이미 지났는지 확인
 */
function isPastDue(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  try {
    const dueDate = new Date(dateStr);
    const now = new Date();
    // 오늘 자정 기준으로 비교 (오늘 마감인 것은 포함)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return dueDate < todayStart;
  } catch {
    return false;
  }
}

/**
 * Slack 메시지 데이터 수집 (전체 채널 시도 방식)
 */
export async function fetchSlackData(
  accessToken: string,
  teamId?: string,
  allowedChannels?: string[] | null
): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    console.log('[Slack] Starting data fetch with token:', accessToken?.substring(0, 20) + '...');
    console.log('[Slack] Team ID:', teamId);

    // 1. 채널 목록 가져오기 (페이지네이션으로 전체 조회)
    let allChannels: any[] = [];
    let cursor: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 10; // 최대 10페이지 (약 1000개 채널)

    do {
      const url = new URL('https://slack.com/api/conversations.list');
      url.searchParams.append('types', 'public_channel,private_channel');
      url.searchParams.append('limit', '200');
      url.searchParams.append('exclude_archived', 'true');
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const channelsResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const channelsData = await channelsResponse.json();
      
      if (!channelsData.ok) {
        console.error('[Slack] Channels API error:', channelsData.error, channelsData.response_metadata);
        break;
      }

      if (channelsData.channels) {
        allChannels = allChannels.concat(channelsData.channels);
      }

      cursor = channelsData.response_metadata?.next_cursor;
      pageCount++;
      
      console.log(`[Slack] Page ${pageCount}: fetched ${channelsData.channels?.length || 0} channels, total: ${allChannels.length}`);
    } while (cursor && pageCount < maxPages);

    console.log('[Slack] Total channels found:', allChannels.length);

    if (allChannels.length === 0) {
      console.log('[Slack] No channels found');
      return items;
    }

    // 2. 설정된 허용 채널 필터링 (선택적)
    let channelsToTry = allChannels;
    if (allowedChannels && allowedChannels.length > 0) {
      channelsToTry = allChannels.filter((ch: any) => 
        allowedChannels.includes(ch.id) || allowedChannels.includes(ch.name)
      );
      console.log('[Slack] After allowed filter:', channelsToTry.length);
    }

    console.log('[Slack] Will try to fetch from all channels:', channelsToTry.length);
    
    // is_member가 true인 채널을 우선 처리하되, 아닌 것도 시도
    const sortedChannels = channelsToTry.sort((a: any, b: any) => {
      // is_member: true인 채널을 먼저
      if (a.is_member && !b.is_member) return -1;
      if (!a.is_member && b.is_member) return 1;
      return 0;
    });
    
    // 전체 채널 시도 (성공한 것만 수집)
    const channelsToProcess = sortedChannels;
    console.log('[Slack] Total channels to try:', channelsToProcess.length);

    // 3. 사용자 정보 캐시 (한 번에 가져오기)
    const usersCache: Record<string, string> = {};
    try {
      const usersResponse = await fetch('https://slack.com/api/users.list?limit=200', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const usersData = await usersResponse.json();
      if (usersData.ok && usersData.members) {
        for (const user of usersData.members) {
          usersCache[user.id] = user.real_name || user.name || user.id;
        }
      }
    } catch (e) {
      console.warn('[Slack] Failed to fetch users list:', e);
    }

    // 4. 각 채널에서 최근 메시지 가져오기 (성공한 채널만)
    let successfulChannels = 0;
    let skippedChannels = 0;
    const maxMessages = 30; // 최대 수집 메시지 수
    const maxSuccessfulChannels = 10; // 성공한 채널 수 제한
    
    for (const channel of channelsToProcess) {
      // 충분한 메시지를 수집했으면 중단
      if (items.length >= maxMessages || successfulChannels >= maxSuccessfulChannels) {
        console.log(`[Slack] Stopping early - collected ${items.length} messages from ${successfulChannels} channels`);
        break;
      }
      
      try {
        // 24시간 이내 메시지만 가져오기
        const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
        
        const messagesResponse = await fetch(
          `https://slack.com/api/conversations.history?channel=${channel.id}&limit=10&oldest=${oneDayAgo}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const messagesData = await messagesResponse.json();

        if (!messagesData.ok) {
          // not_in_channel, missing_scope 등은 예상되는 에러 - 조용히 스킵
          if (['not_in_channel', 'missing_scope', 'channel_not_found'].includes(messagesData.error)) {
            skippedChannels++;
            continue;
          }
          console.error(`[Slack] Unexpected error for ${channel.name}:`, messagesData.error);
          continue;
        }
        
        // 성공한 채널!
        if (messagesData.messages && messagesData.messages.length > 0) {
          successfulChannels++;
          console.log(`[Slack] ✓ Channel ${channel.name}: ${messagesData.messages.length} messages`);
        }

        if (messagesData.messages) {
          for (const message of messagesData.messages) {
            // 봇 메시지, 시스템 메시지, join/leave 메시지 제외
            if (message.subtype && ['channel_join', 'channel_leave', 'bot_message'].includes(message.subtype)) continue;
            if (message.bot_id && !message.text?.includes('reminder')) continue;

            const text = message.text || '';
            if (!text.trim() || text.length < 10) continue;

            // 메시지 텍스트 정리 (멘션 변환, 링크 정리)
            let cleanText = text
              .replace(/<@([A-Z0-9]+)>/g, (_: string, userId: string) => `@${usersCache[userId] || userId}`)
              .replace(/<#([A-Z0-9]+)\|([^>]+)>/g, '#$2')
              .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$2')
              .replace(/<(https?:\/\/[^>]+)>/g, '$1');

            // 제목 생성 (첫 100자, 줄바꿈 제거)
            const title = cleanText.replace(/\n/g, ' ').substring(0, 100) + (cleanText.length > 100 ? '...' : '');

            // 타임스탬프를 날짜로 변환
            const msgDate = new Date(parseFloat(message.ts) * 1000);
            const timeStr = msgDate.toLocaleString('ko-KR', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // 메시지에서 날짜 언급 추출 (마감일 추론)
            let inferredDueDate: string | undefined;
            const datePatterns = [
              /(\d{1,2})월\s*(\d{1,2})일/,          // 11월 27일
              /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/, // 2025-11-27, 2025/11/27
              /(\d{1,2})[-./](\d{1,2})/,             // 11-27, 11/27
              /오늘|금일/,
              /내일/,
              /모레/,
              /이번\s*주/,
              /다음\s*주/,
            ];
            
            for (const pattern of datePatterns) {
              const match = cleanText.match(pattern);
              if (match) {
                const now = new Date();
                if (pattern.source.includes('월') && match[1] && match[2]) {
                  // 11월 27일 형식
                  inferredDueDate = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2])).toISOString();
                } else if (pattern.source.includes('\\d{4}') && match[1] && match[2] && match[3]) {
                  // 2025-11-27 형식
                  inferredDueDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).toISOString();
                } else if (pattern.source.includes('오늘')) {
                  inferredDueDate = now.toISOString();
                } else if (pattern.source.includes('내일')) {
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  inferredDueDate = tomorrow.toISOString();
                } else if (pattern.source.includes('모레')) {
                  const dayAfterTomorrow = new Date(now);
                  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
                  inferredDueDate = dayAfterTomorrow.toISOString();
                }
                break;
              }
            }

            // 이미 지난 날짜의 업무는 제외
            if (inferredDueDate && isPastDue(inferredDueDate)) {
              console.log(`[Slack] Skipping past due message: ${title.substring(0, 30)}... (due: ${inferredDueDate})`);
              continue;
            }

            const authorName = usersCache[message.user] || message.username || '알 수 없음';

            items.push({
              type: 'slack',
              id: message.ts || message.client_msg_id || `${channel.id}-${Date.now()}`,
              // 채널까지만 링크 (특정 메시지 ID 제외)
              link: teamId
                ? `https://app.slack.com/client/${teamId}/${channel.id}`
                : `https://slack.com/app_redirect?channel=${channel.id}`,
              title,
              content: cleanText,
              channel: channel.name || channel.id,
              author: authorName,
              timestamp: timeStr,
              dueDate: inferredDueDate,
              metadata: {
                channelId: channel.id,
                userId: message.user,
                hasThread: !!message.thread_ts,
                reactionCount: message.reactions?.length || 0,
                inferredDueDate,
              }
            });
          }
        }
      } catch (error) {
        console.error(`[Slack] Error fetching messages from channel ${channel.name}:`, error);
      }
    }

    console.log(`[Slack] Summary: ${successfulChannels} accessible channels, ${skippedChannels} skipped (no access), ${items.length} messages collected`);
  } catch (error) {
    console.error('[Slack] Data fetch error:', error);
  }

  return items;
}

/**
 * Gmail 메시지 데이터 수집
 */
export async function fetchGmailData(accessToken: string): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    console.log('[Gmail] Starting data fetch');

    // 1. 메시지 목록 가져오기 (읽지 않은 메일 또는 최근 3일 이내)
    const messagesResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:unread OR newer_than:3d',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json().catch(() => ({}));
      console.error('[Gmail] Messages list error:', errorData);
      return items;
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];
    console.log('[Gmail] Found messages:', messages.length);

    // 2. 각 메시지의 상세 정보 가져오기
    for (const message of messages.slice(0, 20)) {
      try {
        const messageDetailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!messageDetailResponse.ok) continue;

        const messageDetail = await messageDetailResponse.json();
        const headers = messageDetail.payload?.headers || [];

        const subjectHeader = headers.find((h: any) => h.name === 'Subject');
        const fromHeader = headers.find((h: any) => h.name === 'From');
        const dateHeader = headers.find((h: any) => h.name === 'Date');
        
        const subject = subjectHeader?.value || '(제목 없음)';
        const from = fromHeader?.value || '';
        const dateStr = dateHeader?.value || '';

        // 보낸 사람 이름 추출
        const fromName = from.match(/^([^<]+)/)?.[1]?.trim() || from.split('@')[0] || '알 수 없음';
        const fromEmail = from.match(/<([^>]+)>/)?.[1] || from;

        // 광고성/뉴스레터 필터링
        const isPromotion = subject.toLowerCase().includes('unsubscribe') ||
          subject.toLowerCase().includes('newsletter') ||
          fromEmail.includes('noreply') ||
          fromEmail.includes('no-reply') ||
          fromEmail.includes('marketing');

        if (isPromotion) continue;

        // 제목 생성
        const title = subject.length > 80 ? subject.substring(0, 80) + '...' : subject;

        // 날짜 포맷팅
        let timeStr = '';
        let emailDate: Date | undefined;
        try {
          emailDate = new Date(dateStr);
          timeStr = emailDate.toLocaleString('ko-KR', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          timeStr = dateStr.substring(0, 20);
        }

        // 이메일 제목에서 날짜 언급 추출 (마감일 추론)
        let inferredDueDate: string | undefined;
        const datePatterns = [
          /(\d{1,2})월\s*(\d{1,2})일/,          // 11월 27일
          /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/, // 2025-11-27
          /(\d{1,2})[-./](\d{1,2})/,             // 11-27
        ];
        
        for (const pattern of datePatterns) {
          const match = subject.match(pattern);
          if (match) {
            const now = new Date();
            if (pattern.source.includes('월') && match[1] && match[2]) {
              inferredDueDate = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2])).toISOString();
            } else if (pattern.source.includes('\\d{4}') && match[1] && match[2] && match[3]) {
              inferredDueDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3])).toISOString();
            }
            break;
          }
        }

        // 이미 지난 날짜의 이메일 제외 (마감일이 있는 경우)
        if (inferredDueDate && isPastDue(inferredDueDate)) {
          console.log(`[Gmail] Skipping past due email: ${title.substring(0, 30)}... (due: ${inferredDueDate})`);
          continue;
        }

        items.push({
          type: 'email',
          id: message.id,
          link: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
          title: `${fromName}: ${title}`,
          content: subject,
          author: fromName,
          timestamp: timeStr,
          dueDate: inferredDueDate,
          metadata: {
            fromEmail,
            isUnread: messageDetail.labelIds?.includes('UNREAD'),
            labels: messageDetail.labelIds,
            emailDate: emailDate?.toISOString(),
          }
        });
      } catch (error) {
        console.error(`[Gmail] Error fetching message ${message.id}:`, error);
      }
    }

    console.log('[Gmail] Total items collected:', items.length);
  } catch (error) {
    console.error('[Gmail] Data fetch error:', error);
  }

  return items;
}

/**
 * Notion 페이지 데이터 수집 (개선됨)
 */
export async function fetchNotionData(
  accessToken: string,
  allowedPages?: string[] | null
): Promise<SourceItem[]> {
  const items: SourceItem[] = [];

  try {
    console.log('[Notion] Starting data fetch');

    // 1. 페이지 검색 (최근 수정된 순)
    const searchResponse = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 30,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      }),
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}));
      console.error('[Notion] Search API error:', errorData);
      return items;
    }

    const searchData = await searchResponse.json();
    let results = searchData.results || [];
    console.log('[Notion] Found results:', results.length);

    // 페이지 필터링 (설정된 경우)
    if (allowedPages && allowedPages.length > 0) {
      results = results.filter((item: any) => 
        allowedPages.includes(item.id) || 
        allowedPages.some(p => item.id.replace(/-/g, '').includes(p.replace(/-/g, '')))
      );
    }

    // 2. 각 결과 처리
    for (const item of results.slice(0, 30)) {
      try {
        const isDatabase = item.object === 'database';
        
        // 제목 추출
        let title = 'Untitled';
        let dueDateStr: string | undefined;
        let status: string | undefined;
        
        if (isDatabase) {
          // 데이터베이스 제목
          if (item.title?.[0]?.plain_text) {
            title = item.title.map((t: any) => t.plain_text).join('');
          }
        } else if (item.properties) {
          // 페이지 제목 - title 타입 속성 찾기
          const properties = item.properties as Record<string, any>;
          
          const titleProp = Object.values(properties).find(
            (prop: any) => prop.type === 'title'
          ) as any;
          if (titleProp?.title?.[0]?.plain_text) {
            title = titleProp.title.map((t: any) => t.plain_text).join('');
          }

          // Due date 속성 찾기 (다양한 이름 지원)
          const datePropNames = ['Due', 'Due Date', 'DueDate', '마감일', '마감', 'Deadline', 'Date', '날짜', '기한'];
          for (const [propName, propValue] of Object.entries(properties)) {
            const prop = propValue as any;
            
            // Date 타입 속성 확인
            if (prop.type === 'date' && prop.date) {
              const lowerName = propName.toLowerCase();
              if (datePropNames.some(n => lowerName.includes(n.toLowerCase())) || lowerName.includes('due')) {
                dueDateStr = prop.date.start;
                console.log(`[Notion] Found due date for "${title}": ${dueDateStr}`);
                break;
              }
            }
          }

          // Status 속성 찾기 (완료 여부 확인)
          for (const [propName, propValue] of Object.entries(properties)) {
            const prop = propValue as any;
            const lowerName = propName.toLowerCase();
            
            // Status 타입
            if (prop.type === 'status' && prop.status) {
              status = prop.status.name?.toLowerCase();
              break;
            }
            // Select 타입으로 된 상태
            if (prop.type === 'select' && prop.select && 
                (lowerName.includes('status') || lowerName.includes('상태'))) {
              status = prop.select.name?.toLowerCase();
              break;
            }
            // Checkbox 타입 (완료 여부)
            if (prop.type === 'checkbox' && 
                (lowerName.includes('done') || lowerName.includes('complete') || lowerName.includes('완료'))) {
              if (prop.checkbox === true) {
                status = 'done';
              }
              break;
            }
          }
        }

        // 빈 제목 스킵
        if (!title || title.trim() === '' || title === 'Untitled') continue;

        // 이미 완료된 항목 스킵
        const completedStatuses = ['done', 'complete', 'completed', '완료', '완료됨', 'finished'];
        if (status && completedStatuses.includes(status)) {
          console.log(`[Notion] Skipping completed item: ${title}`);
          continue;
        }

        // 마감일이 이미 지난 항목 스킵
        if (dueDateStr && isPastDue(dueDateStr)) {
          console.log(`[Notion] Skipping past due item: ${title} (due: ${dueDateStr})`);
          continue;
        }

        const pageTitle = title.length > 80 ? title.substring(0, 80) + '...' : title;

        // 마지막 수정 시간
        const lastEdited = item.last_edited_time;
        let timeStr = '';
        if (lastEdited) {
          try {
            const editDate = new Date(lastEdited);
            timeStr = editDate.toLocaleString('ko-KR', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch {
            timeStr = '';
          }
        }

        // 아이콘/이모지 추출
        let emoji = '';
        if (item.icon?.type === 'emoji') {
          emoji = item.icon.emoji;
        }

        // 상위 페이지 정보
        let parentInfo = '';
        if (item.parent?.type === 'database_id') {
          parentInfo = 'DB 항목';
        } else if (item.parent?.type === 'page_id') {
          parentInfo = '하위 페이지';
        }

        items.push({
          type: 'notion',
          id: item.id,
          link: item.url || `https://notion.so/${item.id.replace(/-/g, '')}`,
          title: emoji ? `${emoji} ${pageTitle}` : pageTitle,
          content: `${isDatabase ? '[데이터베이스]' : '[페이지]'} ${title}`,
          timestamp: timeStr,
          dueDate: dueDateStr,
          metadata: {
            isDatabase,
            parentType: item.parent?.type,
            parentInfo,
            archived: item.archived,
            hasIcon: !!item.icon,
            hasCover: !!item.cover,
            status,
            dueDate: dueDateStr,
          }
        });
      } catch (error) {
        console.error(`[Notion] Error processing item ${item.id}:`, error);
      }
    }

    console.log('[Notion] Total items collected:', items.length);
  } catch (error) {
    console.error('[Notion] Data fetch error:', error);
  }

  return items;
}
