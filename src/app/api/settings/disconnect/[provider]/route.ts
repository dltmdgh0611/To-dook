import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;

    const updateData: Record<string, boolean | null> = {};

    switch (provider) {
      case 'gmail':
        updateData.gmailConnected = false;
        updateData.gmailEmail = null;
        updateData.gmailToken = null;
        break;
      case 'slack':
        updateData.slackConnected = false;
        updateData.slackWorkspace = null;
        updateData.slackToken = null;
        break;
      case 'notion':
        updateData.notionConnected = false;
        updateData.notionWorkspace = null;
        updateData.notionToken = null;
        break;
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    await prisma.setting.update({
      where: { userId: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

