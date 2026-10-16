import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-start` | `${Side}-end`;

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
  side: Side;
  align: Align;
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function parsePlacement(p: Placement): { side: Side; align: Align } {
  const [side, align] = p.split('-') as [Side, Align | undefined];
  return { side, align: align ?? 'center' };
}

function place(anchor: Rect, size: { width: number; height: number }, side: Side, align: Align, offset: number) {
  const vertical = side === 'top' || side === 'bottom';
  let x: number;
  let y: number;
  if (vertical) {
    y = side === 'bottom' ? anchor.top + anchor.height + offset : anchor.top - size.height - offset;
    x = align === 'start' ? anchor.left : align === 'end' ? anchor.left + anchor.width - size.width : anchor.left + (anchor.width - size.width) / 2;
  } else {
    x = side === 'right' ? anchor.left + anchor.width + offset : anchor.left - size.width - offset;
    y = align === 'start' ? anchor.top : align === 'end' ? anchor.top + anchor.height - size.height : anchor.top + (anchor.height - size.height) / 2;
  }
  return { x, y };
}

function overflow(pos: { x: number; y: number }, size: { width: number; height: number }, side: Side, viewport: { width: number; height: number }, pad: number) {
  if (side === 'bottom') return pos.y + size.height + pad - viewport.height;
  if (side === 'top') return pad - pos.y;
  if (side === 'right') return pos.x + size.width + pad - viewport.width;
  return pad - pos.x;
}

/**
 * Where to put a floating element next to an anchor, in viewport coordinates.
 * Flips to the opposite side when the preferred side has no room, then shifts along
 * the cross axis to stay `pad` px inside the viewport.
 */
export function computePosition(
  anchor: Rect,
  size: { width: number; height: number },
  placement: Placement,
  options: { offset?: number; pad?: number; viewport?: { width: number; height: number } } = {}
): Position {
  const offset = options.offset ?? 8;
  const pad = options.pad ?? 8;
  const viewport = options.viewport ?? { width: window.innerWidth, height: window.innerHeight };
  const { side: preferred, align } = parsePlacement(placement);

  let side = preferred;
  let pos = place(anchor, size, side, align, offset);
  if (overflow(pos, size, side, viewport, pad) > 0) {
    const flipped = OPPOSITE[side];
    const alt = place(anchor, size, flipped, align, offset);
    if (overflow(alt, size, flipped, viewport, pad) < overflow(pos, size, side, viewport, pad)) {
      side = flipped;
      pos = alt;
    }
  }

  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  if (side === 'top' || side === 'bottom') pos.x = clamp(pos.x, pad, viewport.width - size.width - pad);
  else pos.y = clamp(pos.y, pad, viewport.height - size.height - pad);

  return { x: Math.round(pos.x), y: Math.round(pos.y), side, align };
}

/**
 * Keeps a `position: fixed` floating element attached to its anchor while `open`:
 * recomputes on scroll (any ancestor), resize and size changes.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement>,
  floatingRef: RefObject<HTMLElement>,
  open: boolean,
  placement: Placement,
  offset = 8
): Position | null {
  const [pos, setPos] = useState<Position | null>(null);

  const update = useCallback(() => {
    const a = anchorRef.current;
    const f = floatingRef.current;
    if (!a || !f) return;
    const r = a.getBoundingClientRect();
    const next = computePosition(r, { width: f.offsetWidth, height: f.offsetHeight }, placement, { offset });
    setPos((prev) => (prev && prev.x === next.x && prev.y === next.y && prev.side === next.side ? prev : next));
  }, [anchorRef, floatingRef, placement, offset]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) {
      if (anchorRef.current) ro.observe(anchorRef.current);
      if (floatingRef.current) ro.observe(floatingRef.current);
    }
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [open, update, anchorRef, floatingRef]);

  return pos;
}

/** Closes something when a pointer goes down outside all of the given elements. */
export function useDismiss(open: boolean, refs: Array<RefObject<HTMLElement>>, onDismiss: () => void) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const refsRef = useRef(refs);
  refsRef.current = refs;
  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refsRef.current.some((r) => r.current?.contains(t))) return;
      dismissRef.current();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);
}
