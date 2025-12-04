import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

// GET: 모든 투두 조회
export async function GET() {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const todos = await prisma.todo.findMany({
      where: { userId: session!.user.id },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: 새 투두 생성
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { title, description, dueDate, priority, emoji, tag, tagColor, sources } = body;

    // 현재 가장 작은 order 값 찾기 (aggregate 사용으로 최적화)
    const minOrderResult = await prisma.todo.aggregate({
      where: { userId: session!.user.id },
      _min: { order: true },
    });
    
    const newOrder = minOrderResult._min.order !== null ? minOrderResult._min.order - 1 : 0;

    // 빈 투두 생성 허용 (인라인 편집용)
    const todo = await prisma.todo.create({
      data: {
        title: title || '',
        description,
        dueDate,
        priority,
        emoji,
        tag,
        tagColor,
        sources: sources || null,
        order: newOrder,
        userId: session!.user.id,
      },
    });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: 투두 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }

    // 먼저 권한 확인 (빠른 실패)
    const existing = await prisma.todo.findFirst({
      where: {
        id,
        userId: session!.user.id,
      },
      select: { id: true }, // 최소한의 데이터만 조회
    });

    if (!existing) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // 권한 확인 후 업데이트
    const todo = await prisma.todo.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ todo });
  } catch (error: any) {
    // Prisma 에러 처리
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    console.error('Failed to update todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: 투두 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }

    // 권한 확인과 삭제를 한 번의 쿼리로 처리 (WHERE 절에 userId 포함)
    const result = await prisma.todo.deleteMany({
      where: {
        id,
        userId: session!.user.id, // 권한 확인 포함
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

