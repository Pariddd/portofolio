import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(1),
    /** Label kategori di kiri atas kartu, mis. "RISET". */
    category: z.string().min(1),
    /** Label topik/teknik di kanan atas kartu, mis. "malware". */
    topic: z.string().min(1),
    summary: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    /** Hanya https; kartu tanpa `url` tidak menjadi link. */
    url: z.url({ protocol: /^https$/ }).optional(),
    /** Urutan tampil, kecil lebih dulu. */
    order: z.number().int(),
  }),
});

export const collections = { projects };
