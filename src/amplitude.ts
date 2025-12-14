'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';

function initAmplitude() {
  if (typeof window !== 'undefined') {
    amplitude.add(sessionReplayPlugin());
    amplitude.init('c31690a7e5ae8f316bec9f63bb65588a', {"autocapture":true});
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;
