'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import TodoMain from '@/components/Todo/TodoMain';
import ChatPanel from '@/components/Chat/ChatPanel';
import SettingsModal from '@/components/Settings/SettingsModal';
import SubscriptionModal from '@/components/Payment/SubscriptionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { POLAR_PRODUCT_ID } from '@/lib/polar-config';

export default function MainLayout() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language } = useLanguage();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileWarning, setShowMobileWarning] = useState(false);
    
    // 모바일 여부 확인
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            
            // 모바일이고 아직 경고를 보지 않았다면 표시
            if (mobile && !localStorage.getItem('mobileWarningDismissed')) {
                setShowMobileWarning(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);
    const [currentView, setCurrentView] = useState<'todo' | 'card'>('todo');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'integrations' | 'permissions' | 'account'>('integrations');
    const [generateTrigger, setGenerateTrigger] = useState(0);
    const [addTodoTrigger, setAddTodoTrigger] = useState(0);
    // 온보딩 단계: 0 = 완료, 1 = 이름 입력, 2 = 설정 안내, 3 = 새로고침 안내
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [onboardingChecked, setOnboardingChecked] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [nameInput, setNameInput] = useState('');
    
    // 구독 상태 (가입 시 기본값: trial)
    const [subscriptionStatus, setSubscriptionStatus] = useState<'trial' | 'active' | 'cancelled' | 'expired'>('trial');
    const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
    const [subscriptionDaysRemaining, setSubscriptionDaysRemaining] = useState(7);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    
    // 7일 무료체험 남은 일수 계산 (12월 9일까지)
    const calculateDaysRemaining = () => {
        const today = new Date();
        const endDate = new Date('2025-12-07');
        endDate.setHours(23, 59, 59, 999); // 하루 끝까지
        
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? diffDays : 0;
    };
    
    const [daysRemaining, setDaysRemaining] = useState(calculateDaysRemaining());
    
    // 날짜가 바뀔 때마다 남은 일수 업데이트
    useEffect(() => {
        const updateDaysRemaining = () => {
            setDaysRemaining(calculateDaysRemaining());
        };
        
        // 매일 자정에 업데이트
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        let intervalId: NodeJS.Timeout | null = null;
        
        const timeoutId = setTimeout(() => {
            updateDaysRemaining();
            // 이후 매일 자정마다 업데이트
            intervalId = setInterval(updateDaysRemaining, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
        
        return () => {
            clearTimeout(timeoutId);
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);

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

    // Check onboarding status for new users
    useEffect(() => {
        const checkOnboarding = async () => {
            if (status === 'authenticated' && !onboardingChecked) {
                try {
                    const response = await fetch('/api/onboarding');
                    if (response.ok) {
                        const data = await response.json();
                        // displayName 설정
                        if (data.displayName) {
                            setDisplayName(data.displayName);
                        } else if (data.name) {
                            setDisplayName(data.name);
                        }
                        
                        if (!data.onboardingCompleted) {
                            // displayName이 없으면 1단계(이름 입력)부터 시작
                            setOnboardingStep(data.displayName ? 2 : 1);
                        }
                    }
                } catch (error) {
                    console.error('Failed to check onboarding status:', error);
                } finally {
                    setOnboardingChecked(true);
                }
            }
        };
        checkOnboarding();
    }, [status, onboardingChecked]);

    // 구독 상태 확인
    useEffect(() => {
        const checkSubscription = async () => {
            if (status === 'authenticated') {
                try {
                    const response = await fetch('/api/subscription');
                    if (response.ok) {
                        const data = await response.json();
                        setSubscriptionStatus(data.status);
                        setIsSubscriptionActive(data.isActive);
                        setSubscriptionDaysRemaining(data.daysRemaining);
                        // 자동 모달은 뜨지 않음 - 버튼 클릭 시에만 표시
                    }
                } catch (error) {
                    console.error('Failed to check subscription:', error);
                }
            }
        };
        checkSubscription();
    }, [status]);

    // 프리미엄 필요 액션 핸들러 - expired일 때 모달 표시 (trial은 7일간 사용 가능)
    const handlePremiumAction = (action: () => void) => {
        if (subscriptionStatus === 'expired') {
            setShowSubscriptionModal(true);
        } else {
            action();
        }
    };

    const handleNameSubmit = async () => {
        if (!nameInput.trim()) return;
        
        try {
            const response = await fetch('/api/onboarding', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: nameInput.trim() }),
            });
            
            if (response.ok) {
                setDisplayName(nameInput.trim());
                setOnboardingStep(2); // 다음 단계로
            }
        } catch (error) {
            console.error('Failed to save displayName:', error);
        }
    };

    const handleNextOnboardingStep = async () => {
        if (onboardingStep === 2) {
            setOnboardingStep(3);
        } else if (onboardingStep === 3) {
            // 온보딩 완료 처리
            try {
                await fetch('/api/onboarding', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
            } catch (error) {
                console.error('Failed to complete onboarding:', error);
            }
            setOnboardingStep(0);
        }
    };

    const handleSkipOnboarding = async () => {
        try {
            await fetch('/api/onboarding', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: nameInput.trim() || undefined }),
            });
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
        }
        if (nameInput.trim()) {
            setDisplayName(nameInput.trim());
        }
        setOnboardingStep(0);
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/landing' });
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-white">
                <div className="text-gray-500">{getTranslation(language, 'loading')}</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const userInitial = session.user?.name?.charAt(0).toUpperCase() || 'U';
    const userImage = session.user?.image;
    const userName = session.user?.name || getTranslation(language, 'user');
    const userEmail = session.user?.email || '';

    const handleMobileWarningClose = () => {
        setShowMobileWarning(false);
        localStorage.setItem('mobileWarningDismissed', 'true');
    };

    return (
        <div className="flex flex-row h-screen w-screen overflow-hidden bg-white text-gray-900">
            {/* 모바일 경고 모달 */}
            {showMobileWarning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.75.75A2.25 2.25 0 013 12.75m9.75-9.75a2.25 2.25 0 109.75 9.75m-9.75 0a2.25 2.25 0 01-9.75-9.75m9.75 0V3.75M9.75 3.75h4.5m-4.5 0v4.5m4.5-4.5h4.5m-4.5 4.5v4.5m-4.5-4.5h-4.5m4.5 0v-4.5m0 4.5H9.75" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {getTranslation(language, 'mobileWarningTitle')}
                                </h2>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {getTranslation(language, 'mobileWarningMessage')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleMobileWarningClose}
                            className="w-full px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                        >
                            {getTranslation(language, 'mobileWarningContinue')}
                        </button>
                    </div>
                </div>
            )}

            {/* 온보딩 블러 오버레이 */}
            {onboardingStep > 0 && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]" />
            )}

            {/* 온보딩 Step 1: 이름 입력 모달 */}
            {onboardingStep === 1 && (
                <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
                    <div className="bg-[var(--color-primary)] rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
                        <div className="flex items-start gap-3 mb-6">
                            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">👋</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white text-base">{getTranslation(language, 'welcome')}</p>
                                <p className="text-xs text-white/70 mt-0.5">{getTranslation(language, 'step1of3')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/90 mb-5 leading-relaxed">
                            {getTranslation(language, 'welcomeMessage')}
                        </p>
                        
                        <div className="mb-5">
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && nameInput.trim()) {
                                        handleNameSubmit();
                                    }
                                }}
                                placeholder={getTranslation(language, 'enterName')}
                                className="w-full px-4 py-3 text-base bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleSkipOnboarding}
                                className="text-xs text-white/70 hover:text-white transition-colors"
                            >
                                {getTranslation(language, 'skip')}
                            </button>
                            <button
                                onClick={handleNameSubmit}
                                disabled={!nameInput.trim()}
                                className="px-5 py-2 bg-white text-[var(--color-primary)] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {getTranslation(language, 'continue')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 왼쪽 사이드바 (데스크톱) / 하단 네비게이션 (모바일) */}
            <aside className={`${isMobile 
                ? 'fixed bottom-0 left-0 right-0 h-16 border-t flex flex-row justify-around items-center px-4' 
                : 'w-14 border-r flex flex-col items-center justify-between py-3'
            } border-gray-200 bg-[#faf8f3] ${onboardingStep > 0 ? 'z-[60]' : 'z-40'}`}>
                {/* 위쪽 그룹 (데스크톱) / 전체 (모바일) */}
                <div className={`flex ${isMobile ? 'flex-row gap-6' : 'flex-col gap-3'} items-center`}>
                    {/* 로고 - 데스크톱만 */}
                    {!isMobile && (
                        <>
                            <button className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md transition-shadow ${onboardingStep === 0 ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`} disabled={onboardingStep > 0}>
                                <img src="/logo.png" alt="To-Dook Logo" className="w-7 h-7" />
                            </button>
                            <div className="w-6 h-px bg-gray-200" />
                        </>
                    )}
                    
                    {/* 액션 버튼들 */}
                    <button 
                        onClick={() => onboardingStep === 0 && handlePremiumAction(() => setAddTodoTrigger(prev => prev + 1))}
                        className={`w-10 h-10 md:w-9 md:h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md transition-all ${onboardingStep === 0 ? 'hover:bg-[var(--color-primary-hover)] hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                        title={getTranslation(language, 'newTodo')}
                        disabled={onboardingStep > 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-4 md:h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => onboardingStep === 0 && handlePremiumAction(() => setGenerateTrigger(prev => prev + 1))}
                            className={`w-10 h-10 md:w-9 md:h-9 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center transition-all ${onboardingStep === 3 ? 'bg-white ring-4 ring-white/50 shadow-lg' : onboardingStep === 0 ? 'hover:bg-[var(--color-primary)]/10' : 'opacity-50 cursor-not-allowed'}`}
                            title={getTranslation(language, 'generateWithAI')}
                            disabled={onboardingStep > 0 && onboardingStep !== 3}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth={2.5} 
                                stroke="currentColor" 
                                className="w-5 h-5 md:w-4 md:h-4 text-[var(--color-primary)]"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                        
                    {/* 온보딩 Step 3: 새로고침 안내 툴팁 */}
                    {onboardingStep === 3 && (
                        <div className={`${isMobile 
                            ? 'fixed bottom-20 left-4 right-4 z-[70]' 
                            : 'absolute top-0 left-full ml-3 w-80 z-[70]'
                        } bg-[var(--color-primary)] rounded-xl shadow-2xl p-5`}>
                            {!isMobile && (
                                <div className="absolute left-0 top-4 -translate-x-2">
                                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[var(--color-primary)]"></div>
                                </div>
                            )}
                            {isMobile && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[var(--color-primary)]"></div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🔄</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-base">{getTranslation(language, 'generateWithAITitle')}</p>
                                    <p className="text-xs text-white/70 mt-0.5">{getTranslation(language, 'step3of3')}</p>
                                </div>
                            </div>
                            <p className="text-sm text-white/90 mb-4 leading-relaxed">
                                {getTranslation(language, 'generateWithAIDesc')}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white bg-white/20 rounded-lg p-2.5 mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <span>{getTranslation(language, 'accountLinkNote')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={handleSkipOnboarding}
                                    className="text-xs text-white/70 hover:text-white transition-colors"
                                >
                                    {getTranslation(language, 'skip')}
                                </button>
                                <button 
                                    onClick={handleNextOnboardingStep}
                                    className="px-5 py-2 bg-white text-[var(--color-primary)] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {getTranslation(language, 'confirm')}
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
                    
                    {/* 모바일: 채팅 버튼 추가 */}
                    {isMobile && (
                        <button 
                            onClick={() => setIsChatOpen(true)}
                            className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shadow-md transition-all"
                            title="Chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                        </button>
                    )}
                    
                    {/* 모바일: 프로필 버튼 */}
                    {isMobile && (
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    if (onboardingStep === 0 || onboardingStep === 2) {
                                        setIsProfileOpen(!isProfileOpen);
                                    }
                                }}
                                className={`w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold transition-all overflow-hidden ${onboardingStep === 2 ? 'ring-4 ring-white/50 shadow-lg' : onboardingStep === 0 ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                                disabled={onboardingStep > 0 && onboardingStep !== 2}
                            >
                                {userImage ? (
                                    <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                                ) : (
                                    userInitial
                                )}
                            </button>
                            
                            {/* 모바일 온보딩 Step 2: 설정 안내 툴팁 */}
                            {onboardingStep === 2 && (
                                <div className="fixed bottom-20 left-4 right-4 z-[70] bg-[var(--color-primary)] rounded-xl shadow-2xl p-5">
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                        <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[var(--color-primary)]"></div>
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">⚙️</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-base">{getTranslation(language, 'accountLinkTitle')}</p>
                                            <p className="text-xs text-white/70 mt-0.5">{getTranslation(language, 'step2of3')}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/90 mb-4 leading-relaxed">
                                        {getTranslation(language, 'accountLinkDesc')}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <button 
                                            onClick={handleSkipOnboarding}
                                            className="text-xs text-white/70 hover:text-white transition-colors"
                                        >
                                            {getTranslation(language, 'skip')}
                                        </button>
                                        <button 
                                            onClick={handleNextOnboardingStep}
                                            className="px-5 py-2 bg-white text-[var(--color-primary)] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            {getTranslation(language, 'confirm')}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* 모바일 프로필 메뉴 */}
                            {isProfileOpen && onboardingStep === 0 && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[65]" 
                                        onClick={() => setIsProfileOpen(false)}
                                    />
                                    <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-[70]">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="font-semibold text-gray-900">{userName}</p>
                                            <p className="text-xs text-gray-500">{userEmail}</p>
                                        </div>
                                        <div className="py-1">
                                            <button 
                                                onClick={() => {
                                                    setIsProfileOpen(false);
                                                    if (isSubscriptionActive && subscriptionStatus === 'active') {
                                                        // 프리미엄 사용자: 설정의 프리미엄 탭으로 이동
                                                        setSettingsInitialTab('general');
                                                        setIsSettingsOpen(true);
                                                    } else {
                                                        // 비구독자: 결제 페이지로 이동
                                                        if (POLAR_PRODUCT_ID) {
                                                            window.location.href = `/api/checkout/session?products=${encodeURIComponent(POLAR_PRODUCT_ID)}`;
                                                        }
                                                    }
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                                </svg>
                                                <span>
                                                    {isSubscriptionActive && subscriptionStatus === 'active'
                                                        ? (language === 'ko' ? '프리미엄 ✓' : 'Premium ✓')
                                                        : getTranslation(language, 'upgradePlan')
                                                    }
                                                </span>
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
                                                <span>{getTranslation(language, 'settings')}</span>
                                            </button>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                                </svg>
                                                <span>{getTranslation(language, 'logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                {/* 아래쪽 그룹 (데스크톱만) - 프로필 버튼 */}
                {!isMobile && (
                    <div className="relative">
                        <button 
                            onClick={() => {
                                if (onboardingStep === 0 || onboardingStep === 2) {
                                    setIsProfileOpen(!isProfileOpen);
                                }
                            }}
                            className={`w-9 h-9 md:w-8 md:h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold transition-all overflow-hidden ${onboardingStep === 2 ? 'ring-4 ring-white/50 shadow-lg' : onboardingStep === 0 ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={onboardingStep > 0 && onboardingStep !== 2}
                        >
                            {userImage ? (
                                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                userInitial
                            )}
                        </button>

                        {/* 온보딩 Step 2: 설정 안내 툴팁 */}
                        {onboardingStep === 2 && (
                            <div className={`${isMobile 
                                ? 'fixed bottom-20 left-4 right-4 z-[70]' 
                                : 'absolute bottom-0 left-full ml-3 w-80 z-[70]'
                            } bg-[var(--color-primary)] rounded-xl shadow-2xl p-5`}>
                                {!isMobile && (
                                    <div className="absolute left-0 bottom-4 -translate-x-2">
                                        <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[var(--color-primary)]"></div>
                                    </div>
                                )}
                                {isMobile && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                        <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[var(--color-primary)]"></div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">⚙️</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white text-base">{getTranslation(language, 'accountLinkTitle')}</p>
                                        <p className="text-xs text-white/70 mt-0.5">{getTranslation(language, 'step2of3')}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-white/90 mb-5 leading-relaxed">
                                    {getTranslation(language, 'accountLinkDesc')}
                                </p>
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={handleSkipOnboarding}
                                        className="text-xs text-white/70 hover:text-white transition-colors"
                                    >
                                        {getTranslation(language, 'skip')}
                                    </button>
                                    <button 
                                        onClick={handleNextOnboardingStep}
                                        className="px-5 py-2 bg-white text-[var(--color-primary)] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {getTranslation(language, 'confirm')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 프로필 메뉴 */}
                        {isProfileOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-[65]" 
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className={`absolute ${isMobile ? 'bottom-full right-0 mb-2' : 'bottom-full left-full ml-2 mb-2'} w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-[70]`}>
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="font-semibold text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-500">{userEmail}</p>
                            </div>
                            <div className="py-1">
                                <button 
                                    onClick={() => {
                                        setIsProfileOpen(false);
                                        if (isSubscriptionActive && subscriptionStatus === 'active') {
                                            // 프리미엄 사용자: 설정의 프리미엄 탭으로 이동
                                            setSettingsInitialTab('general');
                                            setIsSettingsOpen(true);
                                        } else {
                                            // 비구독자: 결제 페이지로 이동
                                            if (POLAR_PRODUCT_ID) {
                                                window.location.href = `/api/checkout/session?products=${encodeURIComponent(POLAR_PRODUCT_ID)}`;
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                    <span>
                                        {isSubscriptionActive && subscriptionStatus === 'active'
                                            ? (language === 'ko' ? '프리미엄 ✓' : 'Premium ✓')
                                            : getTranslation(language, 'upgradePlan')
                                        }
                                    </span>
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
                                    <span>{getTranslation(language, 'settings')}</span>
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span>{getTranslation(language, 'logout')}</span>
                                </button>
                            </div>
                        </div>
                            </>
                        )}
                    </div>
                )}
            </aside>

            <div className={`flex-1 flex h-full overflow-hidden relative ${isMobile ? 'pb-16' : ''}`}>
                <main className={`h-full overflow-hidden transition-all duration-300 ${
                    !isMobile && isChatOpen ? 'w-[calc(100%-360px)]' : 'w-full'
                }`}>
                    <TodoMain 
                        onToggleChat={() => setIsChatOpen(!isChatOpen)} 
                        isChatOpen={isChatOpen}
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        generateTrigger={generateTrigger}
                        addTodoTrigger={addTodoTrigger}
                        displayName={displayName}
                        onOpenSettings={(tab) => {
                            setSettingsInitialTab(tab || 'general');
                            setIsSettingsOpen(true);
                        }}
                        isMobile={isMobile}
                    />
                </main>

                {/* 채팅 패널 - 데스크톱: 사이드바 / 모바일: 풀스크린 모달 */}
                {isMobile ? (
                    isChatOpen && (
                        <div className="fixed inset-0 z-50 bg-[#faf8f3]">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold">Chat</h2>
                                <button 
                                    onClick={() => setIsChatOpen(false)}
                                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="h-[calc(100%-60px)] overflow-hidden">
                                <ChatPanel />
                            </div>
                        </div>
                    )
                ) : (
                    <aside 
                        className={`absolute top-0 right-0 h-full w-[360px] border-l border-gray-200 bg-[#faf8f3] transition-transform duration-300 ${
                            isChatOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <ChatPanel />
                    </aside>
                )}
            </div>

            {/* 7일 무료체험 배너 - 데스크톱: 왼쪽 아래 사이드바 옆 / 모바일: 숨김 */}
            {!isMobile && onboardingStep === 0 && subscriptionStatus === 'trial' && isSubscriptionActive && subscriptionDaysRemaining > 0 && (
                <div className="fixed bottom-4 left-[72px] z-40 animate-fadeIn">
                    <div className="bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✨</span>
                            <span className="text-sm font-medium">{getTranslation(language, 'freeTrial')}</span>
                        </div>
                        <div className="w-px h-4 bg-white/30" />
                        <span className="text-xs text-white/80">{getTranslation(language, 'daysRemaining', { days: subscriptionDaysRemaining.toString() })}</span>
                    </div>
                </div>
            )}

            {/* 프리미엄 필요 모달 - 버튼 클릭 시 표시 */}
            <SubscriptionModal 
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                initialTab={settingsInitialTab}
            />
        </div>
    );
}
