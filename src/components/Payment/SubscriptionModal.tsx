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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--color-primary)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md animate-fadeIn relative">
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {language === 'ko' ? '프리미엄 7일 무료체험' : '7-Day Free Trial'}
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              {language === 'ko' ? '모든 기능을 무료로 체험하세요' : 'Try all features for free'}
            </p>
          </div>
        </div>
        
        {/* 설명 */}
        <p className="text-sm text-white/80 mb-5 leading-relaxed">
          {language === 'ko' 
            ? 'To-Dook의 프리미엄 기능을 7일간 무료로 체험해보세요. 체험 기간이 끝나면 월 $4.99가 결제됩니다.' 
            : 'Try To-Dook premium features free for 7 days. After the trial, $4.99/month will be charged.'}
        </p>
        
        {/* 기능 목록 */}
        <div className="bg-white/10 rounded-xl p-4 mb-5">
          <ul className="text-sm text-white/90 space-y-2.5">
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              {language === 'ko' ? '무제한 투두 생성' : 'Unlimited todos'}
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              {language === 'ko' ? 'AI 투두 자동 생성' : 'AI-powered todo generation'}
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              {language === 'ko' ? 'Gmail, Slack, Notion 연동' : 'Gmail, Slack, Notion integration'}
            </li>
          </ul>
        </div>
        
        {/* 가격 */}
        <div className="flex items-center justify-between mb-5 px-1">
          <span className="text-white/60 text-sm">
            {language === 'ko' ? '7일 후 월간 요금' : 'Monthly price after trial'}
          </span>
          <span className="text-white font-bold text-lg">$4.99</span>
        </div>
        
        {/* 버튼 */}
        <button
          onClick={handleSubscribe}
          className="w-full py-3 bg-white text-[var(--color-primary)] font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          {language === 'ko' ? '7일 무료체험 시작하기' : 'Start Free Trial'}
        </button>
        
        {/* 안내 문구 */}
        <p className="text-xs text-white/50 text-center mt-4">
          {language === 'ko' 
            ? '언제든지 취소 가능'
            : 'Cancel anytime'}
        </p>
      </div>
    </div>
  );
}
