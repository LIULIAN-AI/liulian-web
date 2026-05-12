import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import CommandPalette from './CommandPalette';

const meta: Meta<typeof CommandPalette> = {
  title: 'Chat/CommandPalette',
  component: CommandPalette,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onClose: fn(),
    onRun: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Closed: Story = {
  name: 'Closed (renders nothing)',
  args: {
    open: false,
  },
};
