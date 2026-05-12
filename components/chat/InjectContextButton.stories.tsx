import type { Meta, StoryObj } from '@storybook/react';
import InjectContextButton from './InjectContextButton';
import { withMockChat } from './__storybook__/MockChatProvider';

const meta: Meta<typeof InjectContextButton> = {
  title: 'Chat/InjectContextButton',
  component: InjectContextButton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [withMockChat()],
};

export default meta;
type Story = StoryObj<typeof InjectContextButton>;

export const Default: Story = {
  args: {
    component: 'bank_header',
    data: {
      bankName: 'ZA Bank',
      sortId: 'za-bank',
      ceo: 'Rockson Hsu',
      source: 'frontend_snapshot',
    },
  },
};

export const WithTooltip: Story = {
  args: {
    component: 'about',
    data: { bankName: 'Mox Bank', description: 'Virtual bank by StanChart' },
    tooltip: 'Send this card to the chatbot',
  },
};
