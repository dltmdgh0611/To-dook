'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Service = 'slack' | 'notion' | 'gmail';

interface TestResult {
  service: Service;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  data?: any;
  error?: any;
}

const serviceConfig: Record<Service, { name: string; color: string; icon: string }> = {
  slack: {
    name: 'Slack',
    color: 'bg-purple-500 hover:bg-purple-600',
    icon: '💬',
  },
  notion: {
    name: 'Notion',
    color: 'bg-gray-800 hover:bg-gray-900',
    icon: '📝',
  },
  gmail: {
    name: 'Gmail',
    color: 'bg-red-500 hover:bg-red-600',
    icon: '📧',
  },
};

export default function DevPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<Record<Service, TestResult>>({
    slack: { service: 'slack', status: 'idle' },
    notion: { service: 'notion', status: 'idle' },
    gmail: { service: 'gmail', status: 'idle' },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/landing');
    return null;
  }

  const testService = async (service: Service) => {
    setResults((prev) => ({
      ...prev,
      [service]: { service, status: 'loading' },
    }));

    try {
      const response = await fetch(`/api/dev/test/${service}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API 호출 실패');
      }

      setResults((prev) => ({
        ...prev,
        [service]: {
          service,
          status: 'success',
          message: data.message || 'API 호출 성공',
          data: data.data,
        },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [service]: {
          service,
          status: 'error',
          message: error instanceof Error ? error.message : '알 수 없는 오류',
          error: error instanceof Error ? error.stack : error,
        },
      }));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API 테스트 도구</h1>
          <p className="text-gray-600">OAuth 연동 API를 테스트할 수 있는 QA 도구입니다.</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-medium text-gray-900">{session?.user?.name || '사용자'}</div>
              <div className="text-sm text-gray-500">{session?.user?.email}</div>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(serviceConfig) as Service[]).map((service) => {
            const config = serviceConfig[service];
            const result = results[service];

            return (
              <div
                key={service}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className={`${config.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{config.icon}</span>
                    {getStatusIcon(result.status)}
                  </div>
                  <h3 className="text-xl font-semibold">{config.name}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="mb-4 min-h-[120px]">
                    {result.status === 'idle' && (
                      <p className="text-sm text-gray-500">실제 API를 호출하여 응답을 테스트합니다.</p>
                    )}
                    {result.status === 'loading' && (
                      <p className="text-sm text-blue-600">API 호출 중...</p>
                    )}
                    {result.status === 'success' && (
                      <div className="space-y-3">
                        <p className="text-sm text-green-600 font-medium">{result.message}</p>
                        {result.data && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                            <pre className="text-xs text-green-800 whitespace-pre-wrap break-words">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                    {result.status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                        <p className="text-sm text-red-600 font-medium mb-2">{result.message}</p>
                        {result.error && (
                          <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                            {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => testService(service)}
                    disabled={result.status === 'loading'}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all ${
                      result.status === 'loading'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `${config.color} text-white shadow-sm hover:shadow-md`
                    }`}
                  >
                    {result.status === 'loading' ? '테스트 중...' : 'API 테스트'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            사용 방법
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>먼저 각 서비스를 OAuth로 연결해야 합니다. (설정에서 연결)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>각 서비스의 "API 테스트" 버튼을 클릭하여 실제 API를 호출합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Slack: 채널 목록 조회, Gmail: 이메일 목록 조회, Notion: 페이지 검색</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>응답 데이터가 JSON 형식으로 표시되며, 에러 발생 시 상세 정보를 확인할 수 있습니다.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

