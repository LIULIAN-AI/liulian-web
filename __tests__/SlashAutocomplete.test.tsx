import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithIntl, screen } from './test-utils';
import SlashAutocomplete from '@/components/chat/SlashAutocomplete';

describe('SlashAutocomplete', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all commands for empty query', () => {
    renderWithIntl(
      <SlashAutocomplete
        query=""
        activeIndex={0}
        onActiveIndexChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('returns no matches for a nonsense query', () => {
    renderWithIntl(
      <SlashAutocomplete
        query="/zzzznonexistent999"
        activeIndex={0}
        onActiveIndexChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const listbox = screen.queryAllByRole('listbox');
    expect(listbox.length).toBe(0);
  });

  it('renders a listbox with options for a valid slash query', () => {
    renderWithIntl(
      <SlashAutocomplete
        query="/"
        activeIndex={0}
        onActiveIndexChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const listbox = screen.queryAllByRole('listbox');
    expect(listbox.length).toBeGreaterThan(0);
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('calls onSelect when an option is clicked', () => {
    const onSelect = vi.fn();
    renderWithIntl(
      <SlashAutocomplete
        query="/"
        activeIndex={0}
        onActiveIndexChange={vi.fn()}
        onSelect={onSelect}
      />,
    );
    const options = screen.getAllByRole('option');
    fireEvent.click(options[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toHaveProperty('key');
  });

  it('marks the active index option as selected', () => {
    renderWithIntl(
      <SlashAutocomplete
        query="/"
        activeIndex={0}
        onActiveIndexChange={vi.fn()}
        onSelect={vi.fn()}
      />,
    );
    const options = screen.getAllByRole('option');
    const selected = options.filter(
      (o) => o.getAttribute('aria-selected') === 'true',
    );
    expect(selected.length).toBe(1);
  });
});
