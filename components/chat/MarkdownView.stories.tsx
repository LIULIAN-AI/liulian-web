import type { Meta, StoryObj } from '@storybook/react';
import MarkdownView from './MarkdownView';

const meta: Meta<typeof MarkdownView> = {
  title: 'Chat/MarkdownView',
  component: MarkdownView,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    withCitations: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownView>;

export const PlainProse: Story = {
  args: {
    content:
      '# Hello\n\nThis is a paragraph with **bold**, *italic*, and `inline code`.\n\n- bullet one\n- bullet two\n',
    withCitations: false,
  },
};

export const FencedCode: Story = {
  args: {
    content:
      '## Example\n\n```ts\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n```\n\nAnd a second block:\n\n```python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n```\n',
    withCitations: false,
  },
};

export const Tables: Story = {
  args: {
    content:
      '| Col A | Col B | Col C |\n|---|---|---|\n| 1 | alpha | x |\n| 2 | beta  | y |\n| 3 | gamma | z |\n',
    withCitations: false,
  },
};

export const WithCitations: Story = {
  args: {
    content:
      'According to the latest report [1], yields are stable, while inflation [citation:2] is the dominant risk.\n\nA second paragraph with [3] and [4].',
    withCitations: true,
  },
};

export const Sanitization: Story = {
  args: {
    content:
      'This story confirms unsafe HTML is sanitized. The script below is dropped:\n\n<script>alert("xss")</script>\n\nThe paragraph above should render but no alert should fire.',
    withCitations: false,
  },
};

export const LongMixedContent: Story = {
  args: {
    content:
      '# Long mixed example\n\n## Background\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
      '[citation:1] explains the methodology.\n\n## Code\n\n```sh\nuv run pytest -v\nnpm run lint\n```\n\n## Table\n\n| Metric | Value |\n|---|---|\n| Tests | 42 |\n| Coverage | 87% |\n\n## Footer\n\nFinal paragraph with multiple citations [2] [3] [4].',
    withCitations: true,
  },
};
