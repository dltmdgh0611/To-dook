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

    let setting = await prisma.setting.findUnique({
      where: { userId: session.user.id },
    });

    // Create default settings if not exists
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      gmailConnected: setting.gmailConnected,
      gmailEmail: setting.gmailEmail,
      slackConnected: setting.slackConnected,
      slackWorkspace: setting.slackWorkspace,
      slackChannels: setting.slackChannels,
      notionConnected: setting.notionConnected,
      notionWorkspace: setting.notionWorkspace,
      notionApiKey: setting.notionApiKey ? '••••' : null, // 마스킹 처리
      notionPages: setting.notionPages,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

