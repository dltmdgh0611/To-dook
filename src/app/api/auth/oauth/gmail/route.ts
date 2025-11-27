import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/oauth/gmail/callback`;
    
    // Debug: Log redirect URI to help with Google Cloud Console configuration
    console.log('Gmail OAuth redirect_uri:', redirectUri);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
    const scope = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId || '');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', session.user.id);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error('Failed to create Gmail OAuth URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

