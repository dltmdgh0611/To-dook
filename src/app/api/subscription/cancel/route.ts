// 구독 취소 API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: 'cancelled',
        // 만료일은 유지 (기간 끝까지 사용 가능)
      },
    });
    
    return NextResponse.json({
      success: true,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionExpiresAt,
      message: '구독이 취소되었습니다. 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.',
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

