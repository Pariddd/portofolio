import { useAnimate } from 'motion/react-mini';
import { useEffect, type ReactNode } from 'react';
import { EASE_MAIN, prefersReducedMotion } from '../../lib/motion';

interface Props {
  children?: ReactNode;
}

const HIDDEN = 'translateY(16px) scale(0.98)';
const SHOWN = 'translateY(0px) scale(1)';

// Membuka dan menutup <dialog> di dalam slot dengan animasi. Pemicu boleh berada di mana
// saja di halaman: elemen `data-dialog-open="<id dialog>"`. Menutup: tombol
// `data-dialog-close`, klik latar, atau Esc.
export default function Dialogs({ children }: Props) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    const root = scope.current;
    const reduced = prefersReducedMotion();
    const dialogs = [...root.querySelectorAll('dialog')];

    const open = (dialog: HTMLDialogElement) => {
      if (dialog.open) return;
      dialog.showModal();
      if (reduced) return;
      animate(
        dialog,
        { opacity: [0, 1], transform: [HIDDEN, SHOWN] },
        { duration: 0.28, ease: EASE_MAIN },
      );
    };
    const close = (dialog: HTMLDialogElement) => {
      if (!dialog.open) return;
      if (reduced) {
        dialog.close();
        return;
      }
      animate(
        dialog,
        { opacity: [1, 0], transform: [SHOWN, HIDDEN] },
        { duration: 0.18, ease: 'easeIn' },
      ).then(() => dialog.close());
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const id = event.target.closest<HTMLElement>('[data-dialog-open]')?.dataset['dialogOpen'];
      const dialog = dialogs.find((candidate) => candidate.id === id);
      if (dialog !== undefined) open(dialog);
    };
    const onRootClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const dialog = event.target.closest('dialog');
      if (dialog === null) return;
      // Klik tepat pada <dialog> berarti klik di latar, bukan di isinya.
      if (event.target === dialog || event.target.closest('[data-dialog-close]') !== null) {
        close(dialog);
      }
    };
    const onCancel = (event: Event) => {
      if (!(event.currentTarget instanceof HTMLDialogElement)) return;
      event.preventDefault();
      close(event.currentTarget);
    };

    document.addEventListener('click', onDocumentClick);
    root.addEventListener('click', onRootClick);
    for (const dialog of dialogs) dialog.addEventListener('cancel', onCancel);

    return () => {
      document.removeEventListener('click', onDocumentClick);
      root.removeEventListener('click', onRootClick);
      for (const dialog of dialogs) dialog.removeEventListener('cancel', onCancel);
    };
  }, [animate, scope]);

  return <div ref={scope}>{children}</div>;
}
