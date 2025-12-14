'use client';

import { useEffect } from 'react';

let isInitialized = false;
let amplitudeInstance: any = null;

async function initAmplitude() {
  if (typeof window !== 'undefined' && !isInitialized) {
    try {
      // 동적 import로 브라우저에서만 로드
      const [amplitude, { sessionReplayPlugin }] = await Promise.all([
        import('@amplitude/analytics-browser'),
        import('@amplitude/plugin-session-replay-browser')
      ]);
      
      amplitudeInstance = amplitude;
      amplitude.add(sessionReplayPlugin());
      amplitude.init('c31690a7e5ae8f316bec9f63bb65588a', {"autocapture":true});
      isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }
}

export const Amplitude = () => {
  useEffect(() => {
    initAmplitude();
  }, []);
  return null;
};

// Lazy getter for amplitude instance
export default new Proxy({} as any, {
  get(_target, prop) {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return amplitudeInstance?.[prop];
  }
});
