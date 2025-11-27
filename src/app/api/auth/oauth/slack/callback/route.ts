import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId

    if (!code || !state) {
      const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
      return NextResponse.redirect(new URL('/?error=missing_params', baseUrl));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID || '',
        client_secret: process.env.SLACK_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/oauth/slack/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Slack OAuth response:', JSON.stringify(tokenData, null, 2));

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData);
      const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', baseUrl));
    }

    // user_scope를 사용하면 authed_user.access_token에 User Token이 있음
    // scope를 사용하면 access_token에 Bot Token이 있음
    const userToken = tokenData.authed_user?.access_token;
    const botToken = tokenData.access_token;
    
    // User Token 우선 사용 (사용자 본인의 채널 접근 가능)
    const accessToken = userToken || botToken;
    
    console.log('Using token type:', userToken ? 'User Token' : 'Bot Token');

    // Update settings - 토큰과 팀 ID 저장
    await prisma.setting.upsert({
      where: { userId: state },
      create: {
        userId: state,
        slackConnected: true,
        slackWorkspace: tokenData.team?.name || 'Slack Workspace',
        slackToken: JSON.stringify({
          access_token: accessToken,
          team_id: tokenData.team?.id,
          user_id: tokenData.authed_user?.id,
          token_type: userToken ? 'user' : 'bot',
          original: tokenData,
        }),
      },
      update: {
        slackConnected: true,
        slackWorkspace: tokenData.team?.name || 'Slack Workspace',
        slackToken: JSON.stringify({
          access_token: accessToken,
          team_id: tokenData.team?.id,
          user_id: tokenData.authed_user?.id,
          token_type: userToken ? 'user' : 'bot',
          original: tokenData,
        }),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?settings=open&connected=slack', baseUrl));
  } catch (error) {
    console.error('Slack OAuth callback error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?error=oauth_error', baseUrl));
  }
}

