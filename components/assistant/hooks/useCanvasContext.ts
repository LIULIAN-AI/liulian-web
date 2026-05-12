'use client';

import { useContext } from 'react';
import { CanvasContext } from '@/contexts/CanvasContext';
import type { CanvasContextValue } from '@/components/assistant/types';

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return ctx;
}

export function useOptionalCanvasContext(): CanvasContextValue | null {
  return useContext(CanvasContext);
}
