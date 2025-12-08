'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { POLAR_PRODUCT_ID } from '@/lib/polar-config';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { language } = useLanguage();
  
  if (!isOpen) return null;
  
  const handleSubscribe = () => {
    if (POLAR_PRODUCT_ID) {
      window.location.href = `/api/checkout/session?products=${encodeURIComponent(POLAR_PRODUCT_ID)}`;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fadeIn relative">
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
        </div>
        
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
          {language === 'ko' ? '프리미엄 7일 무료체험 시작하기' : 'Start 7-Day Free Trial'}
        </h2>
        
        {/* 설명 */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {language === 'ko' 
            ? 'To-Dook의 모든 기능을 무료로 체험해보세요!\n체험 기간이 끝나면 월 $4.99가 결제됩니다.' 
            : 'Try all features of To-Dook for free!\nAfter the trial, $4.99/month will be charged.'}
        </p>
        
        {/* 기능 목록 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {language === 'ko' ? '프리미엄 기능' : 'Premium Features'}
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {language === 'ko' ? '무제한 투두 생성' : 'Unlimited todos'}
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {language === 'ko' ? 'AI 투두 자동 생성' : 'AI-powered todo generation'}
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
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
          {language === 'ko' ? '7일 무료체험 시작하기' : 'Start Free Trial'}
        </button>
        
        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 text-center mt-4">
          {language === 'ko' 
            ? '언제든지 취소 가능 • 7일 무료 후 $4.99/월'
            : 'Cancel anytime • $4.99/month after 7-day free trial'}
        </p>
      </div>
    </div>
  );
}
