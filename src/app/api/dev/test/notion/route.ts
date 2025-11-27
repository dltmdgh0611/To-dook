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

    // Get user settings
    const setting = await prisma.setting.findUnique({
      where: { userId: session.user.id },
    });

    if (!setting?.notionConnected || !setting.notionToken) {
      return NextResponse.json(
        { error: 'Notion이 연결되지 않았습니다. 먼저 OAuth 연결을 완료해주세요.' },
        { status: 400 }
      );
    }

    const tokenData = JSON.parse(setting.notionToken);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Notion 토큰이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    // Test API: Search pages
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 5,
        filter: {
          property: 'object',
          value: 'page',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          error: errorData.message || 'Notion API 호출 실패',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Notion API 호출 성공',
      data: {
        pages: data.results?.slice(0, 5) || [],
        totalPages: data.results?.length || 0,
        hasMore: data.has_more || false,
        response: data,
      },
    });
  } catch (error) {
    console.error('Notion API test error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

