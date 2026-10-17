import type { HTMLAttributes, ReactNode } from 'react';
import { cx, hash, rng } from '../utils';

/** A keyboard key or shortcut, e.g. ⌘K. */
export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd {...rest} className={cx('ts-kbd', className)} />;
}

export interface SpinnerProps {
  /** Pixels. Default 20. */
  size?: number;
  /** Announced to screen readers. Default "Loading". */
  label?: string;
  className?: string;
}

/** An indeterminate loading indicator: four tiles taking turns. */
export function Spinner({ size = 20, label = 'Loading', className }: SpinnerProps) {
  return (
    <span className={cx('ts-spinner', className)} role="status" style={{ width: size, height: size }}>
      <i />
      <i />
      <i />
      <i />
      <span className="ts-sr-only">{label}</span>
    </span>
  );
}

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons: one primary action, maybe a secondary one. */
  actions?: ReactNode;
  /** Replaces the default tile illustration. */
  illustration?: ReactNode;
  /** Changes the tile pattern. */
  seed?: string;
  className?: string;
}

function Tiles({ seed }: { seed: string }) {
  const r = rng(hash(seed) + 3);
  const odd = Math.floor(r() * 9);
  return (
    <div className="ts-empty-tiles" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={i === odd ? 'ts-odd' : r() < 0.4 ? 'ts-dim' : undefined} style={{ animationDelay: `${i * 50}ms` }} />
      ))}
    </div>
  );
}

/** What a list or page shows before it has content: what goes here and how to add the first one. */
export function EmptyState({ title, description, actions, illustration, seed = 'empty', className }: EmptyStateProps) {
  return (
    <div className={cx('ts-empty', className)}>
      {illustration ?? <Tiles seed={seed} />}
      <h3 className="ts-empty-title">{title}</h3>
      {description && <p className="ts-empty-desc">{description}</p>}
      {actions && <div className="ts-empty-actions">{actions}</div>}
    </div>
  );
}
