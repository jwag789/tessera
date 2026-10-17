import { useId, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, usePresence } from '../utils';
import { useInlineFocus, useModal } from './Dialog';
import { CloseButton } from './Feedback';

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  /** Short line under the title. */
  description?: ReactNode;
  /** Edge it slides from. Default `right`. */
  side?: 'right' | 'left' | 'bottom';
  /** Width (left/right) or height (bottom) in px. Default 420 / 60vh. */
  size?: number;
  /** Sticky footer, usually buttons; primary last. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Render in place instead of a portal (for demos inside a contained frame). */
  inline?: boolean;
}

/** A panel that slides in from an edge for details or a form, without leaving the page. Modal: traps focus, closes on Escape. */
export function Drawer({ open, onClose, title, description, side = 'right', size, footer, children, className, inline }: DrawerProps) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 260);
  const trap = useModal(open && !inline, panel, onClose);
  useInlineFocus(open && !!inline, panel, onClose);
  if (!mounted) return null;

  const sizeStyle: CSSProperties = size ? (side === 'bottom' ? { height: size } : { width: size }) : {};
  const node = (
    <div
      className={cx('ts-overlay ts-drawer-overlay', `ts-drawer-on-${side}`, closing && 'ts-closing', inline && 'ts-overlay-inline')}
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-desc` : undefined}
        tabIndex={-1}
        className={cx('ts-drawer', `ts-drawer-${side}`, className)}
        style={sizeStyle}
        onKeyDown={trap}
      >
        <div className="ts-drawer-head">
          <div className="ts-drawer-heading">
            <h2 className="ts-dialog-title" id={`${id}-title`}>
              {title}
            </h2>
            {description && (
              <p className="ts-drawer-desc" id={`${id}-desc`}>
                {description}
              </p>
            )}
          </div>
          {onClose && <CloseButton onClick={onClose} label="Close" />}
        </div>
        <div className="ts-drawer-body">{children}</div>
        {footer && <div className="ts-drawer-foot">{footer}</div>}
      </div>
    </div>
  );
  return inline || typeof document === 'undefined' ? node : createPortal(node, document.body);
}
