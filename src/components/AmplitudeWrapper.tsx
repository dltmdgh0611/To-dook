'use client';

import { useEffect } from 'react';

export default function AmplitudeWrapper() {
  useEffect(() => {
    const initAmplitude = async () => {
      try {
        const amplitude = await import('@amplitude/analytics-browser');
        const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
        
        amplitude.add(sessionReplayPlugin());
        amplitude.init('c31690a7e5ae8f316bec9f63bb65588a', { autocapture: true });
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
      }
    };
    
    initAmplitude();
  }, []);

  return null;
}
