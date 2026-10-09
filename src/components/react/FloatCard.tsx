import { useAnimate } from 'motion/react-mini';
import { useEffect, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

interface Props {
  className?: string;
  children?: ReactNode;
}

const FLOAT_SECONDS = 7;
const ORBIT_SECONDS = 24;
// Naik-turun pelan dengan sedikit miring, seperti benda yang mengambang.
const FLOAT_KEYFRAMES = [
  'translateY(0px) rotate(0deg)',
  'translateY(-10px) rotate(-0.6deg)',
  'translateY(0px) rotate(0deg)',
  'translateY(7px) rotate(0.5deg)',
  'translateY(0px) rotate(0deg)',
];

// Kartu yang mengambang. Elemen `[data-orbit]` di dalamnya (lencana teks melingkar)
// berputar terus. Dengan reduced motion keduanya diam.
export default function FloatCard({ className, children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const card = scope.current;

    animate(
      card,
      { transform: FLOAT_KEYFRAMES },
      { duration: FLOAT_SECONDS, ease: 'easeInOut', repeat: Infinity },
    );
    for (const orbit of card.querySelectorAll('[data-orbit]')) {
      animate(
        orbit,
        { transform: ['rotate(0deg)', 'rotate(360deg)'] },
        { duration: ORBIT_SECONDS, ease: 'linear', repeat: Infinity },
      );
    }
  }, [animate, scope]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
