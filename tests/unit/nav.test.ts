import { describe, expect, it } from 'vitest';
import { activeSection, sectionIdFromHref } from '../../src/lib/nav';

describe('sectionIdFromHref', () => {
  it('mengambil id setelah tanda pagar', () => {
    expect(sectionIdFromHref('/#tentang')).toBe('tentang');
    expect(sectionIdFromHref('#project')).toBe('project');
  });

  it('mengembalikan null bila tidak ada id', () => {
    expect(sectionIdFromHref('/')).toBeNull();
    expect(sectionIdFromHref('/#')).toBeNull();
  });
});

describe('activeSection', () => {
  const tops = [
    { id: 'tentang', top: -400 },
    { id: 'project', top: 80 },
    { id: 'aktivitas', top: 900 },
  ];

  it('memilih section terakhir yang sudah melewati garis', () => {
    expect(activeSection(tops, 200)).toBe('project');
    expect(activeSection(tops, 0)).toBe('tentang');
  });

  it('null bila belum ada section yang melewati garis', () => {
    expect(activeSection(tops, -500)).toBeNull();
    expect(activeSection([], 100)).toBeNull();
  });
});
