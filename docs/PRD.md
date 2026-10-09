# PRD — Portofolio Keamanan Siber Parid

|                |                                    |
| -------------- | ---------------------------------- |
| Pemilik        | Parid                              |
| Status         | Draft v1.0                         |
| Tanggal        | 2026-10-09                         |
| Target pembaca | Parid + Claude Code (implementasi) |

---

## 1. Ringkasan

Situs portofolio pribadi **statis (tanpa backend)** untuk menampilkan identitas, project, sertifikat, dan aktivitas belajar Hack The Box (HTB) Parid sebagai mahasiswa Informatika yang fokus pada keamanan siber. Desainnya **netral profesional dengan aksen cyber yang bermakna**: bersih dan mudah dibaca, dengan sentuhan cyber yang punya fungsi (heatmap HTB, handshake TLS di preload, `security.txt`), bukan dekorasi "hacker" klise.

## 2. Latar belakang & masalah

- Sertifikat dan project tersebar di berbagai platform. Recruiter tidak punya satu tempat untuk melihat semuanya.
- Progres HTB hanya terlihat di profil HTB, tanpa riwayat aktivitas harian yang mudah dibaca.
- Portofolio cyber umumnya klise (hijau neon, efek Matrix) dan sulit dibaca. Situs ini harus menonjol karena rapi dan kredibel.
- Situs portofolio security yang tidak aman akan merusak kredibilitas. Situs ini sendiri harus menjadi bukti praktik keamanan yang baik.

## 3. Tujuan

| ID  | Tujuan                                          | Ukuran keberhasilan                                                                                 |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| G1  | Recruiter memahami siapa Parid dalam < 10 detik | Nama, role, CTA (project & CV) terlihat di atas fold di desktop dan mobile                          |
| G2  | Bukti skill dapat diverifikasi                  | Setiap sertifikat punya credential ID + link verifikasi penerbit                                    |
| G3  | Aktivitas HTB tampil otomatis                   | Heatmap ter-update via GitHub Actions tanpa intervensi manual                                       |
| G4  | Situs cepat                                     | Lighthouse Performance ≥ 95, LCP < 2,0 s (mobile, 4G)                                               |
| G5  | Situs aman                                      | securityheaders.com grade A, Mozilla Observatory ≥ B+, 0 vulnerability high/critical di `npm audit` |
| G6  | Aksesibel                                       | Lighthouse Accessibility ≥ 95, kontras WCAG AA, dukung `prefers-reduced-motion`                     |

## 4. Non-tujuan (out of scope v1)

- Backend, database, login, atau form upload di web. Konten ditambah lewat commit Git.
- Blog/writeup (ditunda; struktur folder disiapkan tapi tidak ditampilkan di v1).
- Statistik HTB rank, jumlah mesin, publikasi, CTF sebagai baris angka (sengaja dihapus dari desain).
- Multi-bahasa (v1 hanya Bahasa Indonesia; label teknis boleh berbahasa Inggris).
- Komentar, analytics pihak ketiga, cookie.

## 5. Persona

1. **Recruiter / HR non-teknis.** Butuh nama, role, kontak, CV dengan cepat. Tidak membaca detail teknis.
2. **Reviewer teknis** (security engineer, lead pentester). Menilai kedalaman project, keaslian bukti, dan kualitas situs itu sendiri (header keamanan, kode di repo).
3. **Komunitas CTF / teman.** Melihat aktivitas HTB dan project.

## 6. Struktur halaman (single page + preload)

Urutan section final:

1. **Preload "TLS Handshake"** (sekali per sesi)
2. **Navbar** — logo `Parid.`, link anchor (Tentang, Project, Aktivitas, Sertifikat), toggle tema
3. **Hero** — nama, role, deskripsi singkat, CTA, ilustrasi beranimasi
4. **Marquee tools** — strip daftar tools bergerak pelan
5. **01 Tentang saya** — kartu akses (foto), ringkasan, Fokus, Pendidikan
6. **02 Project pilihan** — grid kartu project
7. **03 Aktivitas Hack The Box** — heatmap ala GitHub
8. **04 Sertifikat** — daftar tabel dengan link verifikasi
9. **Footer / Kontak** — email, `security.txt`, PGP, klaim privasi

## 7. Kebutuhan fungsional

### F1 — Preload "TLS Handshake"

- Menampilkan 4 baris berurutan: `ClientHello`, `ServerHello`, `Certificate ✓ verified`, `Finished`, lalu progress bar dan teks "Session established."
- Durasi total ≈ 2 detik.
- **Hanya diputar sekali per sesi** (penanda di `sessionStorage`, dibungkus `try/catch`; jika storage gagal, preload dilewati).
- Tombol **Lewati** selalu terlihat dan bisa difokus dengan keyboard.
- Tidak menahan konten: halaman di-render di belakang; preload adalah overlay yang di-unmount setelah selesai.
- `prefers-reduced-motion: reduce` → preload dilewati sepenuhnya.
- Konten handshake harus akurat secara teknis (TLS 1.3, x25519, cipher suite valid).

### F2 — Tema terang/gelap

- Default mengikuti `prefers-color-scheme`.
- Toggle manual di navbar; pilihan disimpan di `localStorage` (try/catch).
- Script kecil inline di `<head>` menerapkan tema sebelum paint untuk mencegah _flash of wrong theme_ (perlu di-hash di CSP).
- Semua warna lewat CSS variables (lihat §9).

### F3 — Hero

- Isi: label mono `// security researcher · Informatika, Univ. Malikussaleh`, **nama "Parid."** sebagai H1 besar, subjudul "Security researcher & full-stack developer", deskripsi satu kalimat, dua CTA ("Lihat project" → `#work`, "Unduh CV" → PDF).
- Ilustrasi di panel miring dengan bingkai teal ber-offset, cincin putus-putus, kartu kecil `handle`.
- Animasi:
  1. **Pembuka:** kilatan teal singkat (2 kilat dalam ±0,7 s), panel terbuka dari bawah, gambar naik, teks muncul berurutan (stagger).
  2. **Parallax 3 kedalaman** mengikuti kursor: gambar berlawanan arah, bingkai searah, efek petir paling cepat. Kembali ke tengah saat kursor keluar. Pakai `useMotionValue` + `useSpring` (tanpa re-render React per mousemove).
  3. **Busur listrik SVG** muncul ±150 ms setiap 6–8 detik di dua posisi dengan jadwal berbeda. **Maksimal 3 kilatan per detik** (WCAG 2.3.1).
  4. **Kilau mata** berdenyut halus (posisi disesuaikan dengan gambar final).
- Mobile/touch: parallax nonaktif; hanya animasi pembuka.
- `prefers-reduced-motion`: semua animasi mati, gambar tampil statis.
- Jika tersedia PNG subjek tanpa latar → parallax 2 layer (latar & subjek terpisah).

### F4 — Marquee tools

- Daftar tools (Burp Suite, Ghidra, Nmap, Wireshark, Python, Laravel, CodeIgniter 4, scikit-learn, Linux, Docker) bergerak horizontal pelan, loop mulus.
- Berhenti saat hover dan saat reduced motion. Data dari file konten, bukan hard-code.

### F5 — Tentang saya

- **Kartu akses**: foto 4:5, label `ACCESS · LVL 3`, handle, nama, lokasi, status (mis. terbuka untuk magang).
- Animasi foto **"scan reveal"**: saat pertama masuk viewport, foto tercetak dari atas ke bawah diikuti garis teal (±1,1 s, sekali). Diam: grayscale. Hover: berwarna, kartu naik 6 px, border jadi aksen.
- Kolom kanan: ringkasan profesional (2–3 kalimat), blok **Fokus** dan **Pendidikan**.
- **Tidak ada** blok Riset dan Perjalanan/timeline.
- Foto wajib: EXIF dihapus, WebP/AVIF, `alt` deskriptif.

### F6 — Project pilihan

- Grid kartu: kategori, tag teknik (opsional, mis. MITRE ATT&CK), judul, deskripsi, stack.
- Sumber data: Astro Content Collection `projects` (Markdown + frontmatter tervalidasi Zod).
- Field: `title`, `summary`, `category`, `technique?`, `stack[]`, `repo?`, `demo?`, `featured`, `order`, `date`.
- Tampilkan yang `featured: true`, urut `order`.
- Kartu bisa link ke repo/demo (link eksternal pakai `rel="noopener noreferrer"`).

### F7 — Aktivitas HTB (heatmap)

- Grid 53 kolom × 7 baris, 1 kotak = 1 hari, 4–5 tingkat warna dari token `--heat-0..4`.
- Tooltip (dan `aria-label`/teks tersembunyi) per kotak: tanggal + jumlah aktivitas.
- Ringkasan teks di bawah grid ("N aktivitas dalam 12 bulan terakhir") agar bisa dibaca screen reader.
- Label "last sync" dari timestamp file data.
- Horizontal scroll di mobile dalam kotak `overflow-x: auto`.
- Animasi: kolom menyala berurutan saat masuk viewport (sekali).
- Data dari `src/data/htb-activity.json` (lihat F9). Jika file kosong/rusak → tampilkan state kosong, bukan error.

### F8 — Sertifikat

- Daftar tabel: nama, penerbit, credential ID, tombol **Verifikasi →** ke URL resmi penerbit.
- Sumber: Content Collection `certificates` (YAML/JSON). Field: `name`, `issuer`, `credentialId`, `verifyUrl`, `issuedAt`, `expiresAt?`, `image?`.
- Gambar sertifikat (opsional) disimpan di `src/assets/certs/` dan dioptimasi saat build. Hanya PNG/JPG/WebP/PDF.
- Validasi skema saat build: `verifyUrl` harus URL https.

### F9 — Sinkronisasi HTB (GitHub Actions)

- Workflow `sync-htb.yml` berjalan via cron (tiap 6 jam) + `workflow_dispatch`.
- Script Node (`scripts/sync-htb.ts`) memanggil API HTB v4 dengan token dari **GitHub Secrets** (`HTB_API_TOKEN`).
- Agregasi aktivitas (own/flag/challenge) per tanggal (zona waktu Asia/Jakarta), **merge** dengan data lama (tidak menimpa riwayat), simpan ke `src/data/htb-activity.json`.
- Commit hanya jika ada perubahan; commit memicu deploy.
- Ketahanan: timeout, retry dengan backoff (maks 3), validasi respons dengan Zod. Jika API gagal → workflow gagal dengan pesan jelas, data lama tetap utuh.
- **Token tidak pernah masuk ke bundle frontend atau log.**
- ⚠️ Risiko: API HTB v4 tidak terdokumentasi resmi dan endpoint activity mungkin hanya mengembalikan aktivitas terbaru. Riwayat lengkap terbentuk bertahap dari sync berkala. Endpoint perlu diverifikasi sebelum implementasi (lihat §13).

### F10 — Footer & berkas keamanan

- Link GitHub, LinkedIn, dan WhatsApp (`https://wa.me/<nomor>`), masing-masing dengan ikon SVG inline + label teks.
- `public/.well-known/security.txt` sesuai RFC 9116 (Contact, Expires, Preferred-Languages, Canonical).
- Teks: "CSP strict · tanpa cookie · tanpa tracker" — klaim ini harus benar.

### F11 — SEO & meta

- `<title>`, meta description, Open Graph + Twitter card (gambar OG statis), `sitemap.xml`, `robots.txt`, canonical URL.
- `lang="id"`.

### F12 — Halaman 404

- Gaya konsisten, link kembali ke beranda. Bisa bertema "connection refused".

## 8. Kebutuhan non-fungsional

| Area           | Kebutuhan                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performa       | Lighthouse ≥ 95; JS total halaman < 80 KB gzip; gambar hero ≤ 150 KB (AVIF/WebP, `fetchpriority="high"`); font di-_self-host_ dan di-subset, `font-display: swap` |
| Animasi        | Hanya animasikan `transform` dan `opacity`; komponen Motion dimuat via `client:visible` (kecuali hero `client:load`); hormati `prefers-reduced-motion`            |
| Aksesibilitas  | WCAG 2.1 AA: kontras teks ≥ 4.5:1, target sentuh ≥ 44 px, fokus terlihat, navigasi keyboard penuh, skip link, `alt` pada gambar, animasi dekoratif `aria-hidden`  |
| Responsif      | 360 px – 1920 px; layout menumpuk di mobile; tanpa horizontal scroll halaman                                                                                      |
| Keamanan       | Lihat §10                                                                                                                                                         |
| Privasi        | Tanpa cookie, tanpa analytics pihak ketiga (jika perlu, Cloudflare Web Analytics tanpa cookie)                                                                    |
| Kompatibilitas | 2 versi terakhir Chrome, Firefox, Safari, Edge; Safari iOS 16+                                                                                                    |

## 9. Design system

### Warna (CSS variables)

| Token         | Terang                | Gelap                 | Penggunaan          |
| ------------- | --------------------- | --------------------- | ------------------- |
| `--bg`        | `#EFF3F2`             | `#0B1213`             | Latar halaman       |
| `--panel`     | `#FFFFFF`             | `#121B1C`             | Kartu               |
| `--ink`       | `#101718`             | `#E7EEED`             | Teks utama          |
| `--muted`     | `#45504F`             | `#AEBBBA`             | Teks sekunder       |
| `--faint`     | `#566261`             | `#8A9897`             | Label, metadata     |
| `--line`      | `#D2DBDA`             | `#22302F`             | Garis/border        |
| `--accent`    | `#0D7A79`             | `#5EEAD4`             | Link, aksen, status |
| `--accent-hi` | `#2CC6BE`             | `#5EEAD4`             | Kilatan, efek       |
| `--heat-0..4` | `#E1E8E7` → `#0D7A79` | `#16211F` → `#5EEAD4` | Heatmap             |

Aturan: satu warna aksen saja; jangan pakai gradient latar, glassmorphism, atau emoji sebagai ikon. Kontras setiap pasangan teks/latar wajib diverifikasi AA.

### Tipografi

- **Schibsted Grotesk** (400/500/600/800) — judul & isi.
- **JetBrains Mono** (400/500) — hanya label, metadata, angka, kode.
- Skala: H1 hero `clamp(72px, 11vw, 168px)`, H2 44 px, body 17 px / line-height 1.6, label 12–13 px.
- Letter-spacing negatif pada judul (−0.03 s/d −0.05em).

### Layout & komponen

- Container maks 1200 px, padding 32 px (16 px di mobile).
- Grid 12 kolom; section diberi nomor `01–04` dalam font mono berwarna aksen.
- Sudut tegas (radius 0), kecuali kotak heatmap (2 px).
- Tombol: primer (isi `--ink`), sekunder (outline `--ink`), tinggi ≥ 48 px.

### Motion

- Easing utama `cubic-bezier(.2,.7,.2,1)`; reveal `cubic-bezier(.7,0,.2,1)`.
- Durasi: mikro 150–250 ms, reveal 600–1100 ms.
- Setiap animasi **sekali** saat masuk viewport, kecuali idle halus (kilau mata, busur listrik jarang, marquee).

## 10. Keamanan

- **Header** (via `public/_headers` Cloudflare Pages):
  - `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (matikan kamera, mikrofon, geolokasi, dll.), `Cross-Origin-Opener-Policy: same-origin`
- Tidak ada inline script selain script tema (di-hash). Tidak ada `dangerouslySetInnerHTML` / `set:html` untuk konten.
- Font di-self-host (tidak ke Google Fonts saat runtime) agar CSP ketat dan tanpa request pihak ketiga.
- Supply chain: lockfile wajib, `npm ci` di CI, Dependabot, `npm audit --audit-level=high` dan Semgrep di setiap PR.
- GitHub: 2FA wajib, branch protection di `main`, secret hanya di GitHub Secrets, workflow pakai `permissions:` minimum dan action di-pin ke commit SHA.
- Gambar: hapus metadata EXIF sebelum commit.

## 11. Arsitektur & tech stack

```
Konten (Markdown/YAML/JSON di repo)  ──┐
GitHub Actions cron → API HTB → JSON ──┼─→ Astro build (static) → Cloudflare Pages (CDN + header)
Aset (gambar, CV PDF) ─────────────────┘
```

| Lapisan        | Pilihan                                                       | Alasan                                               |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| Framework      | **Astro 7** (output static)                                   | Situs konten, JS minimal, Content Collections bawaan |
| Interaktivitas | **React 19** islands                                          | Hanya untuk komponen beranimasi                      |
| Animasi        | **Motion** (`motion/react`)                                   | Parallax, reveal, stagger, reduced-motion            |
| Styling        | **Tailwind CSS v4** + CSS variables                           | Token tema terpusat                                  |
| Bahasa         | **TypeScript** (strict)                                       | Keamanan tipe, skema konten                          |
| Validasi       | **Zod** (via `astro:content`)                                 | Skema konten & respons API HTB                       |
| Lint/format    | ESLint + Prettier                                             | Konsistensi                                          |
| Test           | Vitest (unit, script sync), Playwright (smoke + a11y via axe) | Kualitas                                             |
| CI/CD          | GitHub Actions                                                | Sync HTB, audit, build                               |
| Hosting        | **Cloudflare Pages**                                          | Gratis, custom header, CDN                           |

Alternatif yang dipertimbangkan: Next.js static export (lebih berat, fitur server tak terpakai), Laravel (butuh VPS & backend — bertentangan dengan keputusan tanpa backend).

## 12. Rilis bertahap

| Fase             | Isi                                                                                                      | Kriteria selesai                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| M0 Setup         | Init Astro + TS + Tailwind + ESLint/Prettier, token desain, font self-host, layout dasar, deploy pertama | Halaman kosong ter-deploy dengan header keamanan (build + `_headers` selesai 2026-10-09; deploy ditunda) |
| M1 Konten statis | Navbar, Hero (tanpa animasi), Tentang, Project, Sertifikat, Footer, 404, tema                            | Semua section tampil dari Content Collections, responsif                                                 |
| M2 Animasi       | Preload, animasi hero, scan reveal foto, marquee, reveal heatmap                                         | Lighthouse ≥ 95, reduced-motion lulus                                                                    |
| M3 HTB           | Script sync + workflow + heatmap dari data nyata                                                         | Workflow sukses, data ter-merge, token tidak bocor                                                       |
| M4 Hardening     | CSP final, security.txt, SEO, Playwright + axe, audit                                                    | securityheaders A, a11y ≥ 95                                                                             |

## 13. Keputusan & pertanyaan terbuka

### Keputusan (2026-10-09)

- **Domain:** dummy dulu → `faridkurniawan.pages.dev` (subdomain bawaan Cloudflare Pages). Simpan di satu konstanta `SITE_URL` (`astro.config.mjs` → `site`) agar mudah diganti saat domain asli ada.
- **Kontak:** GitHub, LinkedIn, WhatsApp. WhatsApp via link `https://wa.me/<nomor>` (nomor di `src/data/profile.ts`). Tanpa email publik dan tanpa PGP di v1; `security.txt` memakai link kontak yang tersedia.
- **CV:** PDF Bahasa Indonesia di `public/cv/CV-Parid.pdf`.
- **Gambar hero:** ilustrasi orisinal milik Parid (menggantikan gambar sementara dari situs gratis).
- **API HTB:** endpoint akan diuji sebelum M3.

### Catatan risiko

- **Gambar hero:** pastikan gambar sementara (fan art karakter berhak cipta) tidak ikut ter-commit ke repo; gunakan hanya ilustrasi orisinal. Butuh resolusi ≥ 1400 px; idealnya tersedia versi PNG subjek tanpa latar untuk parallax 2 layer.
- **WhatsApp:** nomor publik di web rentan di-scrape untuk spam/penipuan. Pertimbangkan nomor terpisah, atau tampilkan tombol WA tanpa menuliskan nomor sebagai teks.

### Pertanyaan terbuka

1. **Konten**: daftar project, sertifikat (dengan credential ID), ringkasan "Tentang saya", foto, URL GitHub/LinkedIn, nomor WA.
2. Apakah writeup akan masuk v2? (Struktur folder sudah disiapkan.)
