import { describe, it, expect, vi } from 'vitest';
import {
  COMMANDS,
  matchSlashCommands,
  matchPaletteCommands,
  parseSlashInput,
  normalizeSlashPrefix,
  type CommandContext,
} from '@/components/chat/commands';

describe('normalizeSlashPrefix', () => {
  it('converts Chinese 、 to ASCII /', () => {
    expect(normalizeSlashPrefix('、summary')).toBe('/summary');
  });

  it('converts fullwidth ／ to ASCII /', () => {
    expect(normalizeSlashPrefix('／clear')).toBe('/clear');
  });

  it('leaves normal / unchanged', () => {
    expect(normalizeSlashPrefix('/pin')).toBe('/pin');
  });

  it('leaves non-slash input unchanged', () => {
    expect(normalizeSlashPrefix('hello')).toBe('hello');
  });
});

describe('matchSlashCommands', () => {
  it('returns all commands for empty query', () => {
    const result = matchSlashCommands('');
    expect(result).toEqual(COMMANDS);
  });

  it('matches by key prefix', () => {
    const result = matchSlashCommands('sum');
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((c) => c.key === 'summary')).toBe(true);
  });

  it('matches by alias', () => {
    const result = matchSlashCommands('总结');
    expect(result.some((c) => c.key === 'summary')).toBe(true);
  });

  it('returns empty array for nonsense query', () => {
    expect(matchSlashCommands('zzzznonexistent999')).toEqual([]);
  });

  it('is case-insensitive', () => {
    const result = matchSlashCommands('SUM');
    expect(result.some((c) => c.key === 'summary')).toBe(true);
  });
});

describe('matchPaletteCommands', () => {
  it('returns all commands for empty query', () => {
    expect(matchPaletteCommands('')).toEqual(COMMANDS);
  });

  it('matches by description words', () => {
    const result = matchPaletteCommands('clipboard');
    expect(result.some((c) => c.key === 'copy')).toBe(true);
  });

  it('supports multi-token query', () => {
    const result = matchPaletteCommands('chat fresh');
    expect(result.some((c) => c.key === 'clear')).toBe(true);
  });

  it('returns empty for nonsense', () => {
    expect(matchPaletteCommands('xyznonexistent')).toEqual([]);
  });
});

describe('parseSlashInput', () => {
  it('parses simple slash command', () => {
    const result = parseSlashInput('/summary');
    expect(result).toEqual({ key: 'summary', args: '' });
  });

  it('parses command with args', () => {
    const result = parseSlashInput('/rename My New Title');
    expect(result).toEqual({ key: 'rename', args: 'My New Title' });
  });

  it('normalizes Chinese slash before parsing', () => {
    const result = parseSlashInput('、clear');
    expect(result).toEqual({ key: 'clear', args: '' });
  });

  it('returns null for non-slash input', () => {
    expect(parseSlashInput('hello world')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseSlashInput('')).toBeNull();
  });

  it('lowercases the key', () => {
    const result = parseSlashInput('/SUMMARY');
    expect(result?.key).toBe('summary');
  });

  it('trims leading whitespace', () => {
    const result = parseSlashInput('  /pin');
    expect(result).toEqual({ key: 'pin', args: '' });
  });
});

describe('command run handlers', () => {
  function makeCtx(): CommandContext {
    return {
      sendMessage: vi.fn(),
      setInputValue: vi.fn(),
      startNewChat: vi.fn(),
      renameSession: vi.fn(),
      togglePinCurrent: vi.fn(),
      setPanelExpanded: vi.fn(),
      copyTranscript: vi.fn(),
      exportTranscript: vi.fn(),
    };
  }

  it('/summary sends a summary message', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'summary')!;
    cmd.run(ctx);
    expect(ctx.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('/rename with args calls renameSession', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'rename')!;
    cmd.run(ctx, 'New Name');
    expect(ctx.renameSession).toHaveBeenCalledWith('New Name');
  });

  it('/rename without args sets input value', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'rename')!;
    cmd.run(ctx);
    expect(ctx.setInputValue).toHaveBeenCalled();
  });

  it('/clear starts a new chat', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'clear')!;
    cmd.run(ctx);
    expect(ctx.startNewChat).toHaveBeenCalled();
  });

  it('/expand sets panel expanded to true', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'expand')!;
    cmd.run(ctx);
    expect(ctx.setPanelExpanded).toHaveBeenCalledWith(true);
  });

  it('/collapse sets panel expanded to false', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'collapse')!;
    cmd.run(ctx);
    expect(ctx.setPanelExpanded).toHaveBeenCalledWith(false);
  });

  it('/copy calls copyTranscript', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'copy')!;
    cmd.run(ctx);
    expect(ctx.copyTranscript).toHaveBeenCalled();
  });

  it('/compare with args sends a compare message', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'compare')!;
    cmd.run(ctx, 'BankA vs BankB');
    expect(ctx.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('/compare without args sets input value', () => {
    const ctx = makeCtx();
    const cmd = COMMANDS.find((c) => c.key === 'compare')!;
    cmd.run(ctx);
    expect(ctx.setInputValue).toHaveBeenCalled();
  });
});
