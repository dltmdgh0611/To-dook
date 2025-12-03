'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
    const { language } = useLanguage();
    
    return (
        <div className="min-h-screen bg-white">
            {/* 플로팅 내비게이션 바 */}
            <nav className="fixed top-3 md:top-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full border border-gray-200 px-3 md:px-6 py-2 md:py-3 w-[calc(100%-24px)] md:w-auto md:max-w-fit">
                <div className="flex items-center justify-between gap-2 md:gap-8">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                        <img src="/logo.png" alt="To-Dook Logo" className="w-5 h-5 md:w-7 md:h-7 rounded-lg" />
                        <span className="text-sm md:text-lg font-bold text-gray-900">to-dook</span>
                    </Link>

                    {/* 내비게이션 메뉴 - 데스크톱만 */}
                    <div className="hidden md:flex items-center gap-6">
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            {language === 'ko' ? '기능' : 'Features'}
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            {language === 'ko' ? '가이드' : 'Guide'}
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            {language === 'ko' ? '변경사항' : 'Changelog'}
                        </button>
                    </div>

                    {/* 액션 버튼 */}
                    <Link 
                        href="/login"
                        className="px-3 md:px-5 py-1.5 md:py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs md:text-sm font-medium rounded-full transition-all flex-shrink-0"
                    >
                        {language === 'ko' ? '시작하기' : 'Get Started'}
                    </Link>
                </div>
            </nav>

            {/* 메인 히어로 섹션 */}
            <main className="pt-28 md:pt-48 pb-12 md:pb-20 px-4 md:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* 중앙 정렬 텍스트 */}
                    <div className="text-center space-y-4 md:space-y-6 mb-10 md:mb-16">
                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            {language === 'ko' ? '자동으로 생성되는 to-do' : 'Auto-generated to-do'}
                        </h1>
                        
                        <p className="text-base md:text-lg text-gray-500 px-4 md:px-0">
                            {language === 'ko' 
                                ? '업무 파악부터 자동 정리까지, 더 빠르게 할일을 정리해보세요' 
                                : 'From task discovery to auto-organization, manage your todos faster'}
                        </p>

                        {/* CTA 버튼 */}
                        <div className="pt-2 md:pt-4">
                            <Link 
                                href="/login"
                                className="inline-block px-6 md:px-8 py-3 md:py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-base md:text-lg font-semibold rounded-full transition-all hover:scale-105"
                            >
                                {language === 'ko' ? '무료로 시작하기' : 'Get Started Free'}
                            </Link>
                        </div>

                        {/* 사용자 수 */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 pt-4 md:pt-6">
                            <div className="flex -space-x-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white"></div>
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 text-center">
                                {language === 'ko' 
                                    ? '10000+ 건 이상의 자동화 투두 생성' 
                                    : '10,000+ automated todos created'}
                            </p>
                        </div>
                    </div>

                    {/* 메인 데모 영역 */}
                    <div className="relative mt-10 md:mt-20 flex justify-center overflow-hidden h-[300px] md:h-[600px]">
                        {/* 태블릿 컨테이너 */}
                        <div className="relative w-full max-w-4xl z-10 mt-4 md:mt-8 px-4 md:px-0">
                            {/* 태블릿 뒤 블랙 라운드 사각형 배경 */}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                <div className="bg-[var(--color-primary)] rounded-[1.5rem] md:rounded-[3rem] w-[85%] h-[75%]"></div>
                            </div>

                            {/* 태블릿 베젤 (검은색 테두리) */}
                            <div className="bg-[var(--color-primary)] rounded-[1.25rem] md:rounded-[2.5rem] p-2 md:p-3 relative z-10">
                                {/* 태블릿 화면 */}
                                <div className="bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden aspect-[16/10] relative">
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
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 md:py-12 px-4 md:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="To-Dook Logo" className="w-6 h-6 rounded-lg" />
                            <span className="text-lg font-bold text-gray-900">to-dook</span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-500">
                            © 2025 to-dook. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
