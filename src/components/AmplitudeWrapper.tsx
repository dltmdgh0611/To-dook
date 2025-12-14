'use client';

import dynamic from 'next/dynamic';

const Amplitude = dynamic(() => import('@/amplitude').then(mod => ({ default: mod.Amplitude })), {
  ssr: false,
});

export default function AmplitudeWrapper() {
  return <Amplitude />;
}
