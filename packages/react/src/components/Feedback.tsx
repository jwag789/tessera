import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../utils';
import { Icon } from './Icon';

export function CloseButton({ onClick, label = 'Dismiss' }: { onClick?: () => void; label?: string }) {
  return (
    <button type="button" className="ts-close ts-focus" aria-label={label} onClick={onClick}>
      <Icon name="x" />
    </button>
  );
}

export interface AlertProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  /** Shows a close button. */
  onDismiss?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** An inline message about the page or section it sits in. */
export function Alert({ tone = 'info', title, onDismiss, className, style, children }: AlertProps) {
  return (
    <div className={cx('ts-alert', `ts-alert-${tone}`, className)} style={style} role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}>
      <Icon name={tone} />
      <div className="ts-alert-content">
        {title && <strong className="ts-alert-title">{title}</strong>}
        {children}
      </div>
      {onDismiss && <CloseButton onClick={onDismiss} />}
    </div>
  );
}

export interface ProgressProps {
  value: number;
  /** Default 100; with `steps`, the number of steps. */
  max?: number;
  label?: ReactNode;
  /** Segmented: one tile per step. */
  steps?: boolean;
  tone?: 'brand' | 'success';
  className?: string;
}

/** Shows how far along a task is. */
export function Progress({ value: raw, max = 100, label, steps, tone, className }: ProgressProps) {
  const value = Math.max(0, Math.min(max, raw || 0));
  const pct = Math.round((value / max) * 100);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const shown = mounted ? value : 0;
  return (
    <div
      className={cx('ts-progress', tone === 'success' && 'ts-progress-success', steps && 'ts-progress-segmented', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {label && (
        <div className="ts-progress-head">
          <span>{label}</span>
          <span>{steps ? `${value} of ${max}` : `${pct}%`}</span>
        </div>
      )}
      {steps ? (
        <div className="ts-progress-track" style={{ gridTemplateColumns: `repeat(${max}, 1fr)` }}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className={cx('ts-seg', i < shown && 'ts-seg-on', i === value - 1 && 'ts-seg-current')} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      ) : (
        <div className="ts-progress-track">
          <div className="ts-progress-bar" style={{ width: `${mounted ? pct : 0}%` }} />
        </div>
      )}
    </div>
  );
}

export interface SkeletonProps {
  /** Default 1; the last of several lines is shorter. */
  lines?: number;
  height?: number;
  width?: number | string;
  /** A circle of `size` px, for avatars. */
  circle?: boolean;
  size?: number;
}

/** A shimmering placeholder in the shape of content that is still loading. */
export function Skeleton({ lines = 1, height = 12, width = '100%', circle, size = 40 }: SkeletonProps) {
  if (circle) return <span className="ts-skeleton" aria-hidden="true" style={{ width: size, height: size, borderRadius: 9999, flex: 'none' }} />;
  return (
    <span aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="ts-skeleton" style={{ height, width: i === lines - 1 && lines > 1 ? '62%' : width }} />
      ))}
    </span>
  );
}
