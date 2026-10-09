import { useAnimate } from 'motion/react-mini';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';
import { PRELOAD_DONE_EVENT, PRELOAD_DURATION_MS, PRELOADING_CLASS } from '../../lib/preload';

interface Props {
  host: string;
}

interface Step {
  arrow: string;
  label: string;
  detail?: string;
  verified?: boolean;
}

const LINE_DELAYS = [0.05, 0.35, 0.65, 0.95];
const TITLE_DELAY = 1.45;
const FADE_SECONDS = 0.3;

// Preload "TLS handshake" yang ditutup sambutan: tampil di setiap muat halaman. Overlay hanya terlihat bila script
// inline di BaseLayout memasang class `preloading`, jadi tanpa JavaScript tidak tampil.
export default function Preload({ host }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const skipRef = useRef<() => void>(() => undefined);

  const steps: Step[] = [
    { arrow: '→', label: 'ClientHello', detail: 'tls1.3 · x25519' },
    { arrow: '←', label: 'ServerHello', detail: 'TLS_AES_128_GCM_SHA256' },
    { arrow: '←', label: 'Certificate', detail: `CN=${host}`, verified: true },
    { arrow: '→', label: 'Finished' },
  ];

  useEffect(() => {
    const root = document.documentElement;
    const overlay = scope.current;
    if (!root.classList.contains(PRELOADING_CLASS)) return;

    let introStarted = false;
    const startIntro = () => {
      if (introStarted) return;
      introStarted = true;
      window.dispatchEvent(new Event(PRELOAD_DONE_EVENT));
    };
    const hide = () => {
      root.classList.remove(PRELOADING_CLASS);
      startIntro();
    };

    if (prefersReducedMotion()) {
      hide();
      return;
    }

    overlay.querySelectorAll('[data-preload-line]').forEach((line, index) => {
      animate(
        line,
        { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'] },
        { duration: 0.28, delay: LINE_DELAYS[index] ?? TITLE_DELAY, ease: 'easeOut' },
      );
    });
    animate(
      '[data-preload-bar]',
      { transform: ['scaleX(0)', 'scaleX(1)'] },
      { duration: 1.6, delay: 0.15, ease: [0.6, 0, 0.2, 1] },
    );
    animate(
      '[data-preload-cursor]',
      { opacity: [1, 1, 0, 0] },
      { duration: 1, times: [0, 0.5, 0.5, 1], ease: 'linear', repeat: Infinity },
    );

    const timer = window.setTimeout(() => {
      startIntro();
      animate(overlay, { opacity: [1, 0] }, { duration: FADE_SECONDS, ease: 'easeOut' }).then(hide);
    }, PRELOAD_DURATION_MS);

    skipRef.current = () => {
      window.clearTimeout(timer);
      hide();
    };

    return () => window.clearTimeout(timer);
  }, [animate, scope]);

  return (
    <div
      ref={scope}
      data-preload
      role="region"
      aria-label="Animasi pembuka"
      className="fixed inset-0 z-40 hidden animate-preload-failsafe flex-col justify-between gap-6 bg-bg p-5 font-mono text-[13px] text-ink md:p-10 md:text-[14px]"
    >
      <div
        className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[12px] tracking-[0.08em] text-faint uppercase"
        aria-hidden="true"
      >
        <span>{host}</span>
        <span>establishing secure session</span>
      </div>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-2.5" aria-hidden="true">
        {steps.map((step) => (
          <p key={step.label} data-preload-line className="flex flex-wrap gap-x-2 opacity-0">
            <span className="text-faint">{step.arrow}</span>
            <span>{step.label}</span>
            {step.detail !== undefined && <span className="text-faint">{step.detail}</span>}
            {step.verified === true && <span className="text-accent">✓ verified</span>}
          </p>
        ))}
        <div className="mt-[18px] mb-2 h-0.5 overflow-hidden bg-line">
          <div data-preload-bar className="h-0.5 origin-left [transform:scaleX(0)] bg-accent"></div>
        </div>
        <p
          data-preload-line
          className="font-sans text-[32px] leading-[1.05] font-extrabold tracking-[-0.02em] opacity-0 md:text-[44px]"
        >
          Selamat datang.
          <span data-preload-cursor className="text-accent">
            _
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-[12px] text-faint" aria-hidden="true">
          session established · ±2 detik
        </span>
        <button
          type="button"
          onClick={() => skipRef.current()}
          className="min-h-11 border border-ink px-5 text-[13px] text-ink hover:border-accent hover:text-accent"
        >
          Lewati <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
