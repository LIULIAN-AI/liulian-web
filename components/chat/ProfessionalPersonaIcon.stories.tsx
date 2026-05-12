import type { Meta, StoryObj } from '@storybook/react';
import { ProfessionalPersonaIcon } from './ProfessionalPersonaIcon';

const meta: Meta<typeof ProfessionalPersonaIcon> = {
  title: 'Chat/ProfessionalPersonaIcon',
  component: ProfessionalPersonaIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    persona: { control: 'select', options: ['male', 'female'] },
  },
};

export default meta;
type Story = StoryObj<typeof ProfessionalPersonaIcon>;

export const Male: Story = {
  args: { persona: 'male' },
};

export const Female: Story = {
  args: { persona: 'female' },
};
