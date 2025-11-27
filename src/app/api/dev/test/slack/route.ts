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

    if (!setting?.slackConnected || !setting.slackToken) {
      return NextResponse.json(
        { error: 'Slack이 연결되지 않았습니다. 먼저 OAuth 연결을 완료해주세요.' },
        { status: 400 }
      );
    }

    const tokenData = JSON.parse(setting.slackToken);
    const accessToken = tokenData.access_token || tokenData.authed_user?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Slack 토큰이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    // Test API: Get channels list
    const response = await fetch('https://slack.com/api/conversations.list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Slack API 호출 실패',
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Slack API 호출 성공',
      data: {
        channels: data.channels?.slice(0, 5) || [], // 처음 5개 채널만 반환
        totalChannels: data.channels?.length || 0,
        response: data,
      },
    });
  } catch (error) {
    console.error('Slack API test error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

