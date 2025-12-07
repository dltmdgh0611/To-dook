'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckoutButtonProps {
  productId?: string;
  className?: string;
}

export default function CheckoutButton({ productId, className = '' }: CheckoutButtonProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // Polar Checkout API 호출
      // product_id는 쿼리 파라미터로 전달하거나, 환경 변수에서 가져올 수 있습니다
      const productIdToUse = productId || process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;
      
      if (productIdToUse) {
        const checkoutUrl = `/api/checkout?product_id=${productIdToUse}`;
        window.location.href = checkoutUrl;
      } else {
        // product_id가 없으면 기본 checkout URL로 이동
        // Polar 대시보드에서 설정한 기본 제품을 사용합니다
        const checkoutUrl = `/api/checkout`;
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(language === 'ko' 
        ? '결제 페이지로 이동하는 중 오류가 발생했습니다.' 
        : 'An error occurred while redirecting to checkout.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading 
        ? (language === 'ko' ? '처리 중...' : 'Processing...')
        : (language === 'ko' ? '7일 무료체험 시작하기' : 'Start 7-Day Free Trial')
      }
    </button>
  );
}

