import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slackChannels, notionPages } = await request.json();

    await prisma.setting.update({
      where: { userId: session.user.id },
      data: {
        slackChannels: slackChannels || null,
        notionPages: notionPages || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save permissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.setting.findUnique({
      where: { userId: session.user.id },
      select: {
        slackChannels: true,
        notionPages: true,
      },
    });

    return NextResponse.json({
      slackChannels: setting?.slackChannels || null,
      notionPages: setting?.notionPages || null,
    });
  } catch (error) {
    console.error('Failed to get permissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

