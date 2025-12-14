'use client';

import { useEffect } from 'react';

export default function AmplitudeWrapper() {
  useEffect(() => {
    const initAmplitude = async () => {
      try {
        // 동적 import로 브라우저에서만 로드
        const amplitudeModule = await import('@amplitude/analytics-browser');
        const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
        
        // amplitude는 default export 또는 named export일 수 있음
        const amplitude = amplitudeModule.default || amplitudeModule;
        
        // 플러그인 추가
        amplitude.add(sessionReplayPlugin());
        
        // 초기화
        amplitude.init('c31690a7e5ae8f316bec9f63bb65588a', { 
          autocapture: true,
          defaultTracking: {
            pageViews: true,
            sessions: true,
            formInteractions: true,
            fileDownloads: true
          }
        });
        
        console.log('Amplitude initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
      }
    };
    
    initAmplitude();
  }, []);

  return null;
}
