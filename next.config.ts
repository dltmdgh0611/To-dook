import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel 서버리스 환경 최적화
  // Next.js 16에서는 serverExternalPackages로 변경됨
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
