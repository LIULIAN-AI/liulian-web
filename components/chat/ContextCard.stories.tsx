import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ContextCard from './ContextCard';

const meta: Meta<typeof ContextCard> = {
  title: 'Chat/ContextCard',
  component: ContextCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onInsertToInput: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ContextCard>;

export const BankHeader: Story = {
  args: {
    component: 'bank_header',
    data: {
      bankName: 'ZA Bank',
      sortId: 'za-bank',
      source: 'frontend_snapshot',
      ceo: 'Rockson Hsu',
      founded: '2019',
    },
  },
};

export const About: Story = {
  args: {
    component: 'about',
    data: {
      bankName: 'Mox Bank',
      description: 'A virtual bank backed by Standard Chartered.',
      website: 'https://mox.com',
      source: 'database',
    },
  },
};

export const ManagementTeam: Story = {
  args: {
    component: 'management_team',
    data: {
      bankName: 'WeLab Bank',
      ceo: 'Tat Lee',
      source: 'frontend_snapshot',
    },
  },
};

export const WithSourceId: Story = {
  name: 'With reveal source button',
  args: {
    component: 'establishment',
    data: {
      bankName: 'Ant Bank',
      founded: '2019',
      establishedTime: '2020-04-01',
      source: 'frontend_snapshot',
    },
    sourceId: 'inject-establishment-ant-bank',
    sourcePath: '/bank-info/ant-bank/overview',
  },
};

export const NoDetails: Story = {
  name: 'No scalar fields (fallback)',
  args: {
    component: 'financial_overview',
    data: {
      charts: { revenue: [1, 2, 3] },
    },
  },
};

export const UnknownComponent: Story = {
  name: 'Unknown component (humanized fallback)',
  args: {
    component: 'custom_analysis',
    data: {
      bankName: 'ZA Bank',
      summary: 'Custom analysis results',
    },
  },
};
