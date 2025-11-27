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

    if (!setting?.slackConnected || !setting.slackToken) {
      return NextResponse.json({ channels: [] });
    }

    const tokenData = JSON.parse(setting.slackToken);
    const accessToken = tokenData.access_token || tokenData.authed_user?.access_token;

    if (!accessToken) {
      return NextResponse.json({ channels: [] });
    }

    // 채널 목록 가져오기
    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=100', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack channels API error:', data.error);
      return NextResponse.json({ channels: [], error: data.error });
    }

    const channels = (data.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      is_private: ch.is_private || false,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Failed to fetch Slack channels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

