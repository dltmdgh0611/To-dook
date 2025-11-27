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
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/oauth/gmail/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', baseUrl));
    }

    const tokens = await tokenResponse.json();

    // Get user email
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    // Update settings
    await prisma.setting.upsert({
      where: { userId: state },
      create: {
        userId: state,
        gmailConnected: true,
        gmailEmail: userInfo.email,
        gmailToken: JSON.stringify(tokens),
      },
      update: {
        gmailConnected: true,
        gmailEmail: userInfo.email,
        gmailToken: JSON.stringify(tokens),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?settings=open&connected=gmail', baseUrl));
  } catch (error) {
    console.error('Gmail OAuth callback error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?error=oauth_error', baseUrl));
  }
}

