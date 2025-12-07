import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API 라우트에서 세션을 가져오고 인증을 확인하는 헬퍼 함수
 * @returns 세션 정보 또는 null (인증 실패 시)
 */
export async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return session;
}

/**
 * 인증이 필요한 API 라우트에서 사용하는 래퍼
 * 인증 실패 시 401 응답을 반환
 */
export async function requireAuth() {
  const session = await getAuthenticatedSession();
  
  if (!session) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  
  return {
    error: null,
    session,
  };
}



