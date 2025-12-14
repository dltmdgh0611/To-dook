// Amplitude CDN 전역 객체 타입 선언
interface AmplitudeGlobal {
  init(apiKey: string, options?: any): void;
  track(eventName: string, eventProperties?: Record<string, any>): void;
  add(plugin: any): void;
  setUserId(userId: string): void;
  identify(identify: any): void;
  reset(): void;
  getDeviceId(): string;
  getSessionId(): number;
}

interface SessionReplayGlobal {
  plugin(options?: { sampleRate?: number }): any;
}

declare global {
  interface Window {
    amplitude?: AmplitudeGlobal;
    sessionReplay?: SessionReplayGlobal;
  }
}
