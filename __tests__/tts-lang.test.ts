import { describe, it, expect } from 'vitest';
import { detectBcp47Lang, splitForTts, pickVoiceForLang } from '@/components/chat/tts-lang';

describe('detectBcp47Lang', () => {
  it('returns null for empty string', () => {
    expect(detectBcp47Lang('')).toBeNull();
  });

  it('returns null for null-ish input', () => {
    expect(detectBcp47Lang(null as any)).toBeNull();
  });

  it('detects English text', () => {
    expect(detectBcp47Lang('Hello world, this is a test.')).toBe('en-US');
  });

  it('detects simplified Chinese', () => {
    expect(detectBcp47Lang('你好世界，这是一个测试')).toBe('zh-CN');
  });

  it('detects traditional Chinese when trad-bias chars dominate', () => {
    const trad = '這個學習體驗讓國際經濟發展變得實際關鍵';
    expect(detectBcp47Lang(trad)).toBe('zh-HK');
  });

  it('detects Japanese via hiragana', () => {
    expect(detectBcp47Lang('こんにちは世界')).toBe('ja-JP');
  });

  it('detects Korean', () => {
    expect(detectBcp47Lang('안녕하세요 세계')).toBe('ko-KR');
  });

  it('detects Russian / Cyrillic', () => {
    expect(detectBcp47Lang('Привет мир')).toBe('ru-RU');
  });

  it('detects Arabic', () => {
    expect(detectBcp47Lang('مرحبا بالعالم')).toBe('ar-SA');
  });

  it('returns null for digits and punctuation only', () => {
    expect(detectBcp47Lang('12345 .,!?')).toBeNull();
  });

  it('picks dominant script in mixed text', () => {
    const mixed = '你好世界这是一段测试文字，只有少量English';
    const result = detectBcp47Lang(mixed);
    expect(result).toBe('zh-CN');
  });
});

describe('splitForTts', () => {
  it('returns empty array for empty string', () => {
    expect(splitForTts('')).toEqual([]);
  });

  it('returns empty array for whitespace-only', () => {
    expect(splitForTts('   ')).toEqual([]);
  });

  it('returns single chunk for pure English', () => {
    const chunks = splitForTts('Hello world');
    expect(chunks.length).toBe(1);
    expect(chunks[0].lang).toBe('en-US');
  });

  it('returns single chunk for pure Chinese', () => {
    const chunks = splitForTts('你好世界');
    expect(chunks.length).toBe(1);
    expect(chunks[0].lang).toBe('zh-CN');
  });

  it('splits Chinese and English into separate chunks', () => {
    const chunks = splitForTts('你好Hello');
    expect(chunks.length).toBe(2);
    const langs = chunks.map((c) => c.lang);
    expect(langs).toContain('en-US');
    expect(langs.some((l) => l?.startsWith('zh'))).toBe(true);
  });

  it('merges tiny Latin runs (<=2 chars) into surrounding script', () => {
    const chunks = splitForTts('使用AI的方法');
    const latinChunks = chunks.filter((c) => c.lang === 'en-US');
    expect(latinChunks.length).toBe(0);
  });

  it('preserves text content across all chunks', () => {
    const input = '你好Hello世界';
    const chunks = splitForTts(input);
    const reassembled = chunks.map((c) => c.text).join('');
    expect(reassembled).toBe(input);
  });
});

describe('pickVoiceForLang', () => {
  function voice(lang: string, name = ''): SpeechSynthesisVoice {
    return { lang, name, default: false, localService: true, voiceURI: lang } as SpeechSynthesisVoice;
  }

  it('returns null for empty voice list', () => {
    expect(pickVoiceForLang([], 'en-US')).toBeNull();
  });

  it('returns null for null voice list', () => {
    expect(pickVoiceForLang(null as any, 'en-US')).toBeNull();
  });

  it('finds exact match', () => {
    const voices = [voice('en-US'), voice('zh-CN')];
    expect(pickVoiceForLang(voices, 'en-US')?.lang).toBe('en-US');
  });

  it('falls back to same language prefix', () => {
    const voices = [voice('en-GB'), voice('fr-FR')];
    expect(pickVoiceForLang(voices, 'en-US')?.lang).toBe('en-GB');
  });

  it('finds Cantonese voice for zh-HK', () => {
    const voices = [voice('zh-CN'), voice('yue-HK', 'Cantonese')];
    const result = pickVoiceForLang(voices, 'zh-HK');
    expect(result).toBeTruthy();
  });

  it('falls back to zh-TW for zh-HK if no Cantonese', () => {
    const voices = [voice('zh-CN'), voice('zh-TW')];
    const result = pickVoiceForLang(voices, 'zh-HK');
    expect(result?.lang).toBe('zh-TW');
  });

  it('returns null when no matching language family', () => {
    const voices = [voice('fr-FR'), voice('de-DE')];
    expect(pickVoiceForLang(voices, 'ja-JP')).toBeNull();
  });
});
