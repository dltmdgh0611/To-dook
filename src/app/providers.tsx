'use client';

import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MobileBlock from '@/components/MobileBlock';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <MobileBlock />
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}

