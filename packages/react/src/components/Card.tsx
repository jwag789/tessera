import type { CSSProperties, ElementType, MouseEventHandler, ReactNode } from 'react';
import { cx, hash, rng } from '../utils';

function Motif({ seed }: { seed: string }) {
  const r = rng(hash(seed) + 7);
  const odd = Math.floor(r() * 9);
  return (
    <div className="ts-card-motif" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const far = i === odd;
        const jitter = (n: number) => Math.round((r() - 0.5) * n);
        return (
          <span
            key={i}
            className={far ? 'ts-odd' : undefined}
            style={{ '--dx': `${jitter(far ? 24 : 8)}px`, '--dy': `${jitter(far ? 24 : 8)}px`, '--rot': `${jitter(far ? 40 : 12)}deg` } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

export interface CardProps {
  eyebrow?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  /** `flat`: hairline border · `raised`: soft shadow · `tile`: ink border and hard shadow, one per view. */
  variant?: 'flat' | 'raised' | 'tile';
  /** Hover lift. Implied by `onClick`. */
  interactive?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  /** A 3×3 tile cluster in the corner that scatters on hover. */
  motif?: boolean;
  as?: ElementType;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

/** A container that groups one subject. */
export function Card({ eyebrow, title, actions, variant = 'flat', interactive, onClick, motif, as: As = 'section', style, className, children }: CardProps) {
  const isInteractive = !!(onClick || interactive);
  return (
    <As className={cx('ts-card', variant !== 'flat' && `ts-card-${variant}`, isInteractive && 'ts-card-interactive', className)} onClick={onClick} style={style}>
      {motif && <Motif seed={typeof title === 'string' ? title : 'tessera'} />}
      {eyebrow && <div className="ts-card-eyebrow">{eyebrow}</div>}
      {title && <h3 className="ts-card-title">{title}</h3>}
      {children && <div className="ts-card-body">{children}</div>}
      {actions && <div className="ts-card-actions">{actions}</div>}
    </As>
  );
}
