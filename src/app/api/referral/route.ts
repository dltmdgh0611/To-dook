import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 추천인 코드 생성 함수
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외 (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET: 추천인 코드 조회 (없으면 생성)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, referralCount: true },
    });

    // 추천인 코드가 없으면 생성
    if (!user?.referralCode) {
      let referralCode = generateReferralCode();
      
      // 중복 체크
      let attempts = 0;
      while (attempts < 10) {
        const existing = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (!existing) break;
        referralCode = generateReferralCode();
        attempts++;
      }

      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode },
        select: { referralCode: true, referralCount: true },
      });
    }

    return NextResponse.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
    });
  } catch (error) {
    console.error('Failed to fetch referral code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: 추천인 코드 적용 (온보딩 시)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const code = referralCode.trim().toUpperCase();

    // 자기 자신의 코드인지 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, referredBy: true },
    });

    if (currentUser?.referralCode === code) {
      return NextResponse.json({ error: '자신의 추천 코드는 사용할 수 없습니다.' }, { status: 400 });
    }

    // 이미 추천인이 있는지 확인
    if (currentUser?.referredBy) {
      return NextResponse.json({ error: '이미 추천인 코드를 사용했습니다.' }, { status: 400 });
    }

    // 추천인 코드가 유효한지 확인
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!referrer) {
      return NextResponse.json({ error: '유효하지 않은 추천 코드입니다.' }, { status: 404 });
    }

    // 트랜잭션으로 추천인 적용
    await prisma.$transaction([
      // 현재 사용자에게 추천인 설정
      prisma.user.update({
        where: { id: session.user.id },
        data: { referredBy: code },
      }),
      // 추천인의 추천 수 증가
      prisma.user.update({
        where: { id: referrer.id },
        data: { referralCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to apply referral code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
