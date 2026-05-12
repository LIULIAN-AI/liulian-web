'use client';

import { useContext } from 'react';
import { ChatContext } from '@/contexts/ChatContext';
import type { ChatContextValue } from '@/components/chat/types';

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return ctx;
}
