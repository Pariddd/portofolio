import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/lib/contrast';

const AA_NORMAL_TEXT = 4.5;
const TEXT_TOKENS = ['ink', 'muted', 'faint', 'accent'] as const;
const SURFACE_TOKENS = ['bg', 'panel'] as const;

const css = readFileSync(new URL('../../src/styles/global.css', import.meta.url), 'utf8');

function readTokens(selector: string): Map<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  if (block === undefined) {
    throw new Error(`Blok "${selector}" tidak ditemukan di global.css`);
  }
  const tokens = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})\s*;/gi)) {
    if (name !== undefined && value !== undefined) {
      tokens.set(name, value);
    }
  }
  return tokens;
}

function token(tokens: Map<string, string>, name: string): string {
  const value = tokens.get(name);
  if (value === undefined) {
    throw new Error(`Token --${name} tidak ditemukan`);
  }
  return value;
}

describe.each([
  ['terang', ':root'],
  ['gelap', '.dark'],
])('kontras token tema %s', (_label, selector) => {
  const tokens = readTokens(selector);

  for (const surface of SURFACE_TOKENS) {
    it.each(TEXT_TOKENS)(`--%s di atas --${surface} memenuhi WCAG AA`, (text) => {
      const ratio = contrastRatio(token(tokens, text), token(tokens, surface));
      expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  }

  it('mendefinisikan lima tingkat heatmap', () => {
    for (let level = 0; level <= 4; level++) {
      expect(tokens.has(`heat-${level}`)).toBe(true);
    }
  });
});
