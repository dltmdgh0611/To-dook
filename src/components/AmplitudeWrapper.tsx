'use client';

import Script from 'next/script';

export default function AmplitudeWrapper() {
  return (
    <>
      <Script
        id="amplitude-sdk"
        strategy="afterInteractive"
        src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).amplitude) {
            (window as any).amplitude.init('c31690a7e5ae8f316bec9f63bb65588a', {
              autocapture: true,
              defaultTracking: {
                pageViews: true,
                sessions: true,
                formInteractions: true,
                fileDownloads: true
              }
            });
            console.log('Amplitude initialized successfully');
          }
        }}
      />
    </>
  );
}
