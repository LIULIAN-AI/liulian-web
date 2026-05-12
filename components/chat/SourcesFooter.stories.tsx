import type { Meta, StoryObj } from '@storybook/react';
import SourcesFooter from './SourcesFooter';
import type { ReliabilitySource } from './types';

const meta: Meta<typeof SourcesFooter> = {
  title: 'Chat/SourcesFooter',
  component: SourcesFooter,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SourcesFooter>;

const dbSource: ReliabilitySource = {
  title: 'Internal database — management_team',
  url: '',
  provider: 'database',
  tier: 'official',
};

const wikiSource: ReliabilitySource = {
  title: 'ZA Bank',
  url: 'https://en.wikipedia.org/wiki/ZA_Bank',
  provider: 'wikipedia',
  tier: 'reference',
};

const webSource: ReliabilitySource = {
  title: 'ZA Bank Products',
  url: 'https://za.group/products',
  provider: 'playwright',
  tier: 'web',
};

const frontendSource: ReliabilitySource = {
  title: 'Frontend card — about',
  url: '',
  provider: 'frontend_context',
  tier: 'official',
};

export const SingleDatabaseSource: Story = {
  args: {
    sources: [dbSource],
    providerUsed: 'database',
  },
};

export const SingleWebSource: Story = {
  args: {
    sources: [wikiSource],
    providerUsed: 'wikipedia',
  },
};

export const MixedSources: Story = {
  args: {
    sources: [dbSource, wikiSource, webSource, frontendSource],
    providerUsed: null,
  },
};

export const FrontendContextSource: Story = {
  name: 'Frontend context (component name translated)',
  args: {
    sources: [frontendSource],
    providerUsed: 'frontend_context',
  },
};

export const Empty: Story = {
  args: {
    sources: [],
  },
};
