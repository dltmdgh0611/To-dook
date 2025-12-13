'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
    const { language } = useLanguage();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    
    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };
    
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

            {/* 섹션 1: 문제 정의 */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-[var(--background-secondary)]">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
                        {language === 'ko' 
                            ? '아직도 대부분의 대표님들은\n많은 시간을 비효율적으로 낭비합니다.'
                            : 'Most founders still waste\na lot of time inefficiently.'}
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 mb-10 md:mb-16 whitespace-pre-line">
                        {language === 'ko'
                            ? '평균적으로 스타트업 대표들은 매일 아침 20-30분을\n여러 앱에 흩어진 정보를 확인하는 데만 씁니다.'
                            : 'On average, startup founders spend 20-30 minutes every morning\njust checking scattered information across multiple apps.'}
                    </p>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-3xl md:text-5xl font-bold text-[var(--color-primary)] mb-2">20-30분</div>
                            <div className="text-sm md:text-base text-gray-500">
                                {language === 'ko' ? '매일 아침 낭비되는 시간' : 'Time wasted every morning'}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-3xl md:text-5xl font-bold text-[var(--color-primary)] mb-2">4개+</div>
                            <div className="text-sm md:text-base text-gray-500">
                                {language === 'ko' ? '매일 아침 확인하는 앱' : 'Apps checked every morning'}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-3xl md:text-5xl font-bold text-[var(--color-primary)] mb-2">70%</div>
                            <div className="text-sm md:text-base text-gray-500">
                                {language === 'ko' ? '인지적 과부하 경험' : 'Experience cognitive overload'}
                            </div>
                        </div>
                    </div>

                    {/* 본문 텍스트 */}
                    <div className="text-base md:text-lg text-gray-600 leading-relaxed space-y-4">
                        <p>
                            {language === 'ko'
                                ? '일정은 Google Calendar에, 업무는 Notion에,'
                                : 'Schedules in Google Calendar, tasks in Notion,'}
                            <br />
                            {language === 'ko'
                                ? '메시지는 Slack에, 이메일은 Gmail에 쌓여갑니다.'
                                : 'messages in Slack, emails piling up in Gmail.'}
                        </p>
                        <p className="text-gray-500 italic">
                            {language === 'ko'
                                ? '매일 아침 스스로에게 묻습니다:'
                                : 'Every morning, you ask yourself:'}
                            <br />
                            <span className="text-gray-700 font-medium">
                                {language === 'ko'
                                    ? '"그래서, 오늘 내가 무슨 일부터 해야 하지?"'
                                    : '"So, what should I do first today?"'}
                            </span>
                        </p>
                        <p className="text-[var(--color-primary)] font-semibold text-lg md:text-xl pt-4">
                            {language === 'ko'
                                ? '투둑이 그 질문에 자동으로 답해드립니다.'
                                : 'Todook automatically answers that question.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* 섹션 2: 핵심 기능 소개 */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            {language === 'ko' ? 'AI 기반 핵심 기능' : 'AI-Powered Core Features'}
                        </h2>
                        <p className="text-base md:text-lg text-gray-500">
                            {language === 'ko'
                                ? '흩어진 데이터에서 실행 가능한 투두로, 단 몇 초 만에'
                                : 'From scattered data to actionable todos, in just seconds'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        {/* 기능 카드 1 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? 'AI 자동 투두 생성' : 'AI Auto Todo'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? 'AI가 Gmail, Notion, Slack을 분석해 오늘 해야 할 일을 자동으로 추출합니다.'
                                    : 'AI analyzes Gmail, Notion, and Slack to extract your daily tasks.'}
                            </p>
                        </div>

                        {/* 기능 카드 2 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '출처 추적' : 'Source Tracking'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '클릭 한 번으로 원본 메시지, 문서, 이메일로 바로 이동합니다.'
                                    : 'One click takes you to the original message, document, or email.'}
                            </p>
                        </div>

                        {/* 기능 카드 3 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '원클릭 새로고침' : 'One-Click Refresh'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '새로고침 버튼 하나로 최신 데이터 기반 투두 리스트를 업데이트합니다.'
                                    : 'Hit refresh and your todo list updates with the latest data.'}
                            </p>
                        </div>

                        {/* 기능 카드 4 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '접근 권한 설정' : 'Access Control'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '특정 Notion 페이지와 Slack 채널만 선택적으로 허용합니다.'
                                    : 'Select specific Notion pages and Slack channels only.'}
                            </p>
                        </div>

                        {/* 기능 카드 5 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '투두 편집' : 'Edit Todos'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '생성된 투두를 자유롭게 수정하고 삭제할 수 있습니다.'
                                    : 'Freely edit and delete generated todos.'}
                            </p>
                        </div>

                        {/* 기능 카드 6 */}
                        <div className="bg-gray-100 rounded-2xl p-5 md:p-6">
                            <svg className="w-6 h-6 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '빠른 처리' : 'Fast Processing'}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '몇 초 만에 여러 앱의 데이터를 분석하고 투두를 생성합니다.'
                                    : 'Analyze data from multiple apps and generate todos in seconds.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 섹션 3: 연동 서비스 */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-[var(--background-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {language === 'ko' ? '원활한 연동' : 'Seamless Integrations'}
                    </h2>
                    <p className="text-base md:text-lg text-gray-500 mb-12 md:mb-16">
                        {language === 'ko'
                            ? '이미 사용 중인 도구들과 투둑이 연결됩니다'
                            : 'Todook connects with the tools you already use'}
                    </p>

                    {/* 연동 서비스 로고 */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-10 md:mb-12">
                        {/* Gmail */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-3 hover:shadow-md transition-shadow">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                                    alt="Gmail" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {language === 'ko' ? '연동됨' : 'Connected'}
                            </span>
                        </div>

                        {/* Notion */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-3 hover:shadow-md transition-shadow">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" 
                                    alt="Notion" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {language === 'ko' ? '연동됨' : 'Connected'}
                            </span>
                        </div>

                        {/* Slack */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-3 hover:shadow-md transition-shadow">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" 
                                    alt="Slack" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                {language === 'ko' ? '연동됨' : 'Connected'}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm md:text-base text-gray-400">
                        {language === 'ko'
                            ? '더 많은 연동 예정: Google Calendar, Jira, Linear...'
                            : 'More integrations coming: Google Calendar, Jira, Linear...'}
                    </p>
                </div>
            </section>

            {/* 섹션 4: How It Works */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            {language === 'ko' ? '이렇게 작동합니다' : 'How It Works'}
                        </h2>
                        <p className="text-base md:text-lg text-gray-500">
                            {language === 'ko' ? '3단계로 간단하게 시작하세요' : 'Get started in 3 simple steps'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                        {/* 스텝 1 */}
                        <div className="relative text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '계정 연결하기' : 'Connect Accounts'}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? 'Gmail, Notion, Slack을 몇 번의 클릭만으로 연결하세요.'
                                    : 'Connect Gmail, Notion, and Slack with just a few clicks.'}
                            </p>
                        </div>

                        {/* 스텝 2 */}
                        <div className="relative text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                {language === 'ko' ? 'AI가 투두 생성' : 'AI Generates Todos'}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '투둑이 데이터를 분석하고 오늘의 투두 리스트를 자동 생성합니다.'
                                    : 'Todook analyzes your data and creates a prioritized todo list.'}
                            </p>
                        </div>

                        {/* 스텝 3 */}
                        <div className="text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                {language === 'ko' ? '집중하고 완료하기' : 'Focus & Complete'}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {language === 'ko'
                                    ? '완료한 일은 체크하고, 언제든 새로고침해서 최신 상태를 유지하세요.'
                                    : 'Check off completed tasks and refresh anytime to stay updated.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 섹션 5: 보안 + CTA 통합 */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-3xl mx-auto text-center">
                    {/* 자물쇠 아이콘 */}
                    <div className="flex justify-center mb-6">
                        <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                        {language === 'ko' ? '기능만큼 강력한 보안' : 'Security as Strong as Our Features'}
                    </h2>
                    
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                        {language === 'ko'
                            ? '고객의 개인정보를 최우선으로 보호합니다. 모든 데이터 전송은 완전히 암호화되며, AI 모델 학습에 데이터가 사용되지 않습니다.'
                            : 'We treat your personal information with the utmost care. All data transmissions are fully encrypted, and providers are prevented from using your data for AI model training.'}
                    </p>

                    <Link
                        href="/login"
                        className="inline-block px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-base font-semibold rounded-full transition-all"
                    >
                        {language === 'ko' ? '무료로 시작하기' : 'Get started - its free'}
                    </Link>
                </div>
            </section>

            {/* 섹션 6: FAQ */}
            <section className="py-16 md:py-28 px-4 md:px-6 lg:px-8 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                            {language === 'ko' ? '자주 묻는 질문' : 'Frequently Asked Questions'}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* FAQ 1 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(0)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko'
                                        ? '투둑이 생성한 투두가 정확하지 않으면 어떻게 하나요?'
                                        : 'What if the todos generated are not accurate?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 0 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 0 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '불필요한 투두는 X 버튼으로 삭제하고, 내용 수정이 필요하면 편집 버튼으로 수정할 수 있습니다. 투둑은 사용자의 피드백을 통해 점점 더 정확해집니다. 많은 피드백 부탁드려요.'
                                        : 'Delete unnecessary todos with the X button, or edit with the edit button. Todook gets more accurate with your feedback.'}
                                </div>
                            )}
                        </div>

                        {/* FAQ 2 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(1)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko' ? '어떤 앱들과 연동되나요?' : 'Which apps can I connect?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 1 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 1 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '현재 Gmail, Notion, Slack과 연동됩니다. Google Calendar, Jira, Linear 등 추가 연동을 준비 중입니다.'
                                        : 'Currently connects with Gmail, Notion, and Slack. Google Calendar, Jira, Linear and more coming soon.'}
                                </div>
                            )}
                        </div>

                        {/* FAQ 3 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(2)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko' ? 'AI가 내 모든 데이터를 볼 수 있나요?' : 'Can AI see all my data?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 2 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 2 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '아니요. 설정에서 Notion의 특정 페이지, Slack의 특정 채널만 접근하도록 범위를 직접 설정할 수 있습니다. 허용하지 않은 데이터에는 AI가 접근하지 않습니다.'
                                        : 'No. You can set specific Notion pages and Slack channels in settings. AI cannot access data you haven\'t allowed.'}
                                </div>
                            )}
                        </div>

                        {/* FAQ 4 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(3)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko' ? '내 데이터가 저장되나요?' : 'Is my data stored?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 3 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 3 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '원본 데이터는 저장되지 않습니다. 민감 정보는 AI가 자동으로 마스킹 처리하며, 마스킹된 구조화 데이터만 저장됩니다.'
                                        : 'Original data is not stored. Sensitive info is auto-masked by AI, and only masked structured data is stored.'}
                                </div>
                            )}
                        </div>

                        {/* FAQ 5 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(4)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko' ? '모바일에서도 사용할 수 있나요?' : 'Can I use it on mobile?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 4 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 4 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '현재는 웹 브라우저에서 사용 가능합니다. 데스크톱 앱과 모바일 앱은 향후 출시 예정입니다.'
                                        : 'Currently available on web browsers. Desktop and mobile apps coming soon.'}
                                </div>
                            )}
                        </div>

                        {/* FAQ 6 */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => toggleFaq(5)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">
                                    {language === 'ko' ? '무료로 사용해볼 수 있나요?' : 'Can I try it for free?'}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === 5 ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openFaq === 5 && (
                                <div className="px-6 pb-5 text-gray-600">
                                    {language === 'ko'
                                        ? '네, 7일간 무료 체험이 가능합니다. 모든 기능을 사용해보신 후 유료 전환 여부를 결정하시면 됩니다.'
                                        : 'Yes, 7-day free trial available. Try all features before deciding to subscribe.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer 회사 정보 */}
            <footer className="py-8 md:py-12 px-4 md:px-6 lg:px-8 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/logo.png" alt="To-Dook Logo" className="w-6 h-6 rounded-lg" />
                            <span className="text-lg font-bold text-gray-900">to-dook</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            ©2025 TODOOK · All rights reserved.
                        </p>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            <p>어센텀 | 대표자: 박영민 | 이메일 : ascentumf4@gmail.com | 대표 전화번호: +82 10-4008-3483</p>
                            <p>사업자 등록번호 : 478-59-01063 | 주소: 경기 성남시 수정구 복정동 495, 6층 어센텀</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Product Hunt 배지 - 우측 하단 고정 */}
            <div className="fixed bottom-4 right-4 z-40 hidden md:block">
                <a 
                    href="https://www.producthunt.com/products/to-dook?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-to-dook" 
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img 
                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045463&theme=light&t=1764772750837" 
                        alt="To-Dook - AI-Powered Auto Generation to-do Application | Product Hunt" 
                        style={{ width: '250px', height: '54px' }} 
                        width="250" 
                        height="54" 
                    />
                </a>
            </div>
        </div>
    );
}
