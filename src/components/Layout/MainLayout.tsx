'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import TodoMain from '@/components/Todo/TodoMain';
import ChatPanel from '@/components/Chat/ChatPanel';
import SettingsModal from '@/components/Settings/SettingsModal';

const dockPrimary: { label: string; icon: string }[] = [];

const dockSecondary = [
    { label: '검색', icon: '⌕' },
    { label: '설정', icon: '⚙︎' },
];

export default function MainLayout() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [currentView, setCurrentView] = useState<'todo' | 'card'>('todo');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [generateTrigger, setGenerateTrigger] = useState(0);
    const [addTodoTrigger, setAddTodoTrigger] = useState(0);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/landing');
        }
    }, [status, router]);

    // Open settings modal from URL params (after OAuth callback)
    useEffect(() => {
        if (searchParams.get('settings') === 'open') {
            setIsSettingsOpen(true);
            // Clean up URL
            router.replace('/', { scroll: false });
        }
    }, [searchParams, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/landing' });
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-white">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const userInitial = session.user?.name?.charAt(0).toUpperCase() || 'U';
    const userImage = session.user?.image;
    const userName = session.user?.name || '사용자';
    const userEmail = session.user?.email || '';

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900">
            <aside className="w-14 border-r border-gray-200 bg-[#faf8f3] flex flex-col items-center justify-between py-3">
                <div className="flex flex-col items-center gap-3">
                    <button className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow">
                        O
                    </button>
                    <div className="w-6 h-px bg-gray-200" />
                    <button 
                        onClick={() => setAddTodoTrigger(prev => prev + 1)}
                        className="w-9 h-9 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all"
                        title="새 할 일 추가"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => setGenerateTrigger(prev => prev + 1)}
                        className="w-9 h-9 rounded-full border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 flex items-center justify-center transition-all"
                        title="AI로 할 일 생성"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2.5} 
                            stroke="currentColor" 
                            className="w-4 h-4 text-[var(--color-primary)]"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col items-center gap-2 relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold hover:shadow-lg transition-all overflow-hidden"
                    >
                        {userImage ? (
                            <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            userInitial
                        )}
                    </button>
                    
                    {isProfileOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute bottom-full left-full ml-2 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="font-semibold text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{userEmail}</p>
                                </div>
                                <div className="py-1">
                                    <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                        </svg>
                                        <span>업그레이드 플랜</span>
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setIsSettingsOpen(true);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>설정</span>
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                        </svg>
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex h-full overflow-hidden relative">
                <main className={`h-full overflow-hidden transition-all duration-300 ${
                    isChatOpen ? 'w-[calc(100%-360px)]' : 'w-full'
                }`}>
                    <TodoMain 
                        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
                        isChatOpen={isChatOpen}
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        generateTrigger={generateTrigger}
                        addTodoTrigger={addTodoTrigger}
                    />
                </main>

                <aside 
                    className={`absolute top-0 right-0 h-full w-[360px] border-l border-gray-200 bg-[#faf8f3] transition-transform duration-300 ${
                        isChatOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <ChatPanel />
                </aside>
            </div>

            {/* Settings Modal */}
            <SettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
            />
        </div>
    );
}
