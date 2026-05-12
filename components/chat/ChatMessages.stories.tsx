import type { Meta, StoryObj } from '@storybook/react';
import ChatMessages from './ChatMessages';
import type { Message, TraceStep } from './types';

const meta: Meta<typeof ChatMessages> = {
  title: 'Chat/ChatMessages',
  component: ChatMessages,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatMessages>;

const sampleMessages: Message[] = [
  { id: 'u1', type: 'user', content: 'What is ZA Bank revenue?' },
  {
    id: 'a1',
    type: 'assistant',
    content: 'ZA Bank total revenue for 2023 is HKD 1.2 billion.',
    references: [{ tool: 'db_reader', table: 'financials' }],
    traces: [],
  },
  { id: 'u2', type: 'user', content: 'Compare with Mox Bank' },
  {
    id: 'a2',
    type: 'assistant',
    content:
      '| Bank | Revenue |\n| --- | --- |\n| ZA Bank | 1.2B |\n| Mox Bank | 800M |',
    references: [{ tool: 'db_reader', table: 'financials' }],
    traces: [],
  },
];

const activeTraces: TraceStep[] = [
  {
    event: 'thinking',
    data: { message: 'Classifying your question...' },
    timestamp: Date.now() - 5000,
  },
  {
    event: 'tool_call',
    data: { tool: 'db_reader', input: { action: 'query' } },
    timestamp: Date.now() - 3000,
  },
];

export const EmptyState: Story = {
  args: {
    messages: [],
    activeTraces: [],
    isStreaming: false,
  },
};

export const Conversation: Story = {
  args: {
    messages: sampleMessages,
    activeTraces: [],
    isStreaming: false,
  },
};

export const Streaming: Story = {
  args: {
    messages: [sampleMessages[0]],
    activeTraces,
    isStreaming: true,
  },
};
