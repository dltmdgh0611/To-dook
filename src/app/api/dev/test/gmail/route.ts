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

    if (!setting?.gmailConnected || !setting.gmailToken) {
      return NextResponse.json(
        { error: 'Gmail이 연결되지 않았습니다. 먼저 OAuth 연결을 완료해주세요.' },
        { status: 400 }
      );
    }

    const tokenData = JSON.parse(setting.gmailToken);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Gmail 토큰이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    // Test API: Get messages list
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          error: errorData.error?.message || 'Gmail API 호출 실패',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Get message details for first few messages (optional, may fail if no messages)
    const messages = data.messages || [];
    let messageDetails: any[] = [];
    
    if (messages.length > 0) {
      try {
        messageDetails = await Promise.all(
          messages.slice(0, 3).map(async (msg: { id: string }) => {
            try {
              const msgResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );
              if (msgResponse.ok) {
                return await msgResponse.json();
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        messageDetails = messageDetails.filter(Boolean);
      } catch (error) {
        // Ignore errors when fetching message details
        console.log('Failed to fetch message details:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Gmail API 호출 성공',
      data: {
        totalMessages: data.resultSizeEstimate || 0,
        messageCount: messages.length,
        messages: messageDetails,
        messageIds: messages.map((m: { id: string }) => m.id),
        response: data,
      },
    });
  } catch (error) {
    console.error('Gmail API test error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

