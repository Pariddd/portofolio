import { useAnimate } from 'motion/react-mini';
import { useEffect } from 'react';
import { EASE_MAIN, prefersReducedMotion } from '../../lib/motion';

/** Tombol muncul setelah halaman digulir sejauh ini (px). */
const SHOW_AFTER = 600;
const HIDDEN = 'translateY(12px)';
const SHOWN = 'translateY(0px)';

// Tombol "ke atas" di pojok kanan bawah. Link ke `#top`, jadi menggulir tanpa JavaScript
// pun bisa; script hanya mengatur kapan tombol terlihat. Selama tersembunyi ia memakai
// atribut `hidden`, sehingga tidak bisa difokus.
export default function BackToTop() {
  const [scope, animate] = useAnimate<HTMLAnchorElement>();

  useEffect(() => {
    const button = scope.current;
    const reduced = prefersReducedMotion();
    let shown = false;

    const update = () => {
      const next = window.scrollY > SHOW_AFTER;
      if (next === shown) return;
      shown = next;
      if (reduced) {
        button.toggleAttribute('hidden', !shown);
      } else if (shown) {
        button.removeAttribute('hidden');
        animate(
          button,
          { opacity: [0, 1], transform: [HIDDEN, SHOWN] },
          { duration: 0.25, ease: EASE_MAIN },
        );
      } else {
        animate(
          button,
          { opacity: [1, 0], transform: [SHOWN, HIDDEN] },
          { duration: 0.18, ease: 'easeIn' },
        ).then(() => {
          if (!shown) button.setAttribute('hidden', '');
        });
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [animate, scope]);

  return (
    <a
      ref={scope}
      href="#top"
      hidden
      aria-label="Kembali ke atas"
      className="fixed right-4 bottom-4 z-30 inline-flex size-12 items-center justify-center border border-ink bg-ink text-bg hover:border-accent hover:bg-accent md:right-8 md:bottom-8"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7"></path>
      </svg>
    </a>
  );
}
