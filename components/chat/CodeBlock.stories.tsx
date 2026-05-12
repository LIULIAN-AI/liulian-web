import type { Meta, StoryObj } from '@storybook/react';
import CodeBlock from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Chat/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    language: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {
  args: {
    language: 'typescript',
    code: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}',
  },
};

export const Python: Story = {
  args: {
    language: 'python',
    code: 'def greet(name: str) -> str:\n    return f"Hello, {name}!"',
  },
};

export const SQL: Story = {
  args: {
    language: 'sql',
    code: 'SELECT bank_name, revenue\nFROM banks\nWHERE region = \'HK\'\nORDER BY revenue DESC\nLIMIT 10;',
  },
};

export const NoLanguage: Story = {
  name: 'No language specified',
  args: {
    code: 'npm run build\nnpm run start',
  },
};
