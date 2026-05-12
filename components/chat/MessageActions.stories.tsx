import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import MessageActions from './MessageActions';
import type { Message } from './types';

const userMessage: Message = {
  id: 'msg-1',
  type: 'user',
  content: 'Tell me about ZA Bank revenue',
  hidden: false,
};

const assistantMessage: Message = {
  id: 'msg-2',
  type: 'assistant',
  content: 'ZA Bank reported revenue of...',
  references: [],
  traces: [],
};

const meta: Meta<typeof MessageActions> = {
  title: 'Chat/MessageActions',
  component: MessageActions,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onRevert: fn(),
    onRegenerate: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof MessageActions>;

export const UserMessage: Story = {
  args: {
    message: userMessage,
  },
};

export const AssistantMessageHidden: Story = {
  name: 'Assistant message (renders null)',
  args: {
    message: assistantMessage,
  },
};
