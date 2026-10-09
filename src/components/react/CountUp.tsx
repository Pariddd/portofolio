import { animateValue } from 'motion';
import { useInView } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { EASE_MAIN, prefersReducedMotion } from '../../lib/motion';

interface Props {
  className?: string;
  children?: ReactNode;
}

const FORMAT = new Intl.NumberFormat('id-ID');

// Angka di elemen `[data-count-to="<nilai>"]` menghitung naik dari 0 sekali saat masuk
// viewport. HTML sudah berisi nilai akhirnya, jadi tanpa JavaScript angka tetap benar.
export default function CountUp({ className, children }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const inView = useInView(scope, { once: true, amount: 0.3 });

  useEffect(() => {
    const root = scope.current;
    if (root === null || !inView || prefersReducedMotion()) return;

    const controls = [...root.querySelectorAll<HTMLElement>('[data-count-to]')].flatMap((item) => {
      const target = Number(item.dataset['countTo']);
      if (!Number.isFinite(target) || target <= 0) return [];
      return [
        animateValue({
          keyframes: [0, target],
          duration: 1200,
          ease: EASE_MAIN,
          onUpdate: (value) => {
            item.textContent = FORMAT.format(Math.round(value));
          },
        }),
      ];
    });

    return () => {
      for (const control of controls) control.stop();
    };
  }, [inView]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
