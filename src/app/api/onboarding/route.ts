import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 온보딩 상태 및 사용자 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { displayName: true, name: true },
    });

    let setting = await prisma.setting.findUnique({
      where: { userId: session.user.id },
    });

    // Create default settings if not exists
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      onboardingCompleted: setting.onboardingCompleted,
      displayName: user?.displayName || null,
      name: user?.name || null,
    });
  } catch (error) {
    console.error('Failed to fetch onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 온보딩 완료 처리 (displayName 저장 포함)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { displayName } = body;

    // displayName이 제공되면 User 테이블에 저장
    if (displayName && typeof displayName === 'string' && displayName.trim()) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { displayName: displayName.trim() },
      });
    }

    const setting = await prisma.setting.upsert({
      where: { userId: session.user.id },
      update: { onboardingCompleted: true },
      create: {
        userId: session.user.id,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      onboardingCompleted: setting.onboardingCompleted,
    });
  } catch (error) {
    console.error('Failed to update onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// displayName만 업데이트 (온보딩 스텝 0에서 사용)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { displayName: displayName.trim() },
    });

    return NextResponse.json({
      displayName: user.displayName,
    });
  } catch (error) {
    console.error('Failed to update displayName:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



