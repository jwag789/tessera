import { useMemo, useRef } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { cx, prefersReducedMotion, rng } from '../utils';

export interface MosaicProps {
  columns?: number;
  rows?: number;
  /** Changes the pattern and where the saffron tile lands. */
  seed?: number;
  /** Pixels between tiles. Default 6. */
  gap?: number;
  /** Tiles lift toward the pointer. Default true. */
  interactive?: boolean;
  style?: CSSProperties;
  className?: string;
  /** Overlaid bottom-left. */
  children?: ReactNode;
}

/** The brand motif as a live surface: tiles assemble on mount and lift near the pointer. */
export function Mosaic({ columns = 12, rows = 8, seed = 7, gap = 6, interactive = true, style, className, children }: MosaicProps) {
  const root = useRef<HTMLDivElement>(null);
  const tiles = useRef<Array<HTMLSpanElement | null>>([]);

  const cells = useMemo(() => {
    const r = rng(seed);
    const odd = Math.floor(rng(seed + 1)() * columns * rows);
    return Array.from({ length: columns * rows }, (_, i) => {
      const x = i % columns;
      const y = Math.floor(i / columns);
      const roll = r();
      const c = i === odd ? 4 : roll < 0.16 ? 3 : roll < 0.42 ? 2 : roll < 0.7 ? 1 : 0;
      return { i, c, delay: (x + y) * 28 + Math.floor(r() * 120) };
    });
  }, [columns, rows, seed]);

  function onMove(e: PointerEvent) {
    if (!interactive || prefersReducedMotion() || !root.current) return;
    const box = root.current.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    const cw = box.width / columns;
    const ch = box.height / rows;
    tiles.current.forEach((el, k) => {
      if (!el) return;
      const d = Math.hypot(px - (k % columns + 0.5) * cw, py - (Math.floor(k / columns) + 0.5) * ch) / Math.max(cw, ch);
      const f = Math.max(0, 1 - d / 3.2);
      el.style.setProperty('--ty', `${(-f * 7).toFixed(1)}px`);
      el.style.setProperty('--s', (1 + f * 0.12).toFixed(3));
      el.classList.toggle('ts-hot', d < 0.6);
    });
  }

  function onLeave() {
    tiles.current.forEach((el) => {
      if (!el) return;
      el.style.removeProperty('--ty');
      el.style.removeProperty('--s');
      el.classList.remove('ts-hot');
    });
  }

  return (
    <div
      ref={root}
      className={cx('ts-mosaic', className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, '--ts-gap': `${gap}px`, ...style } as CSSProperties}
      role={children ? undefined : 'presentation'}
    >
      {cells.map((cell) => (
        <span
          key={cell.i}
          className="ts-mosaic-tile"
          data-c={cell.c}
          ref={(el) => {
            tiles.current[cell.i] = el;
          }}
          style={{ animationDelay: `${cell.delay}ms` }}
        />
      ))}
      {children && <div className="ts-mosaic-content">{children}</div>}
    </div>
  );
}
