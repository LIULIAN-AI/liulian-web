import type { Meta, StoryObj } from '@storybook/react';
import TraceAccordion from './TraceAccordion';
import type { TraceStep } from './types';

const meta: Meta<typeof TraceAccordion> = {
  title: 'Chat/TraceAccordion',
  component: TraceAccordion,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    isStreaming: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof TraceAccordion>;

const now = Date.now();

const fullTrace: TraceStep[] = [
  { event: 'thinking', data: { message: 'Classifying your question' }, timestamp: now },
  { event: 'intent', data: { intent: 'bank_info' }, timestamp: now + 200 },
  { event: 'tool_call', data: { tool: 'search_banks' }, timestamp: now + 500 },
  { event: 'tool_result', data: { tool: 'search_banks' }, timestamp: now + 1200 },
  { event: 'thinking', data: { message: 'Generating conversational response' }, timestamp: now + 1400 },
];

export const Default: Story = {
  args: {
    traces: fullTrace,
    isStreaming: false,
  },
};

export const Streaming: Story = {
  args: {
    traces: fullTrace.slice(0, 3),
    isStreaming: true,
  },
};

export const SingleStep: Story = {
  args: {
    traces: [{ event: 'thinking', data: { message: 'Processing' }, timestamp: now }],
    isStreaming: false,
  },
};

export const Empty: Story = {
  args: {
    traces: [],
    isStreaming: false,
  },
};
