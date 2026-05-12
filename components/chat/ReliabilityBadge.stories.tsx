import type { Meta, StoryObj } from '@storybook/react';
import { ReliabilityBadge } from './ReliabilityBadge';
import type { ReliabilitySource } from './types';

const meta: Meta<typeof ReliabilityBadge> = {
  title: 'Chat/ReliabilityBadge',
  component: ReliabilityBadge,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    tier: {
      control: 'select',
      options: ['verified', 'official', 'reference', 'web', 'ai_generated'],
    },
    compact: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ReliabilityBadge>;

export const Verified: Story = {
  args: { tier: 'verified', compact: false },
};

export const Official: Story = {
  args: { tier: 'official', compact: false },
};

export const Reference: Story = {
  args: { tier: 'reference', providerUsed: 'wikipedia', compact: false },
};

export const Web: Story = {
  args: { tier: 'web', providerUsed: 'duckduckgo', compact: false },
};

export const AiGenerated: Story = {
  args: { tier: 'ai_generated', compact: false },
};

export const CompactMode: Story = {
  args: { tier: 'official', compact: true },
};

const sampleSources: ReliabilitySource[] = [
  { title: 'HKMA Banking Returns', url: 'https://hkma.gov.hk', provider: 'database', tier: 'verified' },
  { title: 'ZA Bank Wikipedia', url: 'https://en.wikipedia.org/wiki/ZA_Bank', provider: 'wikipedia', tier: 'reference' },
  { title: 'Annual Report 2024', url: '', provider: 'frontend_context', tier: 'official' },
];

export const WithSources: Story = {
  args: {
    tier: 'verified',
    providerUsed: 'database',
    sources: sampleSources,
    compact: false,
  },
};

export const ManySourcesTruncated: Story = {
  name: 'Many sources (truncated to 3 + count)',
  args: {
    tier: 'web',
    providerUsed: 'duckduckgo',
    sources: [
      ...sampleSources,
      { title: 'Source 4', url: 'https://example.com/4', provider: 'playwright', tier: 'web' },
      { title: 'Source 5', url: 'https://example.com/5', provider: 'duckduckgo', tier: 'web' },
    ],
    compact: false,
  },
};
