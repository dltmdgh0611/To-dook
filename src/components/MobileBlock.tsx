'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function MobileBlock() {
  const { language } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // User Agent 확인
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());

      // 화면 크기 확인 (768px 이하)
      const isMobileScreen = window.innerWidth <= 768;

      // 터치 이벤트 지원 여부 확인
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // 모바일로 판단되는 경우
      const mobile = isMobileUserAgent || (isMobileScreen && isTouchDevice);
      
      setIsMobile(mobile);
    };

    checkMobile();
    
    // 화면 크기 변경 시 재확인
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      // 모바일일 때 body 스크롤 막기
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // 모든 키보드 이벤트 차단
      const preventKeyboard = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // 모든 마우스/터치 이벤트 차단
      const preventInteraction = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // 이벤트 리스너 추가
      document.addEventListener('keydown', preventKeyboard, { capture: true, passive: false });
      document.addEventListener('keyup', preventKeyboard, { capture: true, passive: false });
      document.addEventListener('keypress', preventKeyboard, { capture: true, passive: false });
      document.addEventListener('touchstart', preventInteraction, { capture: true, passive: false });
      document.addEventListener('touchmove', preventInteraction, { capture: true, passive: false });
      document.addEventListener('touchend', preventInteraction, { capture: true, passive: false });
      document.addEventListener('click', preventInteraction, { capture: true, passive: false });
      document.addEventListener('mousedown', preventInteraction, { capture: true, passive: false });
      document.addEventListener('mouseup', preventInteraction, { capture: true, passive: false });
      document.addEventListener('contextmenu', preventInteraction, { capture: true, passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        
        // 이벤트 리스너 제거
        document.removeEventListener('keydown', preventKeyboard, { capture: true } as any);
        document.removeEventListener('keyup', preventKeyboard, { capture: true } as any);
        document.removeEventListener('keypress', preventKeyboard, { capture: true } as any);
        document.removeEventListener('touchstart', preventInteraction, { capture: true } as any);
        document.removeEventListener('touchmove', preventInteraction, { capture: true } as any);
        document.removeEventListener('touchend', preventInteraction, { capture: true } as any);
        document.removeEventListener('click', preventInteraction, { capture: true } as any);
        document.removeEventListener('mousedown', preventInteraction, { capture: true } as any);
        document.removeEventListener('mouseup', preventInteraction, { capture: true } as any);
        document.removeEventListener('contextmenu', preventInteraction, { capture: true } as any);
      };
    }
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6"
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseMove={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-20 h-20 mx-auto text-gray-400"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 17.25v1.007a3 3 0 01.879 2.122L10.5 21h3l.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {getTranslation(language, 'mobileBlockTitle')}
        </h1>
        <p className="text-gray-600 mb-2">
          {getTranslation(language, 'mobileBlockMessage')}
        </p>
        <p className="text-sm text-gray-500">
          {getTranslation(language, 'mobileBlockSubMessage')}
        </p>
      </div>
    </div>
  );
}

