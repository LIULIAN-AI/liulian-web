import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ChatInput from './ChatInput';

const meta: Meta<typeof ChatInput> = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    onSend: fn(),
    onStop: fn(),
    onSlashSelect: fn(),
  },
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    isStreaming: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    value: '',
    disabled: false,
    isStreaming: false,
  },
};

export const WithText: Story = {
  args: {
    value: 'What is ZA Bank?',
    disabled: false,
    isStreaming: false,
  },
};

export const Streaming: Story = {
  args: {
    value: '',
    disabled: true,
    isStreaming: true,
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    disabled: true,
    isStreaming: false,
  },
};

export const SlashCommand: Story = {
  args: {
    value: '/sum',
    disabled: false,
    isStreaming: false,
  },
};

export const WithHistory: Story = {
  args: {
    value: '',
    disabled: false,
    isStreaming: false,
    history: [
      'Tell me about ZA Bank',
      'Compare Mox and ZA Bank',
      'What about WeLab?',
    ],
  },
};
