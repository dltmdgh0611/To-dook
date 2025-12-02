'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 언어 설정 로드
    const loadLanguage = async () => {
      try {
        // 로컬 스토리지에서 저장된 언어 확인
        const savedLanguage = localStorage.getItem('language') as Language | null;
        
        if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
          setLanguageState(savedLanguage);
          setIsLoading(false);
          return;
        }
        
        // 저장된 언어가 없으면 IP 기반으로 국가 확인
        const geoResponse = await fetch('/api/geo');
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const defaultLang: Language = geoData.isKorea ? 'ko' : 'en';
          setLanguageState(defaultLang);
          // 기본 언어를 로컬 스토리지에 저장하지 않음 (사용자가 명시적으로 선택한 경우만 저장)
        }
      } catch (error) {
        console.error('Failed to load language:', error);
        // 에러 발생 시 기본값은 한국어
        setLanguageState('ko');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // HTML lang 속성 업데이트
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // 언어 변경 시 HTML lang 속성 업데이트
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

