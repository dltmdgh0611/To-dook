// 구독 활성화 API (결제 완료 후 호출)
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
    
    // 7일 무료 체험 (트라이얼)으로 시작
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 트라이얼
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: 'trial', // 트라이얼로 시작
        subscriptionStartedAt: new Date(),
        subscriptionExpiresAt: expiresAt,
      },
    });
    
    console.log(`User ${user.email} trial activated via success page`);
    
    return NextResponse.json({
      success: true,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionExpiresAt,
      message: '7일 무료 체험이 시작되었습니다.',
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

