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

    const clientId = process.env.NOTION_CLIENT_ID || '';
    const clientSecret = process.env.NOTION_CLIENT_SECRET || '';
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/oauth/notion/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Notion token exchange failed:', tokenData);
      const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', baseUrl));
    }

    // Update settings
    await prisma.setting.upsert({
      where: { userId: state },
      create: {
        userId: state,
        notionConnected: true,
        notionWorkspace: tokenData.workspace_name || 'Notion Workspace',
        notionToken: JSON.stringify(tokenData),
      },
      update: {
        notionConnected: true,
        notionWorkspace: tokenData.workspace_name || 'Notion Workspace',
        notionToken: JSON.stringify(tokenData),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?settings=open&connected=notion', baseUrl));
  } catch (error) {
    console.error('Notion OAuth callback error:', error);
    const baseUrl = process.env.NEXTAUTH_URL || request.url.split('/api')[0];
    return NextResponse.redirect(new URL('/?error=oauth_error', baseUrl));
  }
}

