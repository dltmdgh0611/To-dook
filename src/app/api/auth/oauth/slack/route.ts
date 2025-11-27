import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/oauth/slack/callback`;
    
    // Debug: Log redirect URI to help with Slack app configuration
    console.log('Slack OAuth redirect_uri:', redirectUri);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    // User Token Scopes - 사용자 본인의 권한으로 채널 접근
    const userScope = [
      'channels:read',
      'channels:history',  // 채널 메시지 읽기 권한
      'groups:read',       // 비공개 채널 목록
      'groups:history',    // 비공개 채널 메시지 읽기
      'im:read',           // DM 목록
      'im:history',        // DM 메시지 읽기
      'mpim:read',         // 그룹 DM 목록
      'mpim:history',      // 그룹 DM 메시지 읽기
      'users:read',
      'team:read',
    ].join(',');

    const url = new URL('https://slack.com/oauth/v2/authorize');
    url.searchParams.set('client_id', clientId || '');
    url.searchParams.set('redirect_uri', redirectUri);
    // user_scope 사용 - Bot이 아닌 User Token으로 접근
    url.searchParams.set('user_scope', userScope);
    url.searchParams.set('state', session.user.id);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Failed to create Slack OAuth URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

