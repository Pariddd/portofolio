export interface NavLink {
  label: string;
  /** Diawali `/` supaya tetap berfungsi dari halaman selain beranda (mis. 404). */
  href: `/#${string}`;
}

/** Link anchor navbar, urutannya mengikuti urutan section di halaman. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Tentang', href: '/#tentang' },
  { label: 'Project', href: '/#project' },
  { label: 'Aktivitas', href: '/#aktivitas' },
  { label: 'Sertifikat', href: '/#sertifikat' },
];
