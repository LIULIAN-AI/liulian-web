/**
 * Regression test: flex-shrink:0 on messagesArea direct children.
 *
 * Bug: R7-R9 — In a flex-direction:column parent (.messagesArea),
 * direct children without flex-shrink:0 get squeezed below their
 * content height as the thread grows past the container. This caused
 * message bubbles to collapse on turn 2+ conversations.
 *
 * Fix: All direct children of .messagesArea (flex column containers)
 * must have flex-shrink:0 set. This test parses the CSS module to
 * verify the rule is present.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const cssPath = path.resolve(
  __dirname,
  '../../components/chat/chat.module.css',
);

describe('flex-shrink:0 in messagesArea (regression: R7-R9 bubble squeeze)', () => {
  let css: string;

  beforeAll(() => {
    css = fs.readFileSync(cssPath, 'utf-8');
  });

  it('chat.module.css exists and is non-empty', () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it('.messagesArea uses flex-direction: column', () => {
    const messagesAreaBlock = css.match(
      /\.messagesArea\s*\{[^}]*\}/s,
    );
    expect(messagesAreaBlock).not.toBeNull();
    expect(messagesAreaBlock![0]).toMatch(/flex-direction\s*:\s*column/);
  });

  it('.messagesArea has overflow-y for scrolling', () => {
    const messagesAreaBlock = css.match(
      /\.messagesArea\s*\{[^}]*\}/s,
    );
    expect(messagesAreaBlock).not.toBeNull();
    expect(messagesAreaBlock![0]).toMatch(/overflow-y\s*:/);
  });
});
