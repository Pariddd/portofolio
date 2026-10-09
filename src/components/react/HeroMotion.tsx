import { useAnimate } from 'motion/react-mini';
import { useEffect, type ReactNode } from 'react';
import {
  EASE_MAIN,
  EASE_REVEAL,
  parallaxTransform,
  prefersReducedMotion,
  staggerDelay,
} from '../../lib/motion';
import { pointerOffset } from '../../lib/parallax';
import { PRELOAD_DONE_EVENT, PRELOADING_CLASS } from '../../lib/preload';

interface Props {
  className?: string;
  children?: ReactNode;
}

// Jeda (detik) dihitung dari saat preload mulai memudar.
const STRIKE_DELAY = 0.15;
const PANEL_DELAY = 0.35;
const RISE_DELAYS = [1, 1.5, 1.6, 1.7, 1.8];
const CHAR_START = 1.05;
const CHAR_STEP = 0.035;
const ARCS = [
  { duration: 6.5, delay: 2 },
  { duration: 8.2, delay: 4.5 },
];

// Menganimasikan markup hero dari Hero.astro (lewat slot). Elemen ditandai `data-hero`;
// lapisan parallax ditandai `data-depth` (px). Tanpa JavaScript atau dengan reduced
// motion, hero tampil diam apa adanya.
export default function HeroMotion({ className, children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = scope.current;
    const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-hero="${name}"]`)];

    for (const ring of all('ring')) {
      animate(
        ring,
        { transform: ['rotate(0deg)', 'rotate(360deg)'] },
        { duration: 60, ease: 'linear', repeat: Infinity },
      );
    }

    // Titik aksen di akhir nama berdenyut pelan; hurufnya sendiri diam.
    for (const dot of all('dot')) {
      animate(
        dot,
        { opacity: [1, 0.55, 1], transform: ['scale(1)', 'scale(1.18)', 'scale(1)'] },
        { duration: 2.4, ease: 'easeInOut', repeat: Infinity },
      );
    }

    // Kilat singkat lalu lama padam: dua kedipan per putaran, di bawah batas WCAG 2.3.1.
    all('arc').forEach((arc, index) => {
      const timing = ARCS[index % ARCS.length];
      if (timing === undefined) return;
      animate(
        arc,
        { opacity: [0, 0, 1, 0, 0.8, 0, 0] },
        {
          duration: timing.duration,
          delay: timing.delay,
          times: [0, 0.93, 0.94, 0.955, 0.97, 0.98, 1],
          ease: 'linear',
          repeat: Infinity,
        },
      );
    });

    // Animasi pembuka hanya diputar setelah preload, jadi sekali per sesi.
    const playIntro = () => {
      for (const strike of all('strike')) {
        // Dua kilatan dalam 0,7 s lalu padam: di bawah batas 3 kilatan/detik.
        animate(
          strike,
          { opacity: [0, 0.9, 0, 0.55, 0] },
          { duration: 0.7, delay: STRIKE_DELAY, times: [0, 0.08, 0.16, 0.24, 1], ease: 'linear' },
        );
      }
      for (const panel of all('panel')) {
        animate(
          panel,
          { transform: ['translateY(100%)', 'translateY(0%)'] },
          { duration: 0.9, delay: PANEL_DELAY, ease: EASE_REVEAL },
        );
      }
      // Judul muncul huruf demi huruf.
      all('char').forEach((char, index) => {
        animate(
          char,
          { opacity: [0, 1], transform: ['translateY(0.45em)', 'translateY(0em)'] },
          { duration: 0.6, delay: staggerDelay(index, CHAR_STEP, CHAR_START), ease: EASE_MAIN },
        );
      });
      all('rise').forEach((item, index) => {
        animate(
          item,
          { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
          { duration: 0.6, delay: RISE_DELAYS[index] ?? RISE_DELAYS.at(-1) ?? 0, ease: 'easeOut' },
        );
      });
    };
    if (document.documentElement.classList.contains(PRELOADING_CLASS)) {
      window.addEventListener(PRELOAD_DONE_EVENT, playIntro, { once: true });
    }

    // Parallax hanya untuk pointer presisi (mouse).
    const area = root.querySelector<HTMLElement>('[data-parallax]');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    let frame = 0;
    const moveLayers = (x: number, y: number) => {
      for (const layer of root.querySelectorAll<HTMLElement>('[data-depth]')) {
        animate(
          layer,
          { transform: parallaxTransform(x, y, Number(layer.dataset['depth'])) },
          { duration: 0.4, ease: EASE_MAIN },
        );
      }
    };
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (area === null) return;
        const rect = area.getBoundingClientRect();
        moveLayers(
          pointerOffset(event.clientX, rect.left, rect.width),
          pointerOffset(event.clientY, rect.top, rect.height),
        );
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      moveLayers(0, 0);
    };
    if (area !== null && finePointer) {
      area.addEventListener('pointermove', onMove);
      area.addEventListener('pointerleave', onLeave);
    }

    return () => {
      window.removeEventListener(PRELOAD_DONE_EVENT, playIntro);
      cancelAnimationFrame(frame);
      area?.removeEventListener('pointermove', onMove);
      area?.removeEventListener('pointerleave', onLeave);
    };
  }, [animate, scope]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
