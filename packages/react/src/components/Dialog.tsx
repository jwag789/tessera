import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cx, focusables, usePresence } from '../utils';
import { CloseButton } from './Feedback';

/**
 * Shared modal behavior for Dialog and Drawer: focus moves in on open and back out on close,
 * Escape calls onClose, Tab cycles inside, and the page behind stops scrolling.
 */
export function useModal(open: boolean, panel: RefObject<HTMLElement>, onClose?: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.({ preventScroll: true });
    };
  }, [open, panel]);

  return function trap(e: KeyboardEvent) {
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
  };
}

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
  const trap = useModal(open && !inline, panel, onClose);
  useInlineFocus(open && !!inline, panel, onClose);

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

/** Inline demos: Escape still closes, but focus and page scroll are left alone. */
export function useInlineFocus(open: boolean, _panel: RefObject<HTMLElement>, onClose?: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && closeRef.current?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
}
