import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import type { Side } from '../positioning';
import { Floating } from './Popover';

export interface TooltipProps {
  /** A few words. */
  content: ReactNode;
  /** One focusable child. */
  children: ReactElement;
  /** Side to appear on; flips if there's no room. Default `top`. */
  placement?: Side;
  /** Force visible (for demos). */
  open?: boolean;
  /** Hover delay in ms. Default 250. */
  delay?: number;
}

/** A short label on hover and keyboard focus, for icon-only buttons and truncated text. */
export function Tooltip({ content, children, placement = 'top', open: forced, delay = 250 }: TooltipProps) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const open = forced ?? shown;

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShown(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown]);

  const show = (wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setShown(false);
  };
  const p = children.props as Record<string, ((e: never) => void) | undefined>;

  return (
    <>
      <span
        ref={anchorRef}
        className="ts-anchor"
        onMouseEnter={(e: MouseEvent) => (p.onMouseEnter?.(e as never), show(delay))}
        onMouseLeave={(e: MouseEvent) => (p.onMouseLeave?.(e as never), hide())}
        onFocus={(e: FocusEvent) => (p.onFocus?.(e as never), show(0))}
        onBlur={(e: FocusEvent) => (p.onBlur?.(e as never), hide())}
      >
        {cloneElement(children, { 'aria-describedby': id } as Record<string, unknown>)}
      </span>
      <Floating anchorRef={anchorRef} open={open} placement={placement} offset={10} className="ts-tooltip" role="tooltip" id={id}>
        {content}
      </Floating>
    </>
  );
}
