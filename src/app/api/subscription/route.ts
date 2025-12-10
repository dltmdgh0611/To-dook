// 구독 상태 확인 API
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
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // 체험 기간 또는 구독 만료 체크
    const now = new Date();
    let status = user.subscriptionStatus;
    let isActive = false;
    let daysRemaining = 0;
    
    // expired 상태는 무조건 비활성화 (만료일과 관계없이)
    if (status === 'expired') {
      isActive = false;
      daysRemaining = 0;
    }
    // cancelled 상태는 만료일까지 사용 가능
    else if (status === 'cancelled') {
      if (user.subscriptionExpiresAt) {
        const expiresAt = new Date(user.subscriptionExpiresAt);
        if (expiresAt > now) {
          isActive = true;
          daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // 취소된 구독도 만료일이 지나면 expired로 변경
          status = 'expired';
          isActive = false;
          await prisma.user.update({
            where: { email: session.user.email },
            data: { subscriptionStatus: 'expired' },
          });
        }
      } else {
        isActive = false;
      }
    }
    // trial 또는 active 상태는 만료일 체크
    else if (status === 'trial' || status === 'active') {
      if (user.subscriptionExpiresAt) {
        const expiresAt = new Date(user.subscriptionExpiresAt);
        
        if (expiresAt > now) {
          // 아직 유효
          isActive = true;
          daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // 만료됨
          status = 'expired';
          isActive = false;
          
          // DB 업데이트 (만료 상태로)
          await prisma.user.update({
            where: { email: session.user.email },
            data: { subscriptionStatus: 'expired' },
          });
        }
      } else if (status === 'trial' && user.subscriptionStartedAt) {
        // trial 상태인데 만료일이 없으면 시작일 기준 7일 체험
        const trialEnd = new Date(user.subscriptionStartedAt);
        trialEnd.setDate(trialEnd.getDate() + 7);
        
        if (trialEnd > now) {
          isActive = true;
          daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          status = 'expired';
          isActive = false;
          
          // DB 업데이트
          await prisma.user.update({
            where: { email: session.user.email },
            data: { subscriptionStatus: 'expired' },
          });
        }
      } else if (status === 'active') {
        // 활성 구독이지만 만료일이 없는 경우 (평생 구독 등)
        isActive = true;
        daysRemaining = -1; // 무제한
      } else {
        // trial인데 시작일도 없으면 비활성화
        isActive = false;
      }
    }
    
    return NextResponse.json({
      status,
      isActive,
      daysRemaining,
      subscriptionStartedAt: user.subscriptionStartedAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



