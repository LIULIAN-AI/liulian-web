/**
 * Regression test: i18n key consistency across all locales.
 *
 * Bug: R8-R9 — hardcoded Chinese strings in OnlineModeToggle and
 * English-only labels in MessageBubble caused mixed-language UI when
 * the locale didn't match the hardcoded text. Fixed by moving all
 * chat strings to messages/*.json under the Chat namespace.
 *
 * This test ensures every key in en.json exists in zh-CN.json and
 * zh-HK.json (and vice versa), catching drift introduced by future
 * component changes.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function flatten(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const sub of flatten(v as Record<string, unknown>, full)) {
        keys.add(sub);
      }
    } else {
      keys.add(full);
    }
  }
  return keys;
}

const messagesDir = path.resolve(__dirname, '../../messages');

const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'));
const cn = JSON.parse(fs.readFileSync(path.join(messagesDir, 'zh-CN.json'), 'utf-8'));
const hk = JSON.parse(fs.readFileSync(path.join(messagesDir, 'zh-HK.json'), 'utf-8'));

const NAMESPACES = Object.keys(en);

describe('i18n key consistency (regression: R8-R9 hardcoded strings)', () => {
  for (const ns of NAMESPACES) {
    const enKeys = flatten(en[ns] ?? {});
    const cnKeys = flatten(cn[ns] ?? {});
    const hkKeys = flatten(hk[ns] ?? {});

    it(`${ns}: zh-CN has all keys from en`, () => {
      const missing = [...enKeys].filter((k) => !cnKeys.has(k));
      expect(missing).toEqual([]);
    });

    it(`${ns}: zh-HK has all keys from en`, () => {
      const missing = [...enKeys].filter((k) => !hkKeys.has(k));
      expect(missing).toEqual([]);
    });

    it(`${ns}: en has all keys from zh-CN (no orphans)`, () => {
      const extra = [...cnKeys].filter((k) => !enKeys.has(k));
      expect(extra).toEqual([]);
    });

    it(`${ns}: en has all keys from zh-HK (no orphans)`, () => {
      const extra = [...hkKeys].filter((k) => !enKeys.has(k));
      expect(extra).toEqual([]);
    });
  }
});
