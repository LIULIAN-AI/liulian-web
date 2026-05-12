import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import AssistantFeedback from './AssistantFeedback';

const meta: Meta<typeof AssistantFeedback> = {
  title: 'Chat/AssistantFeedback',
  component: AssistantFeedback,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    content: 'ZA Bank reported revenue of HKD 1.2 billion in 2024.',
  },
};

export default meta;
type Story = StoryObj<typeof AssistantFeedback>;

export const NoFeedback: Story = {
  args: { feedback: null },
};

export const ThumbsUp: Story = {
  args: { feedback: 'up' },
};

export const ThumbsDown: Story = {
  args: { feedback: 'down' },
};
