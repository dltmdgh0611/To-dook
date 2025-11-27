import { Suspense } from "react";
import MainLayout from "@/components/Layout/MainLayout";

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <MainLayout />
    </Suspense>
  );
}

