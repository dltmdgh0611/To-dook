'use client';

import React from 'react';

interface TodoSkeletonProps {
  count?: number;
}

export default function TodoSkeleton({ count = 3 }: TodoSkeletonProps) {
  return (
    <div className="space-y-0">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 border-b border-gray-200 bg-white py-3 animate-pulse"
          style={{
            animationDelay: `${index * 150}ms`,
          }}
        >
          {/* 체크박스 스켈레톤 */}
          <div className="mt-0.5 flex-shrink-0">
            <div className="w-5 h-5 rounded-full bg-gray-200 shimmer" />
          </div>
          
          {/* 콘텐츠 스켈레톤 */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              {/* 제목 스켈레톤 */}
              <div 
                className="h-5 bg-gray-200 rounded shimmer"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
              {/* 소스 버튼 스켈레톤 */}
              <div className="w-16 h-6 bg-gray-200 rounded-md shimmer" />
            </div>
            {/* 날짜 스켈레톤 */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

