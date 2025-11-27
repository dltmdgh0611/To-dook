'use client';

import React from 'react';

type CardSource = 'email' | 'slack' | 'notion';

type CardItem = {
    id: number;
    source: CardSource;
    title: string;
    description: string;
    time: string;
    author?: string;
};

const cardItems: CardItem[] = [
    {
        id: 1,
        source: 'email',
        title: 'Ownbrief AI 환영 이메일',
        description: '안녕하세요! Ownbrief에 오신 것을 환영합니다. 시작하기 가이드를 확인해보세요.',
        time: '10분 전',
        author: 'team@ownbrief.com',
    },
    {
        id: 2,
        source: 'slack',
        title: '#general 채널 메시지',
        description: '오늘 오후 3시 전체 회의가 있습니다. 줌 링크는 채널에 공유되었습니다.',
        time: '30분 전',
        author: 'whiteman',
    },
    {
        id: 3,
        source: 'notion',
        title: '프로젝트 로드맵 업데이트',
        description: 'Q1 로드맵이 업데이트되었습니다. 새로운 기능 제안서를 확인해주세요.',
        time: '1시간 전',
        author: 'Product Team',
    },
    {
        id: 4,
        source: 'email',
        title: '주간 리포트',
        description: '이번 주 프로젝트 진행 상황 요약 및 다음 주 계획입니다.',
        time: '2시간 전',
        author: 'pm@company.com',
    },
    {
        id: 5,
        source: 'slack',
        title: '#dev 채널 메시지',
        description: 'PR 리뷰 요청: 새로운 인증 시스템 구현',
        time: '3시간 전',
        author: 'dongguk',
    },
];

const getSourceIcon = (source: CardSource) => {
    switch (source) {
        case 'email':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            );
        case 'slack':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
            );
        case 'notion':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            );
    }
};

const getSourceLabel = (source: CardSource) => {
    switch (source) {
        case 'email':
            return '이메일';
        case 'slack':
            return 'Slack';
        case 'notion':
            return 'Notion';
    }
};

const getSourceColor = (source: CardSource) => {
    switch (source) {
        case 'email':
            return 'text-blue-500';
        case 'slack':
            return 'text-purple-500';
        case 'notion':
            return 'text-gray-700';
    }
};

export default function CardMain() {
    return (
        <div className="space-y-4">
            {cardItems.map((card) => (
                <div
                    key={card.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-sm hover:border-gray-300 cursor-pointer"
                >
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 ${getSourceColor(card.source)}`}>
                            {getSourceIcon(card.source)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        {getSourceLabel(card.source)}
                                    </span>
                                    {card.author && (
                                        <>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-xs text-gray-500">{card.author}</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">{card.time}</span>
                            </div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">{card.title}</h3>
                            <p className="text-sm leading-relaxed text-gray-600">{card.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

