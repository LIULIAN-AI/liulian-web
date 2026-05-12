import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ChipFlyOverlay from './ChipFlyOverlay';

const meta: Meta<typeof ChipFlyOverlay> = {
  title: 'Chat/ChipFlyOverlay',
  component: ChipFlyOverlay,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ChipFlyOverlay>;

export const WithPayload: Story = {
  args: {
    payload: {
      text: 'Tell me about revenue',
      from: { x: 200, y: 100, width: 180, height: 36 },
      to: { x: 200, y: 500 },
    },
  },
};

export const NoPayload: Story = {
  args: {
    payload: null,
  },
};
