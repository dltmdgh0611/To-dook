import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API 키가 필요합니다.' }, { status: 400 });
    }

    // API 키 유효성 검증 (Notion API 호출)
    const testResponse = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      console.error('Notion API key validation failed:', errorData);
      return NextResponse.json(
        { error: 'API 키가 유효하지 않습니다. Integration 키를 확인해주세요.', message: errorData.message },
        { status: 400 }
      );
    }

    const userData = await testResponse.json();
    const workspaceName = userData.name || 'Notion Workspace';

    // 설정 업데이트
    await prisma.setting.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        notionApiKey: apiKey,
        notionConnected: true,
        notionWorkspace: workspaceName,
      },
      update: {
        notionApiKey: apiKey,
        notionConnected: true,
        notionWorkspace: workspaceName,
      },
    });

    return NextResponse.json({ success: true, workspace: workspaceName });
  } catch (error) {
    console.error('Failed to save Notion API key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

