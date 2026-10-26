'use client';

import { useId, type ReactNode } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** What will happen, in a sentence or two */
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  /** The confirmed action is running: the dialog can't be dismissed meanwhile */
  pending?: boolean;
  tone?: 'danger' | 'primary';
}

/**
 * Asks before an action that can't be undone. Cancel comes first, so it is what
 * the dialog focuses when it opens.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  pending = false,
  tone = 'danger',
}: ConfirmDialogProps) {
  const id = useId();
  const close = () => {
    if (!pending) onClose();
  };

  return (
    <Dialog open={open} onClose={close} labelledBy={`${id}-title`} describedBy={`${id}-body`}>
      <div className="flex flex-col gap-3 px-6 pt-6 pb-5">
        <h2 id={`${id}-title`} className="text-xl font-bold">
          {title}
        </h2>
        <div id={`${id}-body`} className="text-[15px] leading-relaxed text-fg-2">
          {children}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-line-soft bg-surface-2 px-6 py-4">
        <Button variant="secondary" onClick={close} disabled={pending}>
          Ακύρωση
        </Button>
        <Button variant={tone} onClick={onConfirm} pending={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
