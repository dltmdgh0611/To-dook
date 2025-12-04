import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    let setting = await prisma.setting.findUnique({
      where: { userId: session!.user.id },
    });

    // Create default settings if not exists
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          userId: session!.user.id,
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

