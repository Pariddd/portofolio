import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Hanya https, supaya konten tidak bisa menyelipkan skema lain (mis. `javascript:`). */
const httpsUrl = z.url({ protocol: /^https$/ });

// Isi file Markdown (di bawah frontmatter) adalah penjelasan project di pop-up detail.
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** Label kategori di kiri atas kartu, mis. "RISET". */
      category: z.string().min(1),
      /** Label topik/teknik di kanan atas kartu, mis. "malware". */
      topic: z.string().min(1),
      summary: z.string().min(1),
      stack: z.array(z.string().min(1)).min(1),
      /** Tangkapan layar untuk pop-up, path relatif ke `src/assets/projects/`. */
      screenshots: z.array(image()).default([]),
      /** URL repo; tanpa ini tombol "Buka repo" tidak tampil. */
      url: httpsUrl.optional(),
      /** Urutan tampil, kecil lebih dulu. */
      order: z.number().int(),
    }),
});

const certificates = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/certificates' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      issuer: z.string().min(1),
      credentialId: z.string().min(1),
      verifyUrl: httpsUrl,
      /** Gambar halaman pertama sertifikat untuk pop-up, dari `src/assets/certificates/`. */
      image: image().optional(),
      /** Path publik PDF sertifikat di `public/certificates/`. */
      pdf: z
        .string()
        .regex(/^\/certificates\/[\w.-]+\.pdf$/)
        .optional(),
      /** `true` untuk entri contoh; section menampilkan label "data contoh" selama masih ada. */
      sample: z.boolean().default(false),
      order: z.number().int(),
    }),
});

export const collections = { projects, certificates };
