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

| Lapisan             | Pilihan                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Astro 7, `output: 'static'`                                                                                                       |
| Komponen interaktif | React 19 sebagai _islands_ (hanya untuk yang beranimasi/interaktif)                                                               |
| Animasi             | Motion for React di island: `useAnimate` dari `motion/react-mini` (+ `useInView` dari `motion/react`) — **bukan** `framer-motion` |
| Styling             | Tailwind CSS v4 + CSS variables untuk token tema                                                                                  |
| Bahasa              | TypeScript strict, dipin ke `^6` (batas `typescript-eslint` & `@astrojs/check`)                                                   |
| Validasi            | Zod (skema Content Collections & respons API HTB)                                                                                 |
| Lint/format         | ESLint 10 (+ `eslint-plugin-astro`, `eslint-plugin-jsx-a11y-x`) + Prettier                                                        |
| Test                | Vitest (unit), Playwright + @axe-core/playwright (smoke & a11y)                                                                   |
| CI/CD               | GitHub Actions (sync HTB, audit, build)                                                                                           |
| Hosting             | Cloudflare Workers static assets, deploy via Git (header via `public/_headers`)                                                   |
| Package manager     | npm (lockfile wajib di-commit)                                                                                                    |

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

- H1 hero (nama lengkap, dua baris): `clamp(44px, 15vw, 112px)`, mulai `lg` `clamp(64px, 7.4vw, 96px)`, weight 800, letter-spacing −0.05em. Diperkecil dari mockup (168 px) supaya "Kurniawan." muat satu baris.
- H2: 44 px, weight 800, letter-spacing −0.03em
- Body: 17 px, line-height 1.6
- Label mono: 12–13 px

**Layout:** container maks 1200 px, padding 32 px (16 px mobile), grid 12 kolom, radius 0 (kecuali kotak heatmap 2 px), nomor section `01–04` mono berwarna aksen, tombol tinggi ≥ 48 px.

**Motion:**

- Easing utama `cubic-bezier(.2,.7,.2,1)`, reveal `cubic-bezier(.7,0,.2,1)`.
- Durasi mikro 150–250 ms, reveal 600–1100 ms.
- Hanya animasikan `transform` dan `opacity`.
- Reveal hanya **sekali** saat masuk viewport: judul section, teks Tentang, kartu project, baris sertifikat, dan kontak naik bertahap (`Reveal` efek `rise`). Pengecualian (permintaan Parid): garis pindai di foto Tentang berulang terus setelah tirai pembuka.
- Kilatan/flash maksimal 3 per detik (WCAG 2.3.1).
- **Setiap** animasi wajib menghormati `prefers-reduced-motion`: island memanggil `prefersReducedMotion()` (`src/lib/motion.ts`) dan tidak menganimasikan apa pun bila aktif; CSS memakai `@media`.
- Parallax: `HeroMotion` menganimasikan `transform` tiap lapisan `data-depth` (px) mengikuti pointer, dibatasi `requestAnimationFrame`. Nonaktif di perangkat sentuh.
- **Implementasi (keputusan Parid, 2026-10-09):** semua animasi dijalankan Motion di island React (`src/components/react/`). Markup tetap di komponen Astro dan diteruskan lewat slot; island hanya menganimasikan elemen bertanda `data-hero`, `data-depth`, `data-reveal-item`, `data-marquee-track`.
- Pakai `useAnimate` dari `motion/react-mini` dengan nilai `transform`/`opacity` eksplisit. **Jangan** pakai komponen `<motion.*>`/`<m.*>` dengan prop `initial`: saat SSR ia menulis atribut `style=""` yang diblokir CSP, dan paket penuhnya membuat JS ±95 KB gzip (anggaran 80 KB; saat ini ±77 KB).
- Keadaan awal tersembunyi dipasang lewat class atau CSSOM saat hidrasi, supaya tanpa JavaScript konten tetap terlihat.
- Satu-satunya animasi CSS: `animate-preload-failsafe` (overlay preload tetap hilang setelah 6 detik bila island gagal dimuat).
- Preload tampil di **setiap** muat halaman (permintaan Parid) dan ditutup "Selamat datang."; animasi pembuka hero menunggu event `preload:done` (`src/lib/preload.ts`). Judul hero muncul huruf demi huruf (`data-hero="char"`, `<h1>` memakai `aria-label`).

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
│   └── cv/                    ✅ # CV-Parid.pdf
├── scripts/
│   ├── check-csp.mjs          ✅ # Cocokkan hash inline script dan <style> di dist/ dengan CSP _headers
│   └── sync-htb.ts               # Ambil data HTB → src/data/htb-activity.json
├── src/
│   ├── assets/                ✅ # Gambar yang dioptimasi Astro: hero.jpg, photo.jpg (nanti: sertifikat)
│   ├── components/
│   │   ├── astro/             ✅ # Markup: Navbar, ThemeToggle, Hero, Marquee, SectionHeader, About, Projects, ProjectCard, Activity, Certificates, Footer
│   │   └── react/             ✅ # Island Motion: Preload, HeroMotion, MarqueeMotion, Reveal
│   ├── content/               ✅ # Content Collections
│   │   ├── projects/          ✅ # *.md, satu file per project (URL masih dummy)
│   │   ├── certificates/      ✅ # *.yaml, satu file per sertifikat (isi masih contoh, `sample: true`)
│   │   └── writeups/             # (v2, belum ditampilkan)
│   ├── content.config.ts      ✅ # Skema Zod: projects, certificates
│   ├── data/
│   │   ├── htb-activity.json     # Ditulis otomatis oleh GitHub Actions — jangan diedit manual
│   │   ├── htb-sample.ts      ✅ # DATA CONTOH heatmap sampai F9 ada
│   │   ├── nav.ts             ✅ # Link anchor navbar
│   │   ├── profile.ts         ✅ # Nama, teks hero, handle, path CV, ringkasan, fokus, pendidikan, kontak (sebagian dummy)
│   │   └── tools.ts           ✅ # Daftar tools untuk marquee
│   ├── layouts/
│   │   └── BaseLayout.astro   ✅ # <head>, meta, script tema + penanda preload, skip link, Navbar, Footer
│   ├── lib/                   ✅ # Utilitas murni: contrast.ts, theme.ts, preload.ts, motion.ts, parallax.ts, heatmap.ts
│   ├── pages/
│   │   ├── index.astro        ✅ # Halaman utama
│   │   └── 404.astro          ✅
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
- Default ke **komponen Astro** (tanpa JS). Pakai React island hanya bila butuh interaksi/animasi, dengan directive paling hemat: `client:visible` > `client:idle` > `client:load` (hanya hero & preload). Island reveal memakai `client:idle`, bukan `client:visible`, supaya keadaan tersembunyi terpasang sebelum elemen terlihat.
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
- CSP `public/_headers` memuat hash untuk: script `<head>` BaseLayout, tiga script hidrasi island Astro (`astro-island`, `client:load`, `client:idle`), dan satu `<style>` Astro. Hash hidrasi berubah bila Astro di-upgrade atau directive `client:*` baru dipakai: jalankan `npm run build && npm run check:csp -- --print` lalu perbarui. Menambah sumber atau `unsafe-*` tetap **tanya dulu** (§5).
- Tidak ada inline script buatan sendiri kecuali script di `<head>` `BaseLayout` (tema + penanda preload; hash-nya harus diperbarui di CSP setiap kali isinya berubah).
- Mengubah gaya dari script hanya lewat CSSOM atau Motion; atribut `style=""` di HTML (termasuk prop `style` React yang ikut ter-SSR) diblokir CSP.
- Tidak ada request ke domain pihak ketiga saat runtime (font, analytics, CDN).
- Link eksternal: `target="_blank" rel="noopener noreferrer"`.
- Secret (mis. `HTB_API_TOKEN`) **hanya** di GitHub Secrets dan hanya dipakai di `scripts/`. Jangan pernah masuk ke `src/`, ke `PUBLIC_*` env, atau ke log.
- Akses `localStorage`/`sessionStorage` selalu dibungkus `try/catch`.
- GitHub Actions: `permissions:` minimum, action di-pin ke commit SHA.
- Gambar baru: hapus EXIF sebelum commit.

### Performa

- Gambar lewat `<Image>`/`<Picture>` Astro (AVIF/WebP), sertakan `width`/`height`. Hero: `loading="eager"` + `fetchpriority="high"`; lainnya lazy.
- Target: Lighthouse ≥ 95. JS halaman ±80 KB gzip adalah patokan, bukan batas keras: boleh dilampaui bila hasilnya lebih baik (keputusan Parid, 2026-10-09); sebutkan ukurannya di ringkasan.

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
- [x] F3 — Hero mengikuti artboard FINAL: tagline, nama lengkap `PROFILE.fullName` ("Farid Kurniawan", dua baris), role, ringkasan, CTA project + CV, panel gambar miring dengan bingkai dan cincin. Gambar `src/assets/hero.jpg` **sementara** (674 px, persegi, masih berlatar); lencana `handle` tampil setelah `PROFILE.handle` diisi. (2026-10-09)
- [x] F4 — Marquee tools: digerakkan island `MarqueeMotion`, berhenti saat hover, diam saat `prefers-reduced-motion`, plus kotak centang "jeda" yang muncul saat difokus keyboard. (2026-10-09)
- [x] F5 — Tentang saya + kartu akses (statis): foto `src/assets/photo.jpg` (dipotong 4:5, hitam-putih sampai kartu di-hover), `about` teks sementara, `status`/`handle`/tahun masuk disembunyikan sampai diisi di `profile.ts`. (2026-10-09)
- [x] F6 — Project pilihan: Content Collection `projects` (skema Zod di `src/content.config.ts`), dua project dari mockup. Kartu tanpa `url` tidak menjadi link; project ketiga belum ada, URL masih dummy. (2026-10-09)
- [x] F1 — Preload TLS handshake: island `Preload`, ±2,3 detik, tampil di setiap muat halaman dan ditutup "Selamat datang.", tombol lewati, tidak tampil tanpa JavaScript atau saat reduced motion. (2026-10-09)
- [x] Animasi hero (island `HeroMotion`): kilatan pembuka, panel gambar naik, teks naik bertahap, busur listrik, cincin berputar, parallax pointer. "Kilau mata" tidak ada di artboard FINAL dan tidak dibuat. (2026-10-09)
- [x] Animasi scan reveal foto (island `Reveal`): tirai membuka sekali saat masuk viewport, lalu garis pindai berulang tiap 4 detik; kartu Tentang tidak lagi punya efek hover. (2026-10-09)
- [x] Section Aktivitas dengan heatmap **data contoh** berlabel, reveal bertahap per kolom. (2026-10-09)
- [x] F8 — Section Sertifikat dari Content Collection `certificates`; isi masih **contoh** dan berlabel "data contoh". (2026-10-09)
- [x] F10 (sebagian) — Footer/kontak; LinkedIn & WhatsApp masih dummy, `security.txt` belum ada. (2026-10-09)
- [x] F12 — Halaman 404. (2026-10-09)
- [x] Migrasi semua animasi dari CSS ke Motion di island React (pilihan Parid): CSP ditambah 3 hash script hidrasi + 1 hash `<style>`, `check:csp` memeriksa keduanya, JS halaman ±77 KB gzip. (2026-10-09)
- [x] Animasi teks: judul hero per huruf; reveal `rise` untuk judul section, teks Tentang, kartu project, sertifikat, dan kontak. (2026-10-09)

Rencana (lihat `docs/PRD.md` §12):

- [ ] Ganti semua data dummy: URL project, tiga sertifikat contoh, LinkedIn & WhatsApp, ringkasan `about`, gambar hero
- [ ] `security.txt` (butuh kontak asli), favicon
- [ ] Atur `not_found_handling` di Cloudflare supaya `404.html` dipakai
- [ ] F9 — Sync HTB via GitHub Actions
- [ ] F7 — Heatmap HTB dari data nyata (ganti `htb-sample.ts`)
- [ ] F11 — SEO & meta
- [ ] Hardening: CSP final, Playwright + axe, audit

## Referensi desain

Mockup ada di canvas Claude Design "Portofolio Parid". Satu-satunya artboard acuan: **"FINAL — halaman lengkap"**. Artboard lain adalah eksplorasi lama dan bukan acuan.

Catatan dari artboard FINAL yang tidak tertulis di bagian lain:

- Navbar tidak sticky dan tanpa garis bawah; link 15 px (bukan mono); tombol tema berlabel mono 12 px.
- Hero: panel gambar miring `polygon(0 6%, 100% 0, 100% 100%, 0 100%)` + bingkai offset 14 px, cincin putus-putus berbentuk lingkaran di belakangnya (satu-satunya pengecualian radius selain heatmap), lencana `handle`.
- CTA utama: latar `--ink`, teks `--bg`, 15 px weight 600.
- Footer/kontak diberi nomor `05` ("Mari ngobrol.").
- Nilai warna di mockup yang berbeda dari tabel §2 (`--accent` terang `#0E7C7B`) **tidak** dipakai; tabel §2 yang berlaku.
