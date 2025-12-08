// 구독 활성화 API (수동)
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
    
    // 30일 후 만료일 설정
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: 'active',
        subscriptionStartedAt: new Date(),
        subscriptionExpiresAt: expiresAt,
      },
    });
    
    return NextResponse.json({
      success: true,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionExpiresAt,
    });
  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

