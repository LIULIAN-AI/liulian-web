import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import MessageBubble from './MessageBubble';
import type { Message } from './types';

const meta: Meta<typeof MessageBubble> = {
  title: 'Chat/MessageBubble',
  component: MessageBubble,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MessageBubble>;

const userMessage: Message = {
  id: 'u1',
  type: 'user',
  content: 'What is ZA Bank total revenue for 2023?',
};

const assistantMessage: Message = {
  id: 'a1',
  type: 'assistant',
  content:
    'ZA Bank reported total revenue of HKD 1.2 billion for fiscal year 2023, representing a 15% year-over-year increase.',
  references: [{ tool: 'db_reader', table: 'financials' }],
  traces: [],
};

const tableMessage: Message = {
  id: 'a2',
  type: 'assistant',
  content:
    '| Bank | Revenue (HKD) | YoY Growth |\n| --- | --- | --- |\n| ZA Bank | 1.2B | +15% |\n| Mox Bank | 800M | +12% |',
  references: [{ tool: 'db_reader', table: 'financials' }],
  traces: [],
};

const errorMessage: Message = {
  id: 'a3',
  type: 'assistant',
  content: 'An error occurred while processing your request.',
  references: [],
  traces: [],
  error: true,
  errorRaw: 'ConnectionError: upstream agent timeout after 30s',
};

const contextMessage: Message = {
  id: 'c1',
  type: 'context',
  component: 'about',
  data: { ceo: 'Calvin Ng', bankName: 'ZA Bank', founded: '2019' },
};

export const UserBubble: Story = {
  args: { message: userMessage },
};

export const AssistantBubble: Story = {
  args: {
    message: assistantMessage,
    onRequestRevert: fn(),
    onRequestEdit: fn(),
    onRequestRegenerate: fn(),
  },
};

export const TableResponse: Story = {
  args: {
    message: tableMessage,
    onRequestRevert: fn(),
  },
};

export const ErrorState: Story = {
  args: { message: errorMessage },
};

export const ContextInjection: Story = {
  args: { message: contextMessage },
};
