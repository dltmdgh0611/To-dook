'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('checkout_id');
    setCheckoutId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'ko' ? '결제가 완료되었습니다!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600">
            {language === 'ko' 
              ? '7일 무료 체험을 시작하실 수 있습니다. 체험 기간이 끝나면 월 $4.99의 구독이 자동으로 시작됩니다.'
              : 'You can now start your 7-day free trial. After the trial period, a monthly subscription of $4.99 will automatically begin.'}
          </p>
        </div>

        {checkoutId && (
          <p className="text-sm text-gray-500">
            Checkout ID: {checkoutId}
          </p>
        )}

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-full transition-all"
        >
          {language === 'ko' ? '홈으로 돌아가기' : 'Return to Home'}
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

