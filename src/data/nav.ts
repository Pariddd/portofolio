export interface NavLink {
  label: string;
  href: `#${string}`;
}

/** Link anchor navbar, urutannya mengikuti urutan section di halaman. */
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Project', href: '#project' },
  { label: 'Aktivitas', href: '#aktivitas' },
  { label: 'Sertifikat', href: '#sertifikat' },
];
