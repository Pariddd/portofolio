import { useAnimate } from 'motion/react-mini';
import { useEffect } from 'react';
import { clampCenter } from '../../lib/tooltip';

const EDGE_GAP = 8;

// Satu tooltip melayang untuk semua elemen `[data-tip]` di halaman. Diposisikan lewat
// CSSOM di atas elemen yang ditunjuk; `position: fixed` supaya tidak terpotong wadah
// yang bisa digulir. Di layar sentuh muncul saat elemen diketuk.
export default function Tooltip() {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const tip = scope.current;
    let current: Element | null = null;

    const hide = () => {
      current = null;
      tip.hidden = true;
    };
    const show = (target: HTMLElement) => {
      const text = target.dataset['tip'];
      if (text === undefined || target === current) return;
      current = target;
      tip.textContent = text;
      tip.hidden = false;
      const rect = target.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      tip.style.left = `${clampCenter(center, tip.offsetWidth, window.innerWidth, EDGE_GAP)}px`;
      tip.style.top = `${rect.top - EDGE_GAP}px`;
      animate(tip, { opacity: [0, 1] }, { duration: 0.12, ease: 'easeOut' });
    };

    const onOver = (event: PointerEvent) => {
      const target =
        event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tip]') : null;
      if (target === null) hide();
      else show(target);
    };

    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onOver);
    document.addEventListener('scroll', hide, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onOver);
      document.removeEventListener('scroll', hide, { capture: true });
    };
  }, [animate, scope]);

  return (
    <div
      ref={scope}
      hidden
      aria-hidden="true"
      className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-full border border-line bg-ink px-2.5 py-1.5 font-mono text-[12px] whitespace-nowrap text-bg"
    ></div>
  );
}
