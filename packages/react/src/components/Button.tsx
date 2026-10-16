import { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, PointerEvent, ReactNode } from 'react';
import { cx, prefersReducedMotion } from '../utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary`: the one main action · `secondary` · `ghost` · `danger`: destructive · `tile`: the saffron hero CTA, once per page. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tile';
  /** `sm` 32px · `md` 40px · `lg` 52px */
  size?: 'sm' | 'md' | 'lg';
  /** Swaps the left icon for a spinner and disables the button. */
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Full width. */
  block?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  d: number;
}

let rippleId = 0;

/** Triggers an action. One `primary` per view. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, iconLeft, iconRight, block, className, children, disabled, onPointerDown, type = 'button', ...rest },
  ref
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    onPointerDown?.(e);
    if (disabled || loading || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2.2;
    const rip = { id: ++rippleId, x: e.clientX - r.left - d / 2, y: e.clientY - r.top - d / 2, d };
    setRipples((list) => [...list, rip]);
    setTimeout(() => setRipples((list) => list.filter((x) => x.id !== rip.id)), 650);
  }

  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cx('ts-btn', `ts-btn-${variant}`, size !== 'md' && `ts-btn-${size}`, block && 'ts-btn-block', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
    >
      {ripples.map((r) => (
        <span key={r.id} className="ts-ripple" style={{ left: r.x, top: r.y, width: r.d, height: r.d }} />
      ))}
      {loading ? <span className="ts-spin" aria-hidden="true" /> : iconLeft}
      {children}
      {iconRight && <span className="ts-icon-end">{iconRight}</span>}
    </button>
  );
});
