'use client';

import type { ReactNode } from 'react';
import { CanvasProvider } from '@/contexts/CanvasContext';

export default function AssistantLayout({ children }: { children: ReactNode }) {
  return (
    <CanvasProvider>
      {children}
    </CanvasProvider>
  );
}
