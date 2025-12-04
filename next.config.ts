import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Vercel 서버리스 환경 최적화
  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // 빌드 최적화
  swcMinify: true,
};

export default nextConfig;
