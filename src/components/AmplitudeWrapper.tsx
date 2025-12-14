'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

let isInitialized = false;

export default function AmplitudeWrapper() {
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized) return;
    
    try {
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
      
      isInitialized = true;
      console.log('Amplitude initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }, []);

  return null;
}
