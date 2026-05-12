import type { Meta, StoryObj } from '@storybook/react';
import ChatPanel from './ChatPanel';

const meta: Meta<typeof ChatPanel> = {
  title: 'Chat/ChatPanel',
  component: ChatPanel,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

export const MalePersona: Story = {
  args: { persona: 'male' },
};

export const FemalePersona: Story = {
  args: { persona: 'female' },
};
