import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, focusables, usePresence } from '../utils';
import { CloseButton } from './Feedback';

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  /** Buttons; primary last. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Render in place instead of a portal on document.body (for demos inside a contained frame). */
  inline?: boolean;
}

/** A modal that interrupts to confirm or collect something. Traps focus, closes on Escape and scrim click. */
export function Dialog({ open, onClose, title, actions, children, className, inline }: DialogProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 220);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  function trap(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const items = focusables(panel.current);
    if (!items.length) return e.preventDefault();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!mounted) return null;
  const node = (
    <div
      className={cx('ts-overlay', closing && 'ts-closing', inline && 'ts-overlay-inline')}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={cx('ts-dialog', className)} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={panel} onKeyDown={trap}>
        <div className="ts-dialog-head">
          <h2 className="ts-dialog-title" id={titleId}>
            {title}
          </h2>
          {onClose && <CloseButton onClick={onClose} label="Close" />}
        </div>
        {children && <div className="ts-dialog-body">{children}</div>}
        {actions && <div className="ts-dialog-actions">{actions}</div>}
      </div>
    </div>
  );
  return inline || typeof document === 'undefined' ? node : createPortal(node, document.body);
}
