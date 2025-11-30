'use client';

import React from 'react';

interface GmailAuthGuideModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GmailAuthGuideModal({ isOpen, onConfirm, onCancel }: GmailAuthGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gmail 연동 안내</h2>
              <p className="text-sm text-gray-500">진행하기 전에 아래 내용을 확인해주세요</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Warning Image */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <img 
              src="/gmailerror.png" 
              alt="Google에서 확인하지 않은 앱 경고 화면" 
              className="w-full h-auto"
            />
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800">
                  왜 이런 화면이 나오나요?
                </p>
                <p className="text-sm text-blue-700">
                  현재 To-Dook은 <strong>베타테스트 중</strong>이라 Google의 정식 앱 인증이 완료되지 않았습니다. 
                  그래서 위와 같은 경고 화면이 표시됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-3">진행 방법</p>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
                <span><strong>&quot;고급&quot;</strong> 버튼을 클릭하세요</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
                <span><strong>&quot;to-dook.vercel.app(으)로 이동(안전하지 않음)&quot;</strong> 링크를 클릭하세요</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
                <span>Gmail 계정 액세스를 허용하면 연동이 완료됩니다</span>
              </li>
            </ol>
          </div>

          {/* Assurance */}
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>
              To-Dook은 이메일 읽기 권한만 요청하며, 귀하의 데이터는 안전하게 처리됩니다. 
              정식 인증은 곧 완료될 예정입니다.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

