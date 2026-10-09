# CLAUDE.md — Portofolio Keamanan Siber Parid

File ini adalah konteks utama untuk Claude Code. Baca seluruhnya sebelum mengerjakan tugas apa pun. Spesifikasi lengkap ada di `docs/PRD.md`.

---

## 1. Tentang project

Situs portofolio pribadi **statis tanpa backend** milik Parid, mahasiswa Informatika Universitas Malikussaleh yang fokus pada keamanan siber (web exploitation, reverse engineering, ML untuk deteksi malware).

**Tujuan:**

- Recruiter memahami siapa Parid dalam < 10 detik (nama, role, CTA project & CV).
- Menampilkan project, sertifikat yang bisa diverifikasi, dan aktivitas Hack The Box (heatmap ala GitHub) yang ter-update otomatis.
- Situs itu sendiri menjadi bukti praktik keamanan: header ketat, tanpa cookie/tracker, supply chain terjaga.

**Arah desain:** netral profesional + aksen cyber yang bermakna. Rapi dan mudah dibaca; elemen cyber hanya jika punya fungsi (preload TLS handshake, heatmap HTB, `security.txt`). **Hindari** estetika hacker klise (hijau neon, efek Matrix, glitch berlebihan) dan pola "AI slop" (gradient ungu, glassmorphism, emoji sebagai ikon, font Inter/Roboto).

**Section (urutan):** Preload → Navbar → Hero → Marquee tools → 01 Tentang → 02 Project → 03 Aktivitas HTB → 04 Sertifikat → Footer/Kontak.

Konten ditambahkan lewat commit Git (Markdown/YAML/JSON), **bukan** lewat form upload.

**Keputusan yang sudah tetap:**

- Domain sementara: `portofolio.farid-kurniawan0412.workers.dev` — hanya didefinisikan sekali di `astro.config.mjs` (`site`), jangan di-hard-code di tempat lain.
- Kontak: GitHub, LinkedIn, WhatsApp (`https://wa.me/<nomor>`), data di `src/data/profile.ts`. Tidak ada email publik dan PGP di v1.
- CV: PDF Bahasa Indonesia di `public/cv/CV-Parid.pdf`.
- Bahasa UI: Indonesia (`lang="id"`).

## 2. Tech stack & design system

### Tech stack

| Lapisan             | Pilihan                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------- |
| Framework           | Astro 7, `output: 'static'`                                                             |
| Komponen interaktif | React 19 sebagai _islands_ (hanya untuk yang beranimasi/interaktif)                     |
| Animasi             | Motion (`import { motion } from "motion/react"`) — **bukan** paket lama `framer-motion` |
| Styling             | Tailwind CSS v4 + CSS variables untuk token tema                                        |
| Bahasa              | TypeScript strict, dipin ke `^6` (batas `typescript-eslint` & `@astrojs/check`)         |
| Validasi            | Zod (skema Content Collections & respons API HTB)                                       |
| Lint/format         | ESLint 10 (+ `eslint-plugin-astro`, `eslint-plugin-jsx-a11y-x`) + Prettier              |
| Test                | Vitest (unit), Playwright + @axe-core/playwright (smoke & a11y)                         |
| CI/CD               | GitHub Actions (sync HTB, audit, build)                                                 |
| Hosting             | Cloudflare Workers static assets, deploy via Git (header via `public/_headers`)         |
| Package manager     | npm (lockfile wajib di-commit)                                                          |

Jangan menambah dependensi baru tanpa persetujuan (lihat §5).

### Design system

**Warna** — selalu lewat CSS variables, jangan hard-code hex di komponen:

| Token         | Terang                | Gelap                 |
| ------------- | --------------------- | --------------------- |
| `--bg`        | `#EFF3F2`             | `#0B1213`             |
| `--panel`     | `#FFFFFF`             | `#121B1C`             |
| `--ink`       | `#101718`             | `#E7EEED`             |
| `--muted`     | `#45504F`             | `#AEBBBA`             |
| `--faint`     | `#566261`             | `#8A9897`             |
| `--line`      | `#D2DBDA`             | `#22302F`             |
| `--accent`    | `#0D7A79`             | `#5EEAD4`             |
| `--accent-hi` | `#2CC6BE`             | `#5EEAD4`             |
| `--heat-0..4` | `#E1E8E7` → `#0D7A79` | `#16211F` → `#5EEAD4` |

`--accent` terang digelapkan dari `#0E7C7B` (mockup) agar kontras di atas `--bg` ≥ 4.5:1; dijaga oleh `tests/unit/tokens.test.ts`.

Tema: class `.dark` di `<html>`; default ikut `prefers-color-scheme`; pilihan disimpan di `localStorage`.

**Tipografi:** Schibsted Grotesk (judul & isi), JetBrains Mono (hanya label, metadata, angka, kode). Font **di-self-host** di `public/fonts/`, tidak memuat Google Fonts saat runtime.

- H1 hero: `clamp(72px, 11vw, 168px)`, weight 800, letter-spacing −0.05em
- H2: 44 px, weight 800, letter-spacing −0.03em
- Body: 17 px, line-height 1.6
- Label mono: 12–13 px

**Layout:** container maks 1200 px, padding 32 px (16 px mobile), grid 12 kolom, radius 0 (kecuali kotak heatmap 2 px), nomor section `01–04` mono berwarna aksen, tombol tinggi ≥ 48 px.

**Motion:**

- Easing utama `cubic-bezier(.2,.7,.2,1)`, reveal `cubic-bezier(.7,0,.2,1)`.
- Durasi mikro 150–250 ms, reveal 600–1100 ms.
- Hanya animasikan `transform` dan `opacity`.
- Reveal hanya **sekali** saat masuk viewport.
- Kilatan/flash maksimal 3 per detik (WCAG 2.3.1).
- **Setiap** animasi wajib menghormati `prefers-reduced-motion` (`useReducedMotion()`).
- Parallax pakai `useMotionValue` + `useSpring`, bukan `useState` per mousemove. Nonaktif di perangkat sentuh.

## 3. Struktur folder

> **Status: M0 selesai.** Yang bertanda ✅ sudah ada; sisanya **rencana target**. Saat folder/file dibuat, dipindah, atau dihapus, **perbarui bagian ini** agar selalu sesuai kondisi nyata.

```
.
├── CLAUDE.md                  ✅ # File ini — konteks untuk Claude Code
├── docs/
│   └── PRD.md                 ✅ # Spesifikasi produk lengkap
├── astro.config.mjs           ✅ # Konfigurasi Astro (static, React, Tailwind; sitemap di M4)
├── tsconfig.json              ✅ # TypeScript strict
├── eslint.config.js           ✅ # ESLint flat config
├── prettier.config.mjs        ✅ # Prettier (+ plugin astro, tailwindcss)
├── vitest.config.ts           ✅ # Vitest (tests/unit)
├── package.json / package-lock.json ✅
├── public/
│   ├── _headers               ✅ # Header keamanan Cloudflare (CSP, HSTS, dll.)
│   ├── .well-known/security.txt  # RFC 9116
│   ├── robots.txt
│   ├── fonts/                 ✅ # Font self-host (woff2 variable, subset Latin) + lisensi OFL
│   └── cv/                       # CV PDF
├── scripts/
│   ├── check-csp.mjs          ✅ # Cocokkan inline script/style di dist/ dengan CSP _headers
│   └── sync-htb.ts               # Ambil data HTB → src/data/htb-activity.json
├── src/
│   ├── assets/                   # Gambar yang dioptimasi Astro (hero, foto, sertifikat)
│   ├── components/
│   │   ├── astro/             ✅ # Komponen .astro: Navbar, ThemeToggle (nanti: Footer, SectionHeader, ...)
│   │   └── react/                # Islands beranimasi (.tsx): Preload, HeroArt, PhotoCard, Heatmap, Marquee
│   ├── content/                  # Content Collections
│   │   ├── projects/             # *.md, satu file per project
│   │   ├── certificates/         # *.yaml, satu file per sertifikat
│   │   └── writeups/             # (v2, belum ditampilkan)
│   ├── content.config.ts         # Skema Zod untuk semua collection
│   ├── data/
│   │   ├── htb-activity.json     # Ditulis otomatis oleh GitHub Actions — jangan diedit manual
│   │   ├── nav.ts             ✅ # Link anchor navbar
│   │   ├── profile.ts         ✅ # Baru nama (nanti: role, ringkasan, fokus, pendidikan, link sosial)
│   │   └── tools.ts              # Daftar tools untuk marquee
│   ├── layouts/
│   │   └── BaseLayout.astro   ✅ # <head>, meta, script tema, skip link
│   ├── lib/                   ✅ # Utilitas murni: contrast.ts, theme.ts (nanti: format tanggal, agregasi heatmap)
│   ├── pages/
│   │   ├── index.astro        ✅ # Halaman utama (masih placeholder M0)
│   │   └── 404.astro
│   └── styles/
│       └── global.css         ✅ # Tailwind + token CSS variables
├── tests/
│   ├── unit/                  ✅ # Vitest
│   └── e2e/                      # Playwright + axe
└── .github/
    ├── dependabot.yml
    └── workflows/
        ├── ci.yml                # lint, typecheck, test, audit, build di setiap PR
        └── sync-htb.yml          # cron tiap 6 jam + workflow_dispatch
```

## 4. Aturan coding

### Umum

- TypeScript strict; dilarang `any` (pakai `unknown` + narrowing). Tidak ada `@ts-ignore` tanpa komentar alasan.
- Satu komponen per file. Nama komponen `PascalCase`, file utilitas `kebab-case.ts`, konstanta `SCREAMING_SNAKE_CASE`.
- Default ke **komponen Astro** (tanpa JS). Pakai React island hanya bila butuh interaksi/animasi, dengan directive paling hemat: `client:visible` > `client:idle` > `client:load` (hanya hero & preload).
- Konten (teks profil, project, sertifikat, tools) **tidak di-hard-code** di komponen; ambil dari `src/content/` atau `src/data/`.
- Fungsi murni di `src/lib/` dan wajib punya unit test.
- Jangan tinggalkan `console.log`, kode mati, atau TODO tanpa konteks.

### Styling

- Tailwind utility + CSS variables. Tidak ada warna hex langsung di komponen.
- Mobile-first; cek di 360 px, 768 px, 1280 px.
- Jangan menambah font, warna aksen, atau radius baru di luar design system.

### Aksesibilitas (wajib, bukan opsional)

- HTML semantik: `<button>` untuk aksi, `<a href>` untuk navigasi. Jangan `onClick` pada `<div>`.
- Semua gambar punya `alt` (dekoratif: `alt=""` + `aria-hidden`).
- Kontras teks ≥ 4.5:1; target sentuh ≥ 44 px; fokus keyboard terlihat (`:focus-visible`).
- Elemen animasi dekoratif `aria-hidden="true"`; teks yang dianimasikan karakter demi karakter wajib punya `aria-label` berisi teks asli.

### Keamanan

- Dilarang `set:html`, `dangerouslySetInnerHTML`, `eval`, `new Function`.
- Island React pertama akan membuat Astro menyisipkan 2 script + 1 `<style>` inline (runtime hidrasi) yang diblokir CSP saat ini. Menambah hash-nya adalah perubahan CSP: **tanya dulu** (§5).
- Tidak ada inline script kecuali script tema di `BaseLayout` (hash-nya harus diperbarui di CSP `public/_headers` setiap kali isinya berubah).
- Tidak ada request ke domain pihak ketiga saat runtime (font, analytics, CDN).
- Link eksternal: `target="_blank" rel="noopener noreferrer"`.
- Secret (mis. `HTB_API_TOKEN`) **hanya** di GitHub Secrets dan hanya dipakai di `scripts/`. Jangan pernah masuk ke `src/`, ke `PUBLIC_*` env, atau ke log.
- Akses `localStorage`/`sessionStorage` selalu dibungkus `try/catch`.
- GitHub Actions: `permissions:` minimum, action di-pin ke commit SHA.
- Gambar baru: hapus EXIF sebelum commit.

### Performa

- Gambar lewat `<Image>`/`<Picture>` Astro (AVIF/WebP), sertakan `width`/`height`. Hero: `loading="eager"` + `fetchpriority="high"`; lainnya lazy.
- Target: Lighthouse ≥ 95, JS halaman < 80 KB gzip.

### Git

- Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:`.
- Commit kecil dan fokus. Jangan commit/push kecuali diminta.
- Sebelum menyatakan tugas selesai, jalankan: `npm run lint && npm run typecheck && npm run test && npm run build && npm run check:csp`.

## 5. Saat instruksi ambigu: tanya dulu

**Jika instruksi ambigu, kontradiktif, atau kurang informasi, berhenti dan tanyakan ke Parid sebelum menulis kode.** Jangan menebak lalu membangun banyak hal di atas tebakan.

Wajib bertanya terlebih dahulu jika:

- Permintaan bisa ditafsirkan lebih dari satu cara (mis. "rapikan hero" — layout, animasi, atau teks?).
- Akan **menambah dependensi** baru, mengganti library, atau mengubah tech stack.
- Akan mengubah **design system** (warna, font, spacing, radius) atau struktur/urutan section.
- Akan mengubah konfigurasi keamanan (CSP, header, workflow, permission Actions).
- Menyentuh lebih dari ~5 file atau melakukan refactor besar.
- Melibatkan konten pribadi yang belum ada (teks profil, kontak, data sertifikat) — **jangan mengarang**; pakai placeholder `[NAMA_FIELD]` dan tanyakan.
- Ada konflik antara permintaan dan aturan di file ini atau `docs/PRD.md`.

Cara bertanya: ringkas, sebutkan pilihan yang masuk akal beserta trade-off singkat, dan rekomendasikan satu. Untuk hal kecil dengan default yang jelas (mis. nama variabel), putuskan sendiri dan sebutkan asumsinya di ringkasan akhir.

## 6. Fitur yang sudah jalan

> Perbarui daftar ini setiap kali fitur selesai dan lulus `lint + typecheck + test + build`. Format: `- [x] Nama fitur — catatan singkat (tanggal)`.

- [x] M0 — Setup project: Astro 7 + TS strict + Tailwind v4 + React/Motion terpasang, ESLint/Prettier/Vitest, token desain, font self-host, BaseLayout dengan script tema anti-flash, `_headers` + `check:csp`. (2026-10-09)
- [x] Deploy pertama — repo `Pariddd/portofolio` terhubung ke Cloudflare Workers (static assets), auto-deploy tiap push ke `main`; header keamanan dari `_headers` terverifikasi di situs live. (2026-10-09)
- [x] F2 — Tema terang/gelap + Navbar: toggle di navbar (komponen Astro + script eksternal, bukan island React), ikut `prefers-color-scheme` sampai pengguna memilih, pilihan disimpan di `localStorage`. Link navbar menunjuk ke section yang belum dibuat. (2026-10-09)

Rencana (lihat `docs/PRD.md` §12):

- [ ] F3 — Hero (nama, role, CTA, ilustrasi)
- [ ] F4 — Marquee tools
- [ ] F5 — Tentang saya + kartu akses
- [ ] F6 — Project pilihan (Content Collection)
- [ ] F8 — Sertifikat dengan link verifikasi
- [ ] F10 — Footer, `security.txt`
- [ ] F12 — Halaman 404
- [ ] F1 — Preload TLS handshake
- [ ] Animasi hero (pembuka, parallax, busur listrik, kilau mata)
- [ ] Animasi scan reveal foto
- [ ] F9 — Sync HTB via GitHub Actions
- [ ] F7 — Heatmap HTB dari data nyata
- [ ] F11 — SEO & meta
- [ ] Hardening: CSP final, Playwright + axe, audit

## Referensi desain

Mockup ada di canvas Claude Design "Portofolio Parid". Artboard acuan: **"Hero — gambar + teal"** (hero final) dan **"Hero + About — animasi"** (About + scan reveal). Artboard lain adalah eksplorasi lama dan bukan acuan.
