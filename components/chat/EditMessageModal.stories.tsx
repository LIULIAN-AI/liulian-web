import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import EditMessageModal from './EditMessageModal';

const meta: Meta<typeof EditMessageModal> = {
  title: 'Chat/EditMessageModal',
  component: EditMessageModal,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    onCancel: fn(),
    onSubmit: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EditMessageModal>;

export const Open: Story = {
  args: {
    open: true,
    initialContent: 'Tell me about ZA Bank revenue',
    discardCount: 2,
  },
};

export const LongContent: Story = {
  args: {
    open: true,
    initialContent: 'Compare ZA Bank and Mox Bank across products, fees, regulators, app ratings, and financial performance. Include data from 2023 and 2024.',
    discardCount: 5,
  },
};

export const SingleDiscard: Story = {
  args: {
    open: true,
    initialContent: 'What is WeLab?',
    discardCount: 1,
  },
};

export const Closed: Story = {
  args: {
    open: false,
    initialContent: '',
    discardCount: 0,
  },
};
