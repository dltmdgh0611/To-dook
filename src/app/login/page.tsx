'use client';

import React from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
    const { language } = useLanguage();
    
    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    const handleEmailLogin = () => {
        alert(language === 'ko' ? '준비중입니다' : 'Coming soon');
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen overflow-auto md:overflow-hidden">
            {/* 왼쪽 태블릿 섹션 - 모바일에서는 숨김 */}
            <div className="hidden md:flex w-1/2 bg-white items-center justify-center p-12 relative">
                <div className="relative w-full max-w-2xl">
                    {/* 태블릿 뒤 짙은 회색 라운드 사각형 배경 (태블릿 반 정도 크기) */}
                    <div className="absolute inset-0 -z-10 flex items-center justify-center">
                        <div className="bg-[#2d2d2d] rounded-[3rem] w-[50%] h-[50%]"></div>
                    </div>

                    {/* 태블릿 베젤 */}
                    <div className="bg-[#2d2d2d] rounded-[2.5rem] p-3 relative z-10">
                        {/* 태블릿 화면 */}
                        <div className="bg-white rounded-[2rem] overflow-hidden aspect-[16/10] relative">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            >
                                <source src="/siyeon.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오른쪽 로그인 섹션 */}
            <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 min-h-screen md:min-h-0">
                <div className="w-full max-w-md space-y-6 md:space-y-8">
                    {/* 로고 */}
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                            T
                        </div>
                        <span className="text-xl font-bold text-gray-900">to-dook</span>
                    </div>

                    {/* 제목 */}
                    <div className="space-y-3 text-center md:text-left">
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                            {language === 'ko' ? '자동으로 정리되는 할 일 관리' : 'Auto-organized task management'}
                        </h1>
                        <p className="text-gray-500 mt-4">
                            {language === 'ko' ? '무료로 시작하기' : 'Start for free'}
                        </p>
                    </div>

                    {/* 로그인 버튼들 */}
                    <div className="space-y-3">
                        <button 
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-gray-700 font-medium">
                                {language === 'ko' ? 'Google로 계속하기' : 'Continue with Google'}
                            </span>
                        </button>

                        <button 
                            onClick={handleEmailLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span className="text-gray-700 font-medium">
                                {language === 'ko' ? '이메일로 계속하기' : 'Continue with Email'}
                            </span>
                        </button>
                    </div>

                    {/* 약관 */}
                    <div className="text-center text-xs text-gray-400 space-y-2 pb-8 md:pb-0">
                        <p>
                            {language === 'ko' 
                                ? '계속 진행하시면 아래 정책을 이해하고 동의하는 것으로 간주됩니다.' 
                                : 'By continuing, you agree to our policies below.'}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="#" className="hover:text-gray-600 transition-colors">
                                {language === 'ko' ? '이용약관' : 'Terms of Service'}
                            </Link>
                            <Link href="#" className="hover:text-gray-600 transition-colors">
                                {language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

