import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import EmptyStateGuides from './EmptyStateGuides';

const meta: Meta<typeof EmptyStateGuides> = {
  title: 'Chat/EmptyStateGuides',
  component: EmptyStateGuides,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onPick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmptyStateGuides>;

export const Default: Story = {};
