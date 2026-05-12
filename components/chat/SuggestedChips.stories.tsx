import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SuggestedChips from './SuggestedChips';

const meta: Meta<typeof SuggestedChips> = {
  title: 'Chat/SuggestedChips',
  component: SuggestedChips,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onChipClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SuggestedChips>;

export const PlainTextChips: Story = {
  args: {
    chips: ['Tell me more', 'Compare with Mox', 'Show financials'],
  },
};

export const I18nChips: Story = {
  name: 'i18n context chips (resolved via t())',
  args: {
    chips: [
      'context.chipRevenue',
      'context.chipCeo',
      'context.chipProducts',
    ],
  },
};

export const SingleChip: Story = {
  args: {
    chips: ['What about ZA Bank?'],
  },
};

export const Empty: Story = {
  args: {
    chips: [],
  },
};
