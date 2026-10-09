import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRELOADING_CLASS } from '../../src/lib/preload';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('preload', () => {
  it('script inline memasang class yang sama dengan src/lib/preload', () => {
    expect(read('src/layouts/BaseLayout.astro')).toContain(`classList.add('${PRELOADING_CLASS}')`);
  });

  it('CSS mengenali class yang sama', () => {
    expect(read('src/styles/global.css')).toContain(`.${PRELOADING_CLASS}`);
  });
});
