'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

type SettingTab = 'integrations' | 'permissions' | 'account';

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
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingTab>('integrations');
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

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

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
        alert('노션 API 키가 저장되었습니다.');
      } else {
        const error = await response.json();
        alert(error.message || 'API 키 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save Notion API key:', error);
      alert('API 키 저장 중 오류가 발생했습니다.');
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
        alert('권한 설정이 저장되었습니다.');
      }
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert('권한 설정 저장에 실패했습니다.');
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

  if (!isOpen) return null;

  const userName = session?.user?.name || '사용자';
  const userEmail = session?.user?.email || '';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-[800px] max-h-[700px] flex overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-[220px] bg-[#faf8f3] border-r border-gray-200 py-6 flex flex-col">
            {/* User Info */}
            <div className="px-5 pb-5 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{userName}</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium">
                  Free
                </span>
              </div>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'integrations' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                연결 정보
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'permissions' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                권한 설정
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                계정
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {activeTab === 'integrations' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">연결 정보</h2>
                <p className="text-sm text-gray-500 mb-8">외부 서비스와 연결하여 더 많은 기능을 사용하세요.</p>

                <div className="space-y-4">
                  {/* Gmail */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6">
                            <path fill="#EA4335" d="M22 6.25V18.5c0 1.38-1.12 2.5-2.5 2.5h-15C3.12 21 2 19.88 2 18.5V6.25L12 13l10-6.75z"/>
                            <path fill="#FBBC05" d="M2 6.25V5.5C2 4.12 3.12 3 4.5 3h15c.69 0 1.31.28 1.76.73L12 13 2 6.25z"/>
                            <path fill="#34A853" d="M21.26 3.73c.45.45.74 1.08.74 1.77v.75L12 13 2 6.25V5.5c0-.69.28-1.31.73-1.76L12 13l9.26-9.27z"/>
                            <path fill="#4285F4" d="M2 6.25V18.5c0 1.38 1.12 2.5 2.5 2.5h1v-7.25L2 6.25zM22 6.25V18.5c0 1.38-1.12 2.5-2.5 2.5h-1v-7.25l3.5-7.5z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Gmail</h3>
                          <p className="text-xs text-gray-500">
                            {settings?.gmailConnected 
                              ? settings.gmailEmail || '연결됨'
                              : '이메일을 연동하여 일정 관리하기'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings?.gmailConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium">
                            연결됨
                          </span>
                        )}
                        <button
                          onClick={() => settings?.gmailConnected ? handleDisconnect('gmail') : handleConnect('gmail')}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            settings?.gmailConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.gmailConnected ? '연결 해제' : '연결하기'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Slack */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6">
                            <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/>
                            <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/>
                            <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.522v6.312z"/>
                            <path fill="#ECB22E" d="M15.164 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.164 24a2.528 2.528 0 0 1-2.521-2.522v-2.522h2.521zm0-1.27a2.528 2.528 0 0 1-2.521-2.522 2.528 2.528 0 0 1 2.521-2.521h6.314A2.528 2.528 0 0 1 24 15.164a2.528 2.528 0 0 1-2.522 2.522h-6.314z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Slack</h3>
                          <p className="text-xs text-gray-500">
                            {settings?.slackConnected 
                              ? settings.slackWorkspace || '연결됨'
                              : 'Slack과 연동하여 알림 받기'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings?.slackConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium">
                            연결됨
                          </span>
                        )}
                        <button
                          onClick={() => settings?.slackConnected ? handleDisconnect('slack') : handleConnect('slack')}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            settings?.slackConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.slackConnected ? '연결 해제' : '연결하기'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notion OAuth */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6">
                            <path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.373.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.746.327-.746.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.22.186c-.094-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.264 1.033l13.075-.94c1.588-.14 1.96-.047 2.95.654l4.015 2.805c.653.467.84.607.84 1.12v15.478c0 1.026-.373 1.54-1.682 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747L1.77 17.89c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.287-1.634z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Notion (OAuth)</h3>
                          <p className="text-xs text-gray-500">
                            {settings?.notionConnected 
                              ? settings.notionWorkspace || '연결됨'
                              : 'Notion과 연동하여 데이터 동기화'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings?.notionConnected && (
                          <span className="text-xs px-2 py-1 bg-[#e8f5e9] text-[#4caf50] rounded-full font-medium">
                            연결됨
                          </span>
                        )}
                        <button
                          onClick={() => settings?.notionConnected ? handleDisconnect('notion') : handleConnect('notion')}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            settings?.notionConnected
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                          }`}
                        >
                          {settings?.notionConnected ? '연결 해제' : '연결하기'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notion API Key */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600">
                          <path fill="currentColor" d="M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Notion API 키 (직접 입력)</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          Internal Integration의 API 키를 직접 입력할 수 있습니다.
                          <a 
                            href="https://www.notion.so/my-integrations" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline ml-1"
                          >
                            Integration 만들기 →
                          </a>
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={notionApiKeyInput}
                            onChange={(e) => setNotionApiKeyInput(e.target.value)}
                            onFocus={() => {
                              if (notionApiKeyInput === '••••••••••••••••') {
                                setNotionApiKeyInput('');
                              }
                            }}
                            placeholder="secret_xxxxxxxxxxxxx"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                          />
                          <button
                            onClick={handleSaveNotionApiKey}
                            disabled={savingApiKey || !notionApiKeyInput || notionApiKeyInput === '••••••••••••••••'}
                            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingApiKey ? '저장 중...' : '저장'}
                          </button>
                        </div>
                        {settings?.notionApiKey && (
                          <p className="text-xs text-green-600 mt-2">✓ API 키가 설정되어 있습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">권한 설정</h2>
                <p className="text-sm text-gray-500 mb-8">
                  AI가 데이터를 가져올 채널과 페이지를 선택하세요. 선택하지 않으면 모든 데이터를 가져옵니다.
                </p>

                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Slack 채널 선택 */}
                    {settings?.slackConnected && (
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
                          </svg>
                          Slack 채널
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          선택된 채널: {selectedSlackChannels.length === 0 ? '전체' : `${selectedSlackChannels.length}개`}
                        </p>
                        
                        {slackChannelList.length === 0 ? (
                          <p className="text-sm text-gray-400">채널 목록을 불러올 수 없습니다.</p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {slackChannelList.map(channel => (
                              <label 
                                key={channel.id}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSlackChannels.includes(channel.id)}
                                  onChange={() => toggleSlackChannel(channel.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                />
                                <span className="text-sm text-gray-700">
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
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path fill="currentColor" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.373.466z"/>
                          </svg>
                          Notion 페이지/데이터베이스
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">
                          선택된 페이지: {selectedNotionPages.length === 0 ? '전체' : `${selectedNotionPages.length}개`}
                        </p>
                        
                        {notionPageList.length === 0 ? (
                          <p className="text-sm text-gray-400">페이지 목록을 불러올 수 없습니다. Integration에 페이지를 공유했는지 확인하세요.</p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {notionPageList.map(page => (
                              <label 
                                key={page.id}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedNotionPages.includes(page.id)}
                                  onChange={() => toggleNotionPage(page.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                                />
                                <span className="text-sm text-gray-700">
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
                      className="w-full py-3 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '권한 설정 저장'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">계정</h2>
                <p className="text-sm text-gray-500 mb-8">계정 설정을 관리합니다.</p>

                {/* Account Info */}
                <div className="border border-gray-200 rounded-xl p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">계정 정보</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">이름</span>
                      <span className="text-gray-900">{userName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">이메일</span>
                      <span className="text-gray-900">{userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                  <h3 className="font-medium text-red-700 mb-2">위험 구역</h3>
                  <p className="text-sm text-red-600 mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      deleteConfirm 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {deleteConfirm ? '정말 삭제하시겠습니까?' : '계정 삭제'}
                  </button>
                  {deleteConfirm && (
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
