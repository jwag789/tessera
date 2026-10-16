import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { cx, hash } from '../utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';
  /** Leading dot for states. */
  dot?: boolean;
  /** Pulsing dot: something happening right now. One per view. */
  live?: boolean;
}

/** A short, non-interactive status or category label. */
export function Badge({ tone = 'neutral', dot, live, className, ...rest }: BadgeProps) {
  return <span {...rest} className={cx('ts-badge', tone !== 'neutral' && `ts-badge-${tone}`, (dot || live) && 'ts-badge-dot', live && 'ts-badge-live', className)} />;
}

export interface AvatarProps {
  /** Used for the initials, the color and the accessible label. */
  name: string;
  src?: string;
  /** Pixels; default 36. */
  size?: number;
  className?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

/** A round photo or initials for a person. */
export function Avatar({ name, src, size = 36, className, imgProps }: AvatarProps) {
  return (
    <span
      className={cx('ts-avatar', className)}
      data-hue={src ? undefined : String(hash(name) % 4)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      title={name}
      role="img"
      aria-label={name}
    >
      {src ? <img src={src} alt="" {...imgProps} /> : initials(name)}
    </span>
  );
}

/** Overlaps several avatars; fans them out on hover. */
export function AvatarGroup({ children }: { children?: ReactNode }) {
  return <span className="ts-avatar-group">{children}</span>;
}
