import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Hanya https, supaya konten tidak bisa menyelipkan skema lain (mis. `javascript:`). */
const httpsUrl = z.url({ protocol: /^https$/ });

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
    /** Kartu tanpa `url` tidak menjadi link. */
    url: httpsUrl.optional(),
    /** Urutan tampil, kecil lebih dulu. */
    order: z.number().int(),
  }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/certificates' }),
  schema: z.object({
    name: z.string().min(1),
    issuer: z.string().min(1),
    credentialId: z.string().min(1),
    verifyUrl: httpsUrl,
    /** `true` untuk entri contoh; section menampilkan label "data contoh" selama masih ada. */
    sample: z.boolean().default(false),
    order: z.number().int(),
  }),
});

export const collections = { projects, certificates };
