'use client';

// 커스텀 이벤트 트래킹용 함수
export async function track(eventName: string, eventProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    const amplitude = await import('@amplitude/analytics-browser');
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
