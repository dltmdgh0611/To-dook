import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 온보딩 완료 여부 확인
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    });
  } catch (error) {
    console.error('Failed to fetch onboarding status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 온보딩 완료 처리
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

