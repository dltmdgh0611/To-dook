'use client';

// 커스텀 이벤트 트래킹용 함수
export async function track(eventName: string, eventProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore - 브라우저 전용 패키지는 서버에서 타입 체크 불가
    const amplitude = await import('@amplitude/analytics-browser');
    const amp = amplitude.default || amplitude;
    amp.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
