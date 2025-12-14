'use client';

// 커스텀 이벤트 트래킹용 함수
export async function track(eventName: string, eventProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    const amplitudeModule = await import('@amplitude/analytics-browser');
    const amplitude = amplitudeModule.default || amplitudeModule;
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
