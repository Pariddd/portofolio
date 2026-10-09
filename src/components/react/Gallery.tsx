import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

interface Props {
  className?: string;
  children?: ReactNode;
}

// Galeri geser: `[data-gallery-track]` adalah wadah scroll-snap mendatar (swipe dan
// tombol panah keyboard ditangani browser). Komponen ini menghidupkan tombol
// `data-gallery-prev`/`data-gallery-next` dan penghitung `data-gallery-count`.
export default function Gallery({ className, children }: Props) {
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scope.current;
    const track = root?.querySelector<HTMLElement>('[data-gallery-track]');
    if (root == null || track == null) return;

    const prev = root.querySelector<HTMLButtonElement>('[data-gallery-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-gallery-next]');
    const count = root.querySelector<HTMLElement>('[data-gallery-count]');
    const total = track.children.length;
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';

    const index = () =>
      track.clientWidth === 0 ? 0 : Math.round(track.scrollLeft / track.clientWidth);
    const update = () => {
      const current = index();
      if (prev !== null) prev.disabled = current <= 0;
      if (next !== null) next.disabled = current >= total - 1;
      if (count !== null) count.textContent = `${current + 1} / ${total}`;
    };
    const go = (step: number) => {
      track.scrollTo({ left: (index() + step) * track.clientWidth, behavior });
    };
    const onPrev = () => go(-1);
    const onNext = () => go(1);

    prev?.addEventListener('click', onPrev);
    next?.addEventListener('click', onNext);
    track.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      track.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
