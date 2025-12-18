'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import GmailAuthGuideModal from './GmailAuthGuideModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';

type SettingTab = 'general' | 'integrations' | 'permissions' | 'subscription' | 'share' | 'account';

interface SettingData {
  gmailConnected: boolean;
  gmailEmail: string | null;
  slackConnected: boolean;
  slackWorkspace: string | null;
  slackChannels: string[] | null;
  notionConnected: boolean;
  notionWorkspace: string | null;
  notionApiKey: string | null;
  notionPages: string[] | null;
}

interface SubscriptionData {
  status: 'none' | 'trial' | 'active' | 'cancelled' | 'expired';
  isActive: boolean;
  daysRemaining: number;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

interface NotionPage {
  id: string;
  title: string;
  type: 'page' | 'database';
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingTab;
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'integrations' }: SettingsModalProps) {
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingTab>(initialTab);
  const [settings, setSettings] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // 권한 설정 상태
  const [slackChannelList, setSlackChannelList] = useState<SlackChannel[]>([]);
  const [notionPageList, setNotionPageList] = useState<NotionPage[]>([]);
  const [selectedSlackChannels, setSelectedSlackChannels] = useState<string[]>([]);
  const [selectedNotionPages, setSelectedNotionPages] = useState<string[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // 노션 API 키 직접 입력
  const [notionApiKeyInput, setNotionApiKeyInput] = useState('');
  const [savingApiKey, setSavingApiKey] = useState(false);
  
  // Gmail 연동 안내 모달
  const [showGmailGuide, setShowGmailGuide] = useState(false);
  
  // 구독 상태
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  
  // 공유 상태
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      fetchSubscription();
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const fetchSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancelConfirm) {
      setCancelConfirm(true);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      if (response.ok) {
        await fetchSubscription();
        alert(getTranslation(language, 'subscriptionCancelled'));
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert(getTranslation(language, 'subscriptionCancelFailed'));
    } finally {
      setLoading(false);
      setCancelConfirm(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'permissions' && settings) {
      loadPermissionData();
    }
  }, [activeTab, settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSelectedSlackChannels(data.slackChannels || []);
        setSelectedNotionPages(data.notionPages || []);
        if (data.notionApiKey) {
          setNotionApiKeyInput('••••••••••••••••');
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const loadPermissionData = async () => {
    setLoadingPermissions(true);
    try {
      // 슬랙 채널 목록 가져오기
      if (settings?.slackConnected) {
        const slackRes = await fetch('/api/settings/slack/channels');
        if (slackRes.ok) {
          const data = await slackRes.json();
          setSlackChannelList(data.channels || []);
        }
      }
      
      // 노션 페이지 목록 가져오기
      if (settings?.notionConnected || settings?.notionApiKey) {
        const notionRes = await fetch('/api/settings/notion/pages');
        if (notionRes.ok) {
          const data = await notionRes.json();
          setNotionPageList(data.pages || []);
        }
      }
    } catch (error) {
      console.error('Failed to load permission data:', error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleConnect = async (provider: 'gmail' | 'slack' | 'notion') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`);
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider: 'gmail' | 'slack' | 'notion') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/disconnect/${provider}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchSettings();
      }
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotionApiKey = async () => {
    if (!notionApiKeyInput || notionApiKeyInput === '••••••••••••••••') return;
    
    setSavingApiKey(true);
    try {
      const response = await fetch('/api/settings/notion/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: notionApiKeyInput }),
      });
      
      if (response.ok) {
        await fetchSettings();
        setNotionApiKeyInput('••••••••••••••••');
        alert(getTranslation(language, 'apiKeySaved'));
      } else {
        const error = await response.json();
        alert(error.message || getTranslation(language, 'permissionsSaveFailed'));
      }
    } catch (error) {
      console.error('Failed to save Notion API key:', error);
      alert(getTranslation(language, 'permissionsSaveFailed'));
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slackChannels: selectedSlackChannels.length > 0 ? selectedSlackChannels : null,
          notionPages: selectedNotionPages.length > 0 ? selectedNotionPages : null,
        }),
      });
      
      if (response.ok) {
        await fetchSettings();
        alert(getTranslation(language, 'permissionsSaved'));
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert(getTranslation(language, 'permissionsSaveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      });
      if (response.ok) {
        await signOut({ callbackUrl: '/landing' });
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  const toggleSlackChannel = (channelId: string) => {
    setSelectedSlackChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleNotionPage = (pageId: string) => {
    setSelectedNotionPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  // 할 일 목록 텍스트 생성
  const getTodoListText = async (): Promise<string> => {
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        const todos = data.todos || [];
        const activeTodos = todos.filter((t: { completed: boolean }) => !t.completed);
        
        if (activeTodos.length === 0) {
          return '';
        }
        
        const today = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        let text = language === 'ko' 
          ? `📝 오늘의 할 일 (${today})\n\n`
          : `📝 Today's Todos (${today})\n\n`;
        
        activeTodos.forEach((todo: { emoji?: string; title: string; dueDate?: string }, index: number) => {
          const emoji = todo.emoji || '•';
          text += `${emoji} ${todo.title}`;
          if (todo.dueDate) {
            text += ` (${todo.dueDate})`;
          }
          text += '\n';
        });
        
        text += language === 'ko' 
          ? '\n\n📌 Powered by OwnDesk'
          : '\n\n📌 Powered by OwnDesk';
        
        return text;
      }
    } catch (error) {
      console.error('Failed to fetch todos for sharing:', error);
    }
    return '';
  };

  // 네이버 블로그 공유
  const handleShareNaver = async () => {
    const text = await getTodoListText();
    if (!text) {
      setShareMessage(getTranslation(language, 'noTodosToShare'));
      setTimeout(() => setShareMessage(''), 3000);
      return;
    }
    
    const title = encodeURIComponent(language === 'ko' ? '오늘의 할 일 목록' : 'Today\'s Todo List');
    const contents = encodeURIComponent(text);
    const url = `https://blog.naver.com/PostWriteForm.naver?title=${title}&contents=${contents}`;
    window.open(url, '_blank');
  };

  // 인스타그램 공유 (클립보드 복사)
  const handleShareInstagram = async () => {
    const text = await getTodoListText();
    if (!text) {
      setShareMessage(getTranslation(language, 'noTodosToShare'));
      setTimeout(() => setShareMessage(''), 3000);
      return;
    }
    
    try {
      await navigator.clipboard.writeText(text);
      setShareMessage(getTranslation(language, 'copySuccess'));
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // 카카오톡 공유
  const handleShareKakao = async () => {
    const text = await getTodoListText();
    if (!text) {
      setShareMessage(getTranslation(language, 'noTodosToShare'));
      setTimeout(() => setShareMessage(''), 3000);
      return;
    }
    
    // 카카오톡 공유 (웹에서는 카카오링크 URL 스킴 사용)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
    window.open(kakaoUrl, '_blank');
  };

  if (!isOpen) return null;

  const userName = session?.user?.name || getTranslation(language, 'user');
  const userEmail = session?.user?.email || '';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[800px] h-[90vh] md:h-auto md:max-h-[700px] flex flex-col md:flex-row overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - 모바일에서도 보이도록 */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 md:top-6 md:right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Sidebar - 데스크톱 */}
          <div className="hidden md:flex w-[220px] bg-[#faf8f3] border-r border-gray-200 py-6 flex-col flex-shrink-0">
            {/* User Info */}
            <div className="px-5 pb-5 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{userName}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  subscription?.isActive && subscription?.status === 'active'
                    ? 'bg-[var(--color-primary)] text-white'
                    : subscription?.status === 'trial' && subscription?.isActive
                    ? 'bg-[#f5f0e8] text-[var(--color-primary)]'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {subscription?.isActive && subscription?.status === 'active'
                    ? 'Premium'
                    : subscription?.status === 'trial' && subscription?.isActive
                    ? 'Trial'
                    : 'Free'
                  }
                </span>
              </div>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'general' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {getTranslation(language, 'general')}
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'integrations' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {getTranslation(language, 'connections')}
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'permissions' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {getTranslation(language, 'permissions')}
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'subscription' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {language === 'ko' ? '프리미엄' : 'Premium'}
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'share' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {getTranslation(language, 'share')}
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {getTranslation(language, 'account')}
              </button>
            </nav>
          </div>

          {/* Mobile Header & Tabs */}
          <div className="md:hidden bg-[#faf8f3] border-b border-gray-200 pt-12 pb-3 px-4 flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-gray-900 text-sm">{userName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                subscription?.isActive && subscription?.status === 'active'
                  ? 'bg-[var(--color-primary)] text-white'
                  : subscription?.status === 'trial' && subscription?.isActive
                  ? 'bg-[#f5f0e8] text-[var(--color-primary)]'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {subscription?.isActive && subscription?.status === 'active'
                  ? 'Premium'
                  : subscription?.status === 'trial' && subscription?.isActive
                  ? 'Trial'
                  : 'Free'
                }
              </span>
            </div>
            {/* Tab Navigation */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'general' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {getTranslation(language, 'general')}
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'integrations' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {getTranslation(language, 'connections')}
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'permissions' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {getTranslation(language, 'permissions')}
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'subscription' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {language === 'ko' ? '프리미엄' : 'Premium'}
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'share' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {getTranslation(language, 'share')}
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                {getTranslation(language, 'account')}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">

            {activeTab === 'general' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'general')}</h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">{getTranslation(language, 'generalDesc')}</p>

                <div className="space-y-3 md:space-y-4">
                  {/* Language Selection */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <h3 className="font-medium text-gray-900 mb-1 text-sm md:text-base">{getTranslation(language, 'language')}</h3>
                    <p className="text-xs text-gray-500 mb-3 md:mb-4">{getTranslation(language, 'languageDesc')}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLanguage('ko')}
                        className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          language === 'ko'
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getTranslation(language, 'korean')}
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          language === 'en'
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getTranslation(language, 'english')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'connections')}</h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">{getTranslation(language, 'connectionsDesc')}</p>

                <div className="space-y-3 md:space-y-4">
                  {/* Slack */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6">
                            <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
                            <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
                            <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.522v6.312z"/>
                            <path fill="#ECB22E" d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.528 2.528 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.521h6.314A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.314z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'slack')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {settings?.slackConnected 
                              ? settings.slackWorkspace || getTranslation(language, 'gmailConnected')
                              : getTranslation(language, 'slackDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 md:ml-0">
                        {settings?.slackConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium hidden md:inline">
                            {getTranslation(language, 'gmailConnected')}
                          </span>
                        )}
                        <button
                          onClick={() => settings?.slackConnected ? handleDisconnect('slack') : handleConnect('slack')}
                          disabled={loading}
                          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            settings?.slackConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.slackConnected ? getTranslation(language, 'disconnect') : getTranslation(language, 'connect')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notion OAuth */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6">
                            <path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.373.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.746.327-.746.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.22.186c-.094-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.264 1.033l13.075-.94c1.588-.14 1.96-.047 2.95.654l4.015 2.805c.653.467.84.607.84 1.12v15.478c0 1.026-.373 1.54-1.682 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747L1.77 17.89c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.287-1.634z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'notionOAuth')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {settings?.notionConnected 
                              ? settings.notionWorkspace || getTranslation(language, 'gmailConnected')
                              : getTranslation(language, 'notionDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 md:ml-0">
                        {settings?.notionConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium hidden md:inline">
                            {getTranslation(language, 'gmailConnected')}
                          </span>
                        )}
                        <button
                          onClick={() => settings?.notionConnected ? handleDisconnect('notion') : handleConnect('notion')}
                          disabled={loading}
                          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            settings?.notionConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.notionConnected ? getTranslation(language, 'disconnect') : getTranslation(language, 'connect')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notion API Key */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-gray-600">
                          <path fill="currentColor" d="M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 text-sm md:text-base">
                          {getTranslation(language, 'notionApiKey')}
                          <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {getTranslation(language, 'notionApiKeyDesc')}
                          <a 
                            href="https://www.notion.so/my-integrations" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-1"
                          >
                            {getTranslation(language, 'createIntegration')}
                          </a>
                        </p>
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="text"
                            value={notionApiKeyInput}
                            onChange={(e) => setNotionApiKeyInput(e.target.value)}
                            onFocus={() => {
                              if (notionApiKeyInput === '••••••••••••••••') {
                                setNotionApiKeyInput('');
                              }
                            }}
                            placeholder={getTranslation(language, 'apiKeyPlaceholder')}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                          <button
                            onClick={handleSaveNotionApiKey}
                            disabled={savingApiKey || !notionApiKeyInput || notionApiKeyInput === '••••••••••••••••'}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingApiKey ? getTranslation(language, 'saving') : getTranslation(language, 'save')}
                          </button>
                        </div>
                        {settings?.notionApiKey && (
                          <p className="text-xs text-green-600 mt-2">{getTranslation(language, 'apiKeySaved')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gmail - 맨 아래 */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6">
                            <path fill="#EA4335" d="M22 6.25V18.5c0 1.38-1.12 2.5-2.5 2.5h-15C3.12 21 2 19.88 2 18.5V6.25L12 13l10-6.75z"/>
                            <path fill="#FBBC05" d="M2 6.25V5.5C2 4.12 3.12 3 4.5 3h15c.69 0 1.31.28 1.76.73L12 13 2 6.25z"/>
                            <path fill="#34A853" d="M21.26 3.73c.45.45.74 1.08.74 1.77v.75L12 13 2 6.25V5.5c0-.69.28-1.31.73-1.76L12 13l9.26-9.27z"/>
                            <path fill="#4285F4" d="M2 6.25V18.5c0 1.38 1.12 2.5 2.5 2.5h1v-7.25L2 6.25zM22 6.25V18.5c0 1.38-1.12 2.5-2.5 2.5h-1v-7.25l3.5-7.5z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'gmail')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {settings?.gmailConnected 
                              ? settings.gmailEmail || getTranslation(language, 'gmailConnected')
                              : getTranslation(language, 'gmailDesc')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-12 md:ml-0">
                        {settings?.gmailConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium hidden md:inline">
                            {getTranslation(language, 'gmailConnected')}
                          </span>
                        )}
                        <button
                          onClick={() => settings?.gmailConnected ? handleDisconnect('gmail') : setShowGmailGuide(true)}
                          disabled={loading}
                          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            settings?.gmailConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.gmailConnected ? getTranslation(language, 'disconnect') : getTranslation(language, 'connect')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 보안 안내 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1.5 text-sm md:text-base">
                          {language === 'ko' ? '데이터 보안' : 'Data Security'}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {language === 'ko'
                            ? '고객의 개인정보를 최우선으로 보호합니다. 모든 데이터 전송은 완전히 암호화되며, 원본 데이터는 저장되지 않습니다. AI 모델 학습에 데이터가 사용되지 않습니다.'
                            : 'We treat your personal information with the utmost care. All data transmissions are fully encrypted, and your original data is never stored. Your data is not used for AI model training.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'permissions')}</h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">
                  {getTranslation(language, 'permissionsDesc')}
                </p>

                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    {/* Slack 채널 선택 */}
                    {settings?.slackConnected && (
                      <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                        <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5">
                            <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
                          </svg>
                          {getTranslation(language, 'slackChannels')}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {selectedSlackChannels.length === 0 
                            ? getTranslation(language, 'selectedChannelsAll')
                            : getTranslation(language, 'selectedChannels', { count: `${selectedSlackChannels.length}` })}
                        </p>
                        
                        {slackChannelList.length === 0 ? (
                          <p className="text-xs md:text-sm text-gray-400">{getTranslation(language, 'cannotLoadPages')}</p>
                        ) : (
                          <div className="max-h-40 md:max-h-48 overflow-y-auto space-y-1 md:space-y-2">
                            {slackChannelList.map(channel => (
                              <label 
                                key={channel.id}
                                className="flex items-center gap-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSlackChannels.includes(channel.id)}
                                  onChange={() => toggleSlackChannel(channel.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                />
                                <span className="text-xs md:text-sm text-gray-700">
                                  {channel.is_private ? '🔒' : '#'} {channel.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notion 페이지 선택 */}
                    {(settings?.notionConnected || settings?.notionApiKey) && (
                      <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                        <h3 className="font-medium text-gray-900 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5">
                            <path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.373.466z"/>
                          </svg>
                          {getTranslation(language, 'notionPages')}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {selectedNotionPages.length === 0 
                            ? getTranslation(language, 'selectedPagesAll')
                            : getTranslation(language, 'selectedPages', { count: `${selectedNotionPages.length}` })}
                        </p>
                        
                        {notionPageList.length === 0 ? (
                          <p className="text-xs md:text-sm text-gray-400">{getTranslation(language, 'cannotLoadPages')}</p>
                        ) : (
                          <div className="max-h-40 md:max-h-48 overflow-y-auto space-y-1 md:space-y-2">
                            {notionPageList.map(page => (
                              <label 
                                key={page.id}
                                className="flex items-center gap-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedNotionPages.includes(page.id)}
                                  onChange={() => toggleNotionPage(page.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                />
                                <span className="text-xs md:text-sm text-gray-700">
                                  {page.type === 'database' ? '📊' : '📄'} {page.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 저장 버튼 */}
                    <button
                      onClick={handleSavePermissions}
                      disabled={loading}
                      className="w-full py-2.5 md:py-3 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                    >
                      {loading ? getTranslation(language, 'saving') : getTranslation(language, 'savePermissions')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {language === 'ko' ? '프리미엄 구독' : 'Premium Subscription'}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">
                  {language === 'ko' ? '구독 상태를 확인하고 관리하세요.' : 'Check and manage your subscription status.'}
                </p>

                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    {/* 현재 구독 상태 */}
                    <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-900 text-sm md:text-base">
                          {language === 'ko' ? '현재 플랜' : 'Current Plan'}
                        </h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          subscription.status === 'active' 
                            ? 'bg-[var(--color-primary)] text-white'
                            : subscription.status === 'trial'
                            ? 'bg-[#f5f0e8] text-[var(--color-primary)]'
                            : subscription.status === 'cancelled'
                            ? 'bg-gray-200 text-gray-600'
                            : subscription.status === 'expired'
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {subscription.status === 'active' && (language === 'ko' ? '프리미엄' : 'Premium')}
                          {subscription.status === 'trial' && (language === 'ko' ? '체험 중' : 'Trial')}
                          {subscription.status === 'cancelled' && (language === 'ko' ? '취소됨' : 'Cancelled')}
                          {subscription.status === 'expired' && (language === 'ko' ? '만료됨' : 'Expired')}
                          {subscription.status === 'none' && (language === 'ko' ? '무료' : 'Free')}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {subscription.isActive && subscription.daysRemaining > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {subscription.status === 'trial' 
                                ? (language === 'ko' ? '체험 남은 기간' : 'Trial Days Left')
                                : (language === 'ko' ? '결제일까지' : 'Until Next Billing')
                              }
                            </span>
                            <span className="text-gray-900 font-medium">
                              {subscription.daysRemaining === -1 
                                ? (language === 'ko' ? '무제한' : 'Unlimited')
                                : `${subscription.daysRemaining}${language === 'ko' ? '일' : ' days'}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {subscription.subscriptionExpiresAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {subscription.status === 'trial'
                                ? (language === 'ko' ? '첫 결제 예정일' : 'First Billing Date')
                                : (language === 'ko' ? '다음 결제일' : 'Next Billing Date')
                              }
                            </span>
                            <span className="text-gray-900">
                              {new Date(subscription.subscriptionExpiresAt).toLocaleDateString(
                                language === 'ko' ? 'ko-KR' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </span>
                          </div>
                        )}
                        
                        {subscription.isActive && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {language === 'ko' ? '월간 요금' : 'Monthly Price'}
                            </span>
                            <span className="text-gray-900 font-medium">$4.99/월</span>
                          </div>
                        )}
                        
                        {subscription.subscriptionStartedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              {language === 'ko' ? '가입일' : 'Joined On'}
                            </span>
                            <span className="text-gray-900">
                              {new Date(subscription.subscriptionStartedAt).toLocaleDateString(
                                language === 'ko' ? 'ko-KR' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 구독 일정 안내 (체험 중일 때만) */}
                    {subscription.status === 'trial' && subscription.isActive && (
                      <div className="bg-[var(--color-primary)] rounded-xl p-4">
                        <h3 className="font-medium text-white mb-3 text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                          </div>
                          {language === 'ko' ? '구독 일정' : 'Subscription Schedule'}
                        </h3>
                        <ul className="text-sm text-white/90 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                            <span>{language === 'ko' ? '현재: 7일 무료 체험 이용 중' : 'Now: Using 7-day free trial'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            <span>
                              {subscription.subscriptionExpiresAt 
                                ? (language === 'ko' 
                                    ? `${new Date(subscription.subscriptionExpiresAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}: 첫 결제 ($4.99)`
                                    : `${new Date(subscription.subscriptionExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: First charge ($4.99)`)
                                : (language === 'ko' ? '체험 종료 후: 첫 결제 ($4.99)' : 'After trial: First charge ($4.99)')
                              }
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                            <span>{language === 'ko' ? '이후: 매월 자동 갱신 ($4.99/월)' : 'After: Monthly auto-renewal ($4.99/mo)'}</span>
                          </li>
                        </ul>
                        <p className="text-xs text-white/60 mt-3">
                          {language === 'ko' 
                            ? '💡 체험 기간 내 취소하면 결제되지 않습니다.'
                            : '💡 Cancel during trial to avoid charges.'}
                        </p>
                      </div>
                    )}

                    {/* 프리미엄 기능 */}
                    {subscription.isActive && (
                      <div className="bg-[#faf8f3] border border-gray-200 rounded-xl p-4">
                        <h3 className="font-medium text-gray-900 mb-3 text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </div>
                          {language === 'ko' ? '프리미엄 기능 활성화됨' : 'Premium Features Enabled'}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {language === 'ko' ? '무제한 투두 생성' : 'Unlimited Todos'}
                          </li>
                          <li className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {language === 'ko' ? 'AI 투두 자동 생성' : 'AI Todo Generation'}
                          </li>
                          <li className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[var(--color-primary)]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {language === 'ko' ? '이메일/슬랙/노션 연동' : 'Email/Slack/Notion Integration'}
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* 구독 안내 (비활성 상태: none 또는 expired) */}
                    {!subscription.isActive && (subscription.status === 'none' || subscription.status === 'expired') && (
                      <div className="bg-[var(--color-primary)] rounded-xl p-4 md:p-5">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">
                              {language === 'ko' ? '프리미엄 7일 무료체험' : '7-Day Free Trial'}
                            </h3>
                            <p className="text-xs text-white/60 mt-0.5">
                              {language === 'ko' ? '모든 기능을 무료로 체험하세요' : 'Try all features for free'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-white/80 mb-4">
                          {language === 'ko' 
                            ? '7일간 무료로 체험 후 월 $4.99가 결제됩니다.'
                            : 'Free for 7 days, then $4.99/month.'}
                        </p>
                        <button
                          onClick={() => {
                            const productId = '059ba064-2ab9-4219-a66a-1615e9c4af1c';
                            window.location.href = `/api/checkout/session?products=${encodeURIComponent(productId)}`;
                          }}
                          className="w-full py-2.5 bg-white text-[var(--color-primary)] rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                        >
                          {language === 'ko' ? '7일 무료체험 시작하기' : 'Start Free Trial'}
                        </button>
                      </div>
                    )}

                    {/* 구독 취소 (활성 상태일 때만) */}
                    {subscription.isActive && subscription.status === 'active' && (
                      <div className="border border-gray-200 rounded-xl p-4 md:p-5">
                        <h3 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                          {language === 'ko' ? '구독 관리' : 'Manage Subscription'}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                          {language === 'ko' 
                            ? '구독을 취소하면 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.'
                            : 'If you cancel, you can still use the service until the end of your current billing period.'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelSubscription}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              cancelConfirm 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {cancelConfirm 
                              ? (language === 'ko' ? '정말 취소하기' : 'Confirm Cancel')
                              : (language === 'ko' ? '구독 취소' : 'Cancel Subscription')
                            }
                          </button>
                          {cancelConfirm && (
                            <button
                              onClick={() => setCancelConfirm(false)}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              {language === 'ko' ? '아니오' : 'No'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'ko' ? '구독 정보를 불러올 수 없습니다.' : 'Unable to load subscription info.'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'share' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'share')}</h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">{getTranslation(language, 'shareDesc')}</p>

                {/* 공유 성공/실패 메시지 */}
                {shareMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {shareMessage}
                  </div>
                )}

                <div className="space-y-3 md:space-y-4">
                  {/* 네이버 블로그 공유 */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#03C75A] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'shareWithNaver')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {getTranslation(language, 'shareWithNaverDesc')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleShareNaver}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors bg-[#03C75A] text-white hover:bg-[#02B350] ml-12 md:ml-0"
                      >
                        {getTranslation(language, 'share')}
                      </button>
                    </div>
                  </div>

                  {/* 인스타그램 공유 */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'shareWithInstagram')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {getTranslation(language, 'shareWithInstagramDesc')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleShareInstagram}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors text-white hover:opacity-90 ml-12 md:ml-0"
                        style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                      >
                        {language === 'ko' ? '복사하기' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* 카카오톡 공유 */}
                  <div className="border border-gray-200 rounded-xl p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#FEE500] flex items-center justify-center flex-shrink-0">
                          <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill="#3C1E1E">
                            <path d="M12 3c-5.52 0-10 3.59-10 8.03 0 2.77 1.81 5.21 4.55 6.62-.2.74-.73 2.68-.84 3.1-.13.52.19.51.41.37.17-.11 2.72-1.85 3.83-2.6.66.09 1.35.14 2.05.14 5.52 0 10-3.59 10-8.03S17.52 3 12 3z"/>
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">{getTranslation(language, 'shareWithKakao')}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {getTranslation(language, 'shareWithKakaoDesc')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleShareKakao}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F5DC00] ml-12 md:ml-0"
                      >
                        {getTranslation(language, 'share')}
                      </button>
                    </div>
                  </div>

                  {/* 사용 안내 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1.5 text-sm md:text-base">
                          {language === 'ko' ? '공유 안내' : 'Sharing Guide'}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {language === 'ko'
                            ? '완료되지 않은 할 일 목록이 공유됩니다. 인스타그램의 경우 텍스트가 클립보드에 복사되며, 스토리에 붙여넣기하여 사용할 수 있습니다.'
                            : 'Your incomplete todo list will be shared. For Instagram, the text will be copied to your clipboard, which you can paste into your story.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'account')}</h2>
                <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-8">{getTranslation(language, 'accountDesc')}</p>

                {/* Account Info */}
                <div className="border border-gray-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 md:mb-3 text-sm md:text-base">{getTranslation(language, 'accountInfo')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">{getTranslation(language, 'name')}</span>
                      <span className="text-gray-900 truncate ml-2">{userName}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-500">{getTranslation(language, 'email')}</span>
                      <span className="text-gray-900 truncate ml-2">{userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-xl p-3 md:p-4 bg-red-50">
                  <h3 className="font-medium text-red-700 mb-2 text-sm md:text-base">{getTranslation(language, 'dangerZone')}</h3>
                  <p className="text-xs md:text-sm text-red-600 mb-3 md:mb-4">
                    {getTranslation(language, 'deleteAccountDesc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                        deleteConfirm 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {deleteConfirm ? getTranslation(language, 'deleteConfirm') : getTranslation(language, 'deleteAccount')}
                    </button>
                    {deleteConfirm && (
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {getTranslation(language, 'cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gmail 연동 안내 모달 */}
      <GmailAuthGuideModal
        isOpen={showGmailGuide}
        onConfirm={() => {
          setShowGmailGuide(false);
          handleConnect('gmail');
        }}
        onCancel={() => setShowGmailGuide(false)}
      />
    </>
  );
}
