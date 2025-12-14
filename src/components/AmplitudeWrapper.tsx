'use client';

import { useEffect } from 'react';

let isInitialized = false;

export default function AmplitudeWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return;
    
    const initAmplitude = async () => {
      try {
        // 동적 import - 런타임에만 실행됨
        // @ts-ignore - 브라우저 전용 패키지는 서버에서 타입 체크 불가
        const amplitude = await import('@amplitude/analytics-browser');
        // @ts-ignore
        const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
        
        // amplitude는 default export 또는 named export일 수 있음
        const amp = amplitude.default || amplitude;
        
        // 플러그인 추가
        amp.add(sessionReplayPlugin());
        
        // 초기화
        amp.init('c31690a7e5ae8f316bec9f63bb65588a', { 
          autocapture: true,
          defaultTracking: {
            pageViews: true,
            sessions: true,
            formInteractions: true,
            fileDownloads: true
          }
        });
        
        isInitialized = true;
        console.log('Amplitude initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
      }
    };
    
    initAmplitude();
  }, []);

  return null;
}
