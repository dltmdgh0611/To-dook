import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/oauth/notion/callback`;

    const url = new URL('https://api.notion.com/v1/oauth/authorize');
    url.searchParams.set('client_id', clientId || '');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('owner', 'user');
    url.searchParams.set('state', session.user.id);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Failed to create Notion OAuth URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

