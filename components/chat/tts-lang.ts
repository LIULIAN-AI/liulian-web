/**
 * Lightweight script-based language detection for the read-aloud feature.
 * The browser's SpeechSynthesis API picks a voice based on the utterance's
 * `lang` attribute, so we segment the assistant answer into language-coherent
 * chunks and tag each one with the right BCP-47 tag before queueing.
 *
 * Heuristics — no external dependency:
 *   • CJK Unified Ideographs → Chinese (zh-HK if traditional-only chars
 *     dominate, else zh-CN).
 *   • Hiragana / Katakana    → Japanese (ja-JP).
 *   • Hangul                 → Korean   (ko-KR).
 *   • Cyrillic               → Russian  (ru-RU).
 *   • Arabic block           → Arabic   (ar-SA).
 *   • Devanagari             → Hindi    (hi-IN).
 *   • Thai block             → Thai     (th-TH).
 *   • Hebrew block           → Hebrew   (he-IL).
 *   • Greek block            → Greek    (el-GR).
 *   • Latin / fallback       → English  (en-US).
 */

export type TtsChunk = { text: string; lang?: string };

const HAN = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
const HIRA_KATA = /[\u3040-\u30FF\u31F0-\u31FF]/;
const HANGUL = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
const CYRILLIC = /[\u0400-\u04FF]/;
const ARABIC = /[\u0600-\u06FF\u0750-\u077F]/;
const DEVANAGARI = /[\u0900-\u097F]/;
const THAI = /[\u0E00-\u0E7F]/;
const HEBREW = /[\u0590-\u05FF]/;
const GREEK = /[\u0370-\u03FF]/;
const LATIN = /[A-Za-z]/;

// A small set of characters that exist *only* in Traditional Chinese (or are
// strongly biased that way). If they appear, we tilt toward zh-HK so Cantonese
// voices kick in when available.
const TRAD_BIAS = /[繁體鐵會學習國應發發專廣關電機體變樂歡開門時間經為點現處實當頭爲萬個樣兩來請說讓覺號車將過讓對見親紙麼後還較聲術蓋飛東車買賣號術齊動單義灣]/;

type Script =
  | 'han-cn'
  | 'han-hk'
  | 'jp'
  | 'ko'
  | 'ru'
  | 'ar'
  | 'hi'
  | 'th'
  | 'he'
  | 'el'
  | 'latin'
  | 'other';

function classify(ch: string, hint?: 'han-cn' | 'han-hk'): Script {
  if (HIRA_KATA.test(ch)) return 'jp';
  if (HAN.test(ch)) return hint ?? 'han-cn';
  if (HANGUL.test(ch)) return 'ko';
  if (CYRILLIC.test(ch)) return 'ru';
  if (ARABIC.test(ch)) return 'ar';
  if (DEVANAGARI.test(ch)) return 'hi';
  if (THAI.test(ch)) return 'th';
  if (HEBREW.test(ch)) return 'he';
  if (GREEK.test(ch)) return 'el';
  if (LATIN.test(ch)) return 'latin';
  return 'other';
}

const SCRIPT_TO_BCP47: Record<Script, string> = {
  'han-cn': 'zh-CN',
  'han-hk': 'zh-HK',
  jp: 'ja-JP',
  ko: 'ko-KR',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN',
  th: 'th-TH',
  he: 'he-IL',
  el: 'el-GR',
  latin: 'en-US',
  other: 'en-US',
};

/** Best-effort BCP-47 detection across the whole string. Returns null if the
 *  string contains no script-bearing characters. */
export function detectBcp47Lang(text: string): string | null {
  if (!text) return null;
  let dominant: Script | null = null;
  let dominantCount = 0;
  let hanCount = 0;
  let tradCount = 0;
  const tally: Partial<Record<Script, number>> = {};
  for (const ch of text) {
    if (HAN.test(ch)) {
      hanCount += 1;
      if (TRAD_BIAS.test(ch)) tradCount += 1;
    }
    const script = classify(ch);
    if (script === 'other') continue;
    tally[script] = (tally[script] ?? 0) + 1;
    if ((tally[script] ?? 0) > dominantCount) {
      dominantCount = tally[script] as number;
      dominant = script;
    }
  }
  if (!dominant) return null;
  // Resolve han ambiguity at the document level.
  if (dominant === 'han-cn' && hanCount > 0 && tradCount / hanCount >= 0.15) {
    return SCRIPT_TO_BCP47['han-hk'];
  }
  return SCRIPT_TO_BCP47[dominant];
}

/** Picks the closest voice for a BCP-47 tag. Prefers exact match → language
 *  prefix match → first available voice for that language family. Returns
 *  null when nothing usable exists (caller should let the browser default). */
export function pickVoiceForLang(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const target = lang.toLowerCase();
  const prefix = target.split('-')[0];
  const exact = voices.find((v) => v.lang.toLowerCase() === target);
  if (exact) return exact;
  // For zh-HK, fall back to any zh-* voice that mentions Cantonese / HK / TW.
  if (target === 'zh-hk') {
    const cantonese = voices.find((v) => /yue|cantonese|hk|hong\s*kong/i.test(`${v.lang} ${v.name}`));
    if (cantonese) return cantonese;
    const tw = voices.find((v) => v.lang.toLowerCase().startsWith('zh-tw'));
    if (tw) return tw;
  }
  const sameLang = voices.find((v) => v.lang.toLowerCase().startsWith(`${prefix}-`));
  if (sameLang) return sameLang;
  const samePrefix = voices.find((v) => v.lang.toLowerCase() === prefix);
  return samePrefix ?? null;
}

/** Splits the content into language-coherent chunks. Whitespace and
 *  punctuation cling to the preceding chunk so we don't fragment on every
 *  comma. Each chunk carries the BCP-47 tag we'll feed to the utterance. */
export function splitForTts(content: string): TtsChunk[] {
  const trimmed = content?.trim() ?? '';
  if (!trimmed) return [];

  // Detect a document-level Chinese variant so all han runs in this answer
  // pick the same voice (avoids zh-CN/zh-HK flipping mid-paragraph).
  const docLang = detectBcp47Lang(trimmed);
  const hanHint: 'han-cn' | 'han-hk' =
    docLang === 'zh-HK' ? 'han-hk' : 'han-cn';

  const chunks: TtsChunk[] = [];
  let buffer = '';
  let bufferScript: Script | null = null;

  const flush = () => {
    if (!buffer.trim()) {
      buffer = '';
      bufferScript = null;
      return;
    }
    const script = bufferScript ?? 'latin';
    chunks.push({ text: buffer, lang: SCRIPT_TO_BCP47[script] });
    buffer = '';
    bufferScript = null;
  };

  for (const ch of trimmed) {
    const script = classify(ch, hanHint);
    if (script === 'other') {
      // Whitespace, punctuation, digits — stick to the current run.
      buffer += ch;
      continue;
    }
    if (bufferScript === null || script === bufferScript) {
      bufferScript = script;
      buffer += ch;
      continue;
    }
    flush();
    bufferScript = script;
    buffer = ch;
  }
  flush();

  // Merge tiny runs (<3 chars of latin alphanumerics surrounded by another
  // language) back into their neighbour to avoid a stutter on words like
  // "API" inside a Chinese sentence.
  const merged: TtsChunk[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (
      last &&
      chunk.lang === 'en-US' &&
      chunk.text.trim().length <= 2 &&
      last.lang &&
      last.lang !== 'en-US'
    ) {
      last.text += chunk.text;
      continue;
    }
    merged.push(chunk);
  }
  return merged;
}
