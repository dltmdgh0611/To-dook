declare module '@amplitude/analytics-browser' {
  export function init(apiKey: string, options?: any): void;
  export function track(eventName: string, eventProperties?: Record<string, any>): void;
  export function add(plugin: any): void;
  export function setUserId(userId: string): void;
  export function identify(identify: any): void;
  export function reset(): void;
}

declare module '@amplitude/plugin-session-replay-browser' {
  export function sessionReplayPlugin(options?: any): any;
}
