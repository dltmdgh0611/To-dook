'use client';

import * as amplitude from '@amplitude/analytics-browser';

// 커스텀 이벤트 트래킹용 함수
export function track(eventName: string, eventProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export default amplitude;
