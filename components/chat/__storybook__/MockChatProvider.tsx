import React from 'react';
import { fn } from '@storybook/test';
import { ChatContext } from '@/contexts/ChatContext';
import type { ChatContextValue, ChatState } from '../types';

const defaultState: ChatState = {
  panelState: 'default',
  status: 'idle',
  conversationId: 'story-conv-1',
  conversationTitle: 'Demo conversation',
  messages: [],
  suggestions: [],
  activeTraces: [],
  interactionPath: [],
  archives: [],
  onlineMode: 'fallback',
};

const defaultContext: ChatContextValue = {
  state: defaultState,
  dispatch: fn(),
  sendMessage: fn(),
  injectContext: fn(),
  abort: fn(),
  setPanelState: fn(),
  setOnlineMode: fn(),
  startNewChat: fn(),
  loadArchive: fn(),
  renameSession: fn(),
  truncateFrom: fn(),
  setFeedback: fn(),
  togglePin: fn(),
  renameArchive: fn(),
  deleteArchive: fn(),
};

export function MockChatProvider({
  children,
  overrides,
}: {
  children: React.ReactNode;
  overrides?: Partial<ChatContextValue>;
}) {
  const value = { ...defaultContext, ...overrides };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function withMockChat(overrides?: Partial<ChatContextValue>) {
  return function Decorator(Story: React.ComponentType) {
    return (
      <MockChatProvider overrides={overrides}>
        <Story />
      </MockChatProvider>
    );
  };
}
