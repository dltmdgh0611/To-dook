import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.setting.findUnique({
      where: { userId: session.user.id },
    });

    // OAuth 토큰 또는 API 키 사용
    let accessToken: string | null = null;

    if (setting?.notionApiKey) {
      accessToken = setting.notionApiKey;
    } else if (setting?.notionConnected && setting.notionToken) {
      try {
        const tokenData = JSON.parse(setting.notionToken);
        accessToken = tokenData.access_token;
      } catch {
        // 토큰 파싱 실패
      }
    }

    if (!accessToken) {
      return NextResponse.json({ pages: [] });
    }

    // 페이지 및 데이터베이스 검색
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Notion search API error:', errorData);
      return NextResponse.json({ pages: [], error: errorData.message });
    }

    const data = await response.json();
    const results = data.results || [];

    const pages = results.map((item: any) => {
      let title = 'Untitled';
      const isDatabase = item.object === 'database';

      if (isDatabase) {
        if (item.title?.[0]?.plain_text) {
          title = item.title.map((t: any) => t.plain_text).join('');
        }
      } else if (item.properties) {
        const titleProp = Object.values(item.properties).find(
          (prop: any) => prop.type === 'title'
        ) as any;
        if (titleProp?.title?.[0]?.plain_text) {
          title = titleProp.title.map((t: any) => t.plain_text).join('');
        }
      }

      return {
        id: item.id,
        title: title || 'Untitled',
        type: isDatabase ? 'database' : 'page',
      };
    }).filter((p: any) => p.title !== 'Untitled');

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Failed to fetch Notion pages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

