import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Vercel 서버리스 환경 최적화를 위한 Prisma 클라이언트 설정
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 모든 환경에서 글로벌 인스턴스 재사용 (Vercel 서버리스 최적화)
// 이렇게 하면 서버리스 함수 간에 Prisma 클라이언트 인스턴스를 재사용하여
// 연결 풀을 효율적으로 관리할 수 있습니다.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

