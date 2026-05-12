import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ProfessionalPersonaIcon,
  pickRandomPersona,
} from '@/components/chat/ProfessionalPersonaIcon';

describe('ProfessionalPersonaIcon', () => {
  it('returns male when random seed is below 0.5', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    expect(pickRandomPersona()).toBe('male');
    randomSpy.mockRestore();
  });

  it('returns female when random seed is 0.5 or above', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.8);
    expect(pickRandomPersona()).toBe('female');
    randomSpy.mockRestore();
  });

  it('renders male/female accessible icon label', () => {
    const { rerender } = render(<ProfessionalPersonaIcon persona="male" />);
    expect(screen.getByLabelText('professional persona male')).toBeInTheDocument();

    rerender(<ProfessionalPersonaIcon persona="female" />);
    expect(screen.getByLabelText('professional persona female')).toBeInTheDocument();
  });
});
