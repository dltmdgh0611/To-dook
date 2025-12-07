'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { POLAR_PRODUCT_ID } from '@/lib/polar-config';

interface SubscriptionModalProps {
  isOpen: boolean;
  daysRemaining?: number;
  status: 'trial' | 'expired' | 'cancelled';
}

export default function SubscriptionModal({ isOpen, daysRemaining = 0, status }: SubscriptionModalProps) {
  const { language } = useLanguage();
  
  if (!isOpen) return null;
  
  const handleSubscribe = () => {
    if (POLAR_PRODUCT_ID) {
      window.location.href = `/api/checkout?products=${encodeURIComponent(POLAR_PRODUCT_ID)}`;
    }
  };
  
  const isExpired = status === 'expired' || status === 'cancelled';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fadeIn">
        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isExpired ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isExpired ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.75 3.75c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H2.625a1.125 1.125 0 00-1.125 1.125v8.25zM7.5 15h9" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-yellow-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        </div>
        
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
          {isExpired 
            ? (language === 'ko' ? '무료 체험이 종료되었습니다' : 'Free Trial Ended')
            : (language === 'ko' ? `무료 체험 ${daysRemaining}일 남음` : `${daysRemaining} Days Left in Trial`)
          }
        </h2>
        
        {/* 설명 */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {isExpired
            ? (language === 'ko' 
                ? 'To-Dook의 모든 기능을 계속 사용하시려면 구독을 시작해주세요.' 
                : 'Subscribe now to continue using all features of To-Dook.')
            : (language === 'ko'
                ? '체험 기간이 곧 종료됩니다. 구독하시면 모든 기능을 계속 사용하실 수 있습니다.'
                : 'Your trial is ending soon. Subscribe to keep using all features.')
          }
        </p>
        
        {/* 가격 정보 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">
              {language === 'ko' ? '월간 구독' : 'Monthly Subscription'}
            </span>
            <span className="text-2xl font-bold text-[var(--color-primary)]">$4.99</span>
          </div>
          <ul className="text-sm text-gray-500 space-y-1">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {language === 'ko' ? '무제한 투두 생성' : 'Unlimited todos'}
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {language === 'ko' ? 'AI 투두 자동 생성' : 'AI-powered todo generation'}
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {language === 'ko' ? 'Gmail, Slack, Notion 연동' : 'Gmail, Slack, Notion integration'}
            </li>
          </ul>
        </div>
        
        {/* 버튼 */}
        <button
          onClick={handleSubscribe}
          className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {language === 'ko' ? '지금 구독하기' : 'Subscribe Now'}
        </button>
        
        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 text-center mt-4">
          {language === 'ko' 
            ? '언제든지 취소할 수 있습니다. 7일 무료 체험 후 결제가 시작됩니다.'
            : 'Cancel anytime. Payment starts after 7-day free trial.'}
        </p>
      </div>
    </div>
  );
}

