'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 플로팅 내비게이션 바 */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full border border-gray-200 px-6 py-3">
                <div className="flex items-center gap-8">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
                            T
                        </div>
                        <span className="text-lg font-bold text-gray-900">to-dook</span>
                    </Link>

                    {/* 내비게이션 메뉴 */}
                    <div className="hidden md:flex items-center gap-6">
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            기능
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            가이드
                        </button>
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            변경사항
                        </button>
                    </div>

                    {/* 액션 버튼 */}
                    <Link 
                        href="/login"
                        className="px-5 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-full transition-all"
                    >
                        시작하기
                    </Link>
                </div>
            </nav>

            {/* 메인 히어로 섹션 */}
            <main className="pt-48 pb-20 px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* 중앙 정렬 텍스트 */}
                    <div className="text-center space-y-6 mb-16">
                        <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            자동으로 생성되는 to-do
                        </h1>
                        
                        <p className="text-lg text-gray-500">
                            업무 파악부터 자동 정리까지, 더 빠르게 할일을 정리해보세요
                        </p>

                        {/* CTA 버튼 */}
                        <div className="pt-4">
                            <Link 
                                href="/login"
                                className="inline-block px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-lg font-semibold rounded-full transition-all hover:scale-105"
                            >
                                무료로 시작하기
                            </Link>
                        </div>

                        {/* 사용자 수 */}
                        <div className="flex items-center justify-center gap-3 pt-6">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white"></div>
                            </div>
                            <p className="text-sm text-gray-500">
                                900,000명 이상의 지식 탐험가들이 사랑하는 서비스
                            </p>
                        </div>
                    </div>

                    {/* 메인 데모 영역 */}
                    <div className="relative mt-20 flex justify-center overflow-hidden" style={{ height: '600px' }}>
                        {/* 태블릿 컨테이너 */}
                        <div className="relative w-full max-w-4xl z-10 mt-8">
                            {/* 태블릿 뒤 블랙 라운드 사각형 배경 */}
                            <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                <div className="bg-[var(--color-primary)] rounded-[3rem] w-[85%] h-[75%]"></div>
                            </div>

                            {/* 태블릿 베젤 (검은색 테두리) */}
                            <div className="bg-[var(--color-primary)] rounded-[2.5rem] p-3 relative z-10">
                                {/* 태블릿 화면 */}
                                <div className="bg-white rounded-[2rem] overflow-hidden aspect-[4/3] relative">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
                                T
                            </div>
                            <span className="text-lg font-bold text-gray-900">to-dook</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            © 2024 to-dook. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
