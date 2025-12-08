'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [activating, setActivating] = useState(true);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 구독 활성화 API 호출
  const activateSubscription = useCallback(async () => {
    try {
      setActivating(true);
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
      });
      
      if (response.ok) {
        setActivated(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to activate subscription');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('Failed to activate subscription');
    } finally {
      setActivating(false);
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('checkout_id');
    setCheckoutId(id);
    
    // 결제 완료 후 구독 상태 즉시 활성화
    if (id) {
      activateSubscription();
    } else {
      setActivating(false);
    }
  }, [searchParams, activateSubscription]);

  // 자동 리다이렉트 (3초 후)
  useEffect(() => {
    if (activated) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activated, router]);

  return (
    <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {activating ? (
          <>
            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'ko' ? '구독 활성화 중...' : 'Activating subscription...'}
              </h1>
              <p className="text-gray-600">
                {language === 'ko' ? '잠시만 기다려주세요.' : 'Please wait a moment.'}
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'ko' ? '결제는 완료되었습니다' : 'Payment completed'}
              </h1>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '구독 활성화 중 문제가 발생했습니다. 잠시 후 자동으로 활성화됩니다.'
                  : 'There was an issue activating your subscription. It will be activated automatically shortly.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="inline-block px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl transition-all"
            >
              {language === 'ko' ? '홈으로 돌아가기' : 'Return to Home'}
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto bg-[var(--color-primary)] rounded-2xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-8 h-8 text-white"
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
                {language === 'ko' ? '프리미엄이 활성화되었습니다!' : 'Premium Activated!'}
              </h1>
              <p className="text-gray-600">
                {language === 'ko' 
                  ? '7일 무료 체험이 시작되었습니다. 체험 기간이 끝나면 월 $4.99가 자동 결제됩니다.'
                  : 'Your 7-day free trial has started. After the trial, $4.99/month will be charged automatically.'}
              </p>
            </div>

            {/* 7일 트라이얼 + 월간 결제 안내 */}
            <div className="bg-white rounded-xl p-4 text-left shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                {language === 'ko' ? '구독 일정' : 'Subscription Schedule'}
              </h3>
              <ul className="text-sm text-gray-600 space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">✓</span>
                  {language === 'ko' ? '오늘: 7일 무료 체험 시작' : 'Today: 7-day free trial starts'}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center flex-shrink-0">2</span>
                  {language === 'ko' ? '7일 후: 첫 결제 ($4.99)' : 'In 7 days: First charge ($4.99)'}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center flex-shrink-0">3</span>
                  {language === 'ko' ? '이후: 매월 자동 갱신' : 'After: Monthly auto-renewal'}
                </li>
              </ul>
            </div>

            {checkoutId && (
              <p className="text-xs text-gray-400">
                ID: {checkoutId}
              </p>
            )}

            <div className="space-y-2">
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl transition-all"
              >
                {language === 'ko' ? '시작하기' : 'Get Started'}
              </button>
              <p className="text-xs text-gray-400">
                {language === 'ko' ? '3초 후 자동으로 이동합니다...' : 'Redirecting in 3 seconds...'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
