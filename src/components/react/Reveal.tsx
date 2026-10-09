import { useInView } from 'motion/react';
import { useAnimate } from 'motion/react-mini';
import { useEffect, useRef, type ReactNode } from 'react';
import { EASE_MAIN, EASE_REVEAL, prefersReducedMotion, staggerDelay } from '../../lib/motion';

interface Props {
  /** `scan`: tirai turun membuka foto. `cells`: sel heatmap. `rise`: teks/kartu naik. */
  effect: 'scan' | 'cells' | 'rise';
  className?: string;
  children?: ReactNode;
}

const CELL_STEP_SECONDS = 0.012;
const RISE_STEP_SECONDS = 0.09;
const SCAN_LOOP_SECONDS = 4;
// Mulai setelah tirai pembuka selesai.
const SCAN_LOOP_DELAY = 1.2;

// Reveal sekali saat masuk viewport untuk elemen `[data-reveal-item]` di dalam slot.
// Keadaan tersembunyi dipasang saat hidrasi, jadi tanpa JavaScript konten tetap terlihat.
export default function Reveal({ effect, className, children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount: effect === 'rise' ? 0.1 : 0.2 });
  const armed = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const items = [...scope.current.querySelectorAll<HTMLElement>('[data-reveal-item]')];

    if (!armed.current) {
      armed.current = true;
      for (const item of items) {
        if (effect === 'scan') item.style.transform = 'translateY(0%)';
        else item.style.opacity = '0';
      }
    }
    if (!inView) return;

    // Garis pindai berulang (`[data-reveal-loop]`): turun 2,4 s lalu jeda, tanpa henti.
    for (const line of scope.current.querySelectorAll<HTMLElement>('[data-reveal-loop]')) {
      animate(
        line,
        {
          opacity: [0, 1, 1, 0, 0],
          transform: ['0%', '6.67%', '93.33%', '100%', '100%'].map((y) => `translateY(${y})`),
        },
        {
          duration: SCAN_LOOP_SECONDS,
          delay: SCAN_LOOP_DELAY,
          times: [0, 0.04, 0.56, 0.6, 1],
          ease: 'linear',
          repeat: Infinity,
        },
      );
    }

    items.forEach((item, index) => {
      if (effect === 'scan') {
        animate(
          item,
          { transform: ['translateY(0%)', 'translateY(101%)'] },
          { duration: 1.1, ease: EASE_REVEAL },
        );
      } else if (effect === 'rise') {
        animate(
          item,
          { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
          { duration: 0.7, delay: staggerDelay(index, RISE_STEP_SECONDS), ease: EASE_MAIN },
        );
      } else {
        animate(
          item,
          { opacity: [0, 1], transform: ['scale(0.4)', 'scale(1)'] },
          { duration: 0.35, delay: staggerDelay(index, CELL_STEP_SECONDS), ease: 'easeOut' },
        );
      }
    });
  }, [animate, effect, inView, scope]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
