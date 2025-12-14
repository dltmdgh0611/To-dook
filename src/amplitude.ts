'use client';

// 커스텀 이벤트 트래킹용 함수 (CDN으로 로드된 amplitude 사용)
export function track(eventName: string, eventProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    const amplitude = (window as any).amplitude;
    if (amplitude) {
      amplitude.track(eventName, eventProperties);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// 사용자 ID 설정
export function setUserId(userId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const amplitude = (window as any).amplitude;
    if (amplitude) {
      amplitude.setUserId(userId);
    }
  } catch (error) {
    console.error('Failed to set user ID:', error);
  }
}
