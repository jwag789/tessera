import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, KeyboardEvent, MouseEvent, ReactElement, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useAnchoredPosition, useDismiss } from '../positioning';
import type { Placement, Position } from '../positioning';
import { cx, focusables, useControllable, usePresence } from '../utils';

/**
 * A floating layer anchored to an element: portal, position, flip, entrance and exit motion.
 * Popover, DropdownMenu, DatePicker and Tooltip are all built on it.
 */
export function Floating({
  anchorRef,
  open,
  placement = 'bottom-start',
  offset = 8,
  className,
  style,
  children,
  floatingRef: externalRef,
  ...rest
}: {
  anchorRef: RefObject<HTMLElement>;
  open: boolean;
  placement?: Placement;
  offset?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  floatingRef?: RefObject<HTMLDivElement>;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'className'>) {
  const innerRef = useRef<HTMLDivElement>(null);
  const ref = externalRef ?? innerRef;
  const { mounted, closing } = usePresence(open, 140);
  const pos: Position | null = useAnchoredPosition(anchorRef, ref, mounted, placement, offset);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(
    <div
      {...rest}
      ref={ref}
      className={cx('ts-float', closing && 'ts-float-closing', className)}
      data-side={pos?.side ?? 'bottom'}
      data-align={pos?.align ?? 'start'}
      style={{ ...style, position: 'fixed', left: pos?.x ?? 0, top: pos?.y ?? 0, visibility: pos ? undefined : 'hidden' }}
    >
      {children}
    </div>,
    document.body
  );
}

export interface PopoverProps {
  /** The element that opens it, usually a Button. It gets `aria-expanded` and `aria-controls`. */
  trigger: ReactElement;
  children: ReactNode;
  /** Optional heading; also names the popover for screen readers. */
  title?: ReactNode;
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Width in px. Default: fits content up to 360px. */
  width?: number;
  /** Move focus into the panel when it opens. Default true. */
  autoFocus?: boolean;
  className?: string;
}

/** Non-modal floating panel for extra controls or detail next to a trigger. Closes on Escape and outside click. */
export function Popover({ trigger, children, title, placement = 'bottom-start', open: openProp, defaultOpen = false, onOpenChange, width, autoFocus = true, className }: PopoverProps) {
  const id = useId();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(open, [anchorRef, panelRef], () => setOpen(false));

  function close() {
    setOpen(false);
    focusTrigger(anchorRef.current);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  }

  const triggerEl = isValidElement<Record<string, unknown>>(trigger)
    ? cloneElement(trigger, {
        'aria-expanded': open,
        'aria-controls': open ? `${id}-pop` : undefined,
        'aria-haspopup': 'dialog',
        onClick: (e: MouseEvent) => {
          (trigger.props.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
          setOpen(!open);
        }
      })
    : trigger;

  return (
    <>
      <span ref={anchorRef} className="ts-anchor">
        {triggerEl}
      </span>
      <Floating
        anchorRef={anchorRef}
        open={open}
        placement={placement}
        floatingRef={panelRef}
        className={cx('ts-popover', className)}
        style={width ? { width } : undefined}
        id={`${id}-pop`}
        role="dialog"
        aria-labelledby={title ? `${id}-title` : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        {autoFocus && <FocusOnOpen panelRef={panelRef} />}
        {title && (
          <div className="ts-popover-title" id={`${id}-title`}>
            {title}
          </div>
        )}
        {children}
      </Floating>
    </>
  );
}

/** Moves focus into a floating panel once it is positioned. */
export function FocusOnOpen({ panelRef, target = 'first' }: { panelRef: RefObject<HTMLElement>; target?: 'first' | 'panel' }) {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const p = panelRef.current;
      if (!p) return;
      (target === 'first' ? (focusables(p)[0] ?? p) : p).focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [panelRef, target]);
  return null;
}

/** Focuses the trigger inside an anchor wrapper (or the wrapper itself). */
export function focusTrigger(anchor: HTMLElement | null) {
  (anchor?.querySelector<HTMLElement>('button, a[href], input, [tabindex]') ?? anchor)?.focus();
}
