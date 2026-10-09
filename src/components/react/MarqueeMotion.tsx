import { useAnimate } from 'motion/react-mini';
import { useEffect, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

interface Props {
  className?: string;
  children?: ReactNode;
}

const LOOP_SECONDS = 36;

// Menggeser `[data-marquee-track]` (dua salinan daftar) tepat setengah lebarnya, berulang.
// Berhenti saat pointer di atasnya atau kotak centang "jeda" dicentang.
export default function MarqueeMotion({ className, children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const root = scope.current;
    const track = root.querySelector<HTMLElement>('[data-marquee-track]');
    const toggle = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (track === null || prefersReducedMotion()) return;

    const loop = animate(
      track,
      { transform: ['translateX(0%)', 'translateX(-50%)'] },
      { duration: LOOP_SECONDS, ease: 'linear', repeat: Infinity },
    );

    let hovering = false;
    const sync = () => {
      if (hovering || toggle?.checked === true) loop.pause();
      else loop.play();
    };
    const onEnter = () => {
      hovering = true;
      sync();
    };
    const onLeave = () => {
      hovering = false;
      sync();
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    toggle?.addEventListener('change', sync);

    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      toggle?.removeEventListener('change', sync);
    };
  }, [animate, scope]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
