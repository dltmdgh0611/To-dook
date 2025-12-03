'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#faf8f3]">
      <div className="text-center px-6 max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-8 h-8 text-red-500"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          문제가 발생했습니다
        </h2>
        
        <p className="text-gray-600 mb-6">
          페이지를 로드하는 중 오류가 발생했습니다. 
          다시 시도하거나, 문제가 지속되면 페이지를 새로고침 해주세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors shadow-md hover:shadow-lg"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            페이지 새로고침
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          오류가 계속 발생하면 브라우저 캐시를 삭제하거나 
          다른 브라우저에서 시도해 보세요.
        </p>
      </div>
    </div>
  );
}






