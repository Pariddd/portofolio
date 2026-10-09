/**
 * Data profil. Field lain (fokus, pendidikan, kontak) menyusul bersama section-nya.
 *
 * `tagline`, `role`, dan `summary` diambil dari mockup "FINAL — halaman lengkap".
 */
export const PROFILE = {
  name: 'Parid',
  tagline: 'security researcher · Informatika, Univ. Malikussaleh',
  role: 'Security researcher & full-stack developer',
  summary: 'Web exploitation, reverse engineering, dan machine learning untuk deteksi malware.',
  /** Belum diisi Parid; lencana handle di hero baru tampil setelah ada nilainya. */
  handle: null as string | null,
  /** Path publik CV; tombolnya hanya tampil bila file ada di `public/`. */
  cvPath: '/cv/CV-Parid.pdf',
  /** Gambar hero masih sementara; perbarui teks ini saat ilustrasi final masuk. */
  heroArtAlt:
    'Ilustrasi karakter anime berambut putih dengan mata berwarna teal, berlatar kilatan petir.',
} as const;
