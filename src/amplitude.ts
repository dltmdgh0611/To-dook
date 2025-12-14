'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

let isInitialized = false;

function initAmplitude() {
  if (typeof window !== 'undefined' && !isInitialized) {
    try {
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

export default amplitude;
