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
    
    // 결제 완료 후 구독 활성화 (30일 구독)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 구독
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: 'active', // 결제 후 active 상태
        subscriptionStartedAt: new Date(),
        subscriptionExpiresAt: expiresAt,
      },
    });
    
    console.log(`User ${user.email} subscription activated via payment`);
    
    return NextResponse.json({
      success: true,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionExpiresAt,
      message: '구독이 활성화되었습니다.',
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

