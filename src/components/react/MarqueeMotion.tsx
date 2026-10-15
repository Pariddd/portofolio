import { useAnimate } from 'motion/react-mini';
import { useEffect, type ReactNode } from 'react';
import { marqueeCopies, marqueeKeyframes } from '../../lib/marquee';
import { prefersReducedMotion } from '../../lib/motion';

interface Props {
  className?: string;
  children?: ReactNode;
}

/** Durasi satu putaran (geser sejauh satu salinan daftar). */
const LOOP_SECONDS = 36;

// Menggeser `[data-marquee-track]` tepat satu salinan daftar, berulang. Salinan ditambah
// sampai sisa track selalu menutup wadah, supaya di layar lebar tidak muncul ruang kosong.
// Berhenti saat pointer di atasnya atau kotak centang "jeda" dicentang.
export default function MarqueeMotion({ className, children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const root = scope.current;
    const track = root.querySelector<HTMLElement>('[data-marquee-track]');
    const list = track?.firstElementChild;
    const toggle = root.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (track === null || !(list instanceof HTMLElement) || prefersReducedMotion()) return;

    let loop: ReturnType<typeof animate> | undefined;
    let hovering = false;
    const sync = () => {
      if (hovering || toggle?.checked === true) loop?.pause();
      else loop?.play();
    };

    // Dipanggil ulang saat lebar wadah atau daftar berubah (mis. font selesai dimuat).
    const fill = () => {
      const needed = marqueeCopies(root.clientWidth, list.getBoundingClientRect().width);
      if (loop !== undefined && track.children.length >= needed) return;
      while (track.children.length < needed) {
        const copy = list.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        track.append(copy);
      }
      // Jarak per putaran tetap satu salinan, jadi posisi dilanjutkan tanpa lompatan.
      const time = loop?.time ?? 0;
      loop?.stop();
      loop = animate(
        track,
        { transform: marqueeKeyframes(track.children.length) },
        { duration: LOOP_SECONDS, ease: 'linear', repeat: Infinity },
      );
      loop.time = time;
      sync();
    };
    fill();

    const observer = new ResizeObserver(fill);
    observer.observe(root);
    observer.observe(list);

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
      observer.disconnect();
      loop?.stop();
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
