// 구독 정보 조회 API
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionExpiresAt: true,
        polarCustomerId: true,
        polarSubscriptionId: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      status: user.subscriptionStatus,
      startedAt: user.subscriptionStartedAt,
      expiresAt: user.subscriptionExpiresAt,
      polarCustomerId: user.polarCustomerId,
      polarSubscriptionId: user.polarSubscriptionId,
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
