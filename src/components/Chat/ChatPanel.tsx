'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';

const recentThreads = {
    ko: [
        { title: 'Ownbrief AI 환영 이메일 요약' },
        { title: '어제 작업 정리' },
        { title: '프로젝트 제안서 검토' },
    ],
    en: [
        { title: 'Ownbrief AI Welcome Email Summary' },
        { title: 'Yesterday\'s Work Summary' },
        { title: 'Project Proposal Review' },
    ],
};

export default function ChatPanel() {
    const { language } = useLanguage();
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="flex h-full flex-col bg-[#faf8f3] text-gray-900">
            <div className="border-b border-gray-200 px-5 py-6 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{getTranslation(language, 'chatTitle')}</span>
                </div>
                <div>
                    <p className="text-2xl font-semibold text-gray-900">{getTranslation(language, 'chatGreeting')}</p>
                    <p className="text-sm text-gray-500 mt-1">{getTranslation(language, 'chatSubtitle')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                <section className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-semibold">{getTranslation(language, 'chatExample')}</p>
                <div className="space-y-2">
                        {recentThreads[language].map((thread) => (
                            <button
                                key={thread.title}
                                className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                <span className="truncate">{thread.title}</span>
                            </button>
                        ))}
                    </div>
                </section>
                </div>

            <div className="border-t border-gray-200 px-5 pb-6 pt-4">
                <div className="relative">
                    <textarea
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
                        placeholder={getTranslation(language, 'chatPlaceholder')}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled
                    />
                    <button 
                        className="absolute bottom-3 right-3 rounded-full bg-gray-300 text-white p-2 cursor-not-allowed"
                        disabled
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12h13.5m0 0l-5.25 5.25M18.75 12l-5.25-5.25" />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">{getTranslation(language, 'chatComingSoon')}</p>
            </div>
        </div>
    );
}
