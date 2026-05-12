import type { Meta, StoryObj } from '@storybook/react';
import OnlineModeToggle from './OnlineModeToggle';
import { withMockChat } from './__storybook__/MockChatProvider';

const meta: Meta<typeof OnlineModeToggle> = {
  title: 'Chat/OnlineModeToggle',
  component: OnlineModeToggle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OnlineModeToggle>;

export const Fallback: Story = {
  decorators: [withMockChat({ state: { panelState: 'default', status: 'idle', conversationId: 'c1', messages: [], suggestions: [], activeTraces: [], interactionPath: [], archives: [], onlineMode: 'fallback' } })],
};

export const Always: Story = {
  decorators: [withMockChat({ state: { panelState: 'default', status: 'idle', conversationId: 'c1', messages: [], suggestions: [], activeTraces: [], interactionPath: [], archives: [], onlineMode: 'always' } })],
};

export const Ask: Story = {
  decorators: [withMockChat({ state: { panelState: 'default', status: 'idle', conversationId: 'c1', messages: [], suggestions: [], activeTraces: [], interactionPath: [], archives: [], onlineMode: 'ask' } })],
};
