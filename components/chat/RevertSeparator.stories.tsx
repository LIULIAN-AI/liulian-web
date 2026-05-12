import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RevertSeparator from './RevertSeparator';

const meta: Meta<typeof RevertSeparator> = {
  title: 'Chat/RevertSeparator',
  component: RevertSeparator,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onConfirm: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof RevertSeparator>;

export const SingleMessage: Story = {
  args: { discardCount: 1 },
};

export const MultipleMessages: Story = {
  args: { discardCount: 4 },
};
