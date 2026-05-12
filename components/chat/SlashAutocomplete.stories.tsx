import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SlashAutocomplete from './SlashAutocomplete';

const meta: Meta<typeof SlashAutocomplete> = {
  title: 'Chat/SlashAutocomplete',
  component: SlashAutocomplete,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onActiveIndexChange: fn(),
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SlashAutocomplete>;

export const EmptyQuery: Story = {
  args: {
    query: '',
    activeIndex: 0,
  },
};

export const PartialMatch: Story = {
  args: {
    query: 'sum',
    activeIndex: 0,
  },
};

export const SecondItemActive: Story = {
  args: {
    query: '',
    activeIndex: 1,
  },
};

export const NoMatch: Story = {
  name: 'No matches (renders null)',
  args: {
    query: 'zzzznonexistent',
    activeIndex: 0,
  },
};
