/**
 * Data profil. Kontak menyusul bersama footer.
 *
 * Teks hero dan isi kartu diambil dari mockup "FINAL — halaman lengkap". Field bernilai
 * `null` belum diisi Parid; komponen menyembunyikan bagiannya sampai ada nilainya.
 */
export const PROFILE = {
  name: 'Parid',
  /** Nama lengkap, dipakai sebagai judul hero. */
  fullName: 'Farid Kurniawan',
  tagline: 'security researcher · Informatika, Univ. Malikussaleh',
  role: 'Security researcher & full-stack developer',
  summary: 'Web exploitation, reverse engineering, dan machine learning untuk deteksi malware.',
  handle: null as string | null,
  /** Path publik CV; tombolnya hanya tampil bila file ada di `public/`. */
  cvPath: '/cv/CV-Parid.pdf',
  /** Gambar hero masih sementara; perbarui teks ini saat ilustrasi final masuk. */
  heroArtAlt:
    'Ilustrasi karakter anime berambut putih dengan mata berwarna teal, berlatar kilatan petir.',

  /**
   * SEMENTARA: disusun dari deskripsi project di CLAUDE.md §1, bukan tulisan Parid.
   * Ganti dengan ringkasan profesional 2–3 kalimat.
   */
  about:
    'Mahasiswa Informatika Universitas Malikussaleh yang fokus pada keamanan siber: web exploitation, reverse engineering, dan machine learning untuk deteksi malware.',
  photoAlt: 'Parid berdiri bersandar pada perahu putih di tepi danau, berkaus hitam.',
  location: 'Lhokseumawe, Aceh',
  status: null as string | null,
  accessLabel: 'ACCESS · LVL 3',
  focus: ['Web exploitation', 'Reverse engineering', 'ML untuk deteksi malware'],
  /**
   * DUMMY: LinkedIn dan WhatsApp belum menunjuk ke akun Parid. GitHub diambil dari
   * pemilik remote repo. Format WhatsApp final: `https://wa.me/<nomor tanpa +>`.
   */
  contacts: {
    github: 'https://github.com/Pariddd',
    linkedin: 'https://www.linkedin.com/',
    whatsapp: 'https://wa.me/',
  },
  /**
   * ID publik profil Hack The Box (bukan rahasia), dipakai scripts/sync-htb.ts.
   * `profileId` dari alamat profile.hackthebox.com, `accountId` dari respons profilnya.
   */
  htb: {
    profileId: '019cdaa1-ae1d-71b7-bea9-76db22ff1812',
    accountId: 'a1456507-bda2-4cb1-b7ab-935be5a899cc',
    profileUrl: 'https://profile.hackthebox.com/profile/019cdaa1-ae1d-71b7-bea9-76db22ff1812',
  },
  education: {
    degree: 'S1 Informatika',
    school: 'Universitas Malikussaleh',
    startYear: null as number | null,
  },
} as const;
