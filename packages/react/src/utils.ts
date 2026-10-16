import { useCallback, useEffect, useRef, useState } from 'react';
import type { MutableRefObject, Ref, RefCallback } from 'react';

export type ClassValue = string | number | boolean | null | undefined;

/** Joins truthy class names. */
export function cx(...values: ClassValue[]): string {
  return values.filter((v): v is string => typeof v === 'string' && v.length > 0).join(' ');
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Small stable string hash (for picking colors and patterns from a name). */
export function hash(input: string): number {
  let x = 0;
  for (let i = 0; i < input.length; i++) x = (x * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(x);
}

/** Deterministic pseudo-random generator, so patterns render the same on server and client. */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * Returns the current value and a setter that always calls `onChange`.
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const changeRef = useRef(onChange);
  changeRef.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      changeRef.current?.(next);
    },
    [controlled]
  );
  return [controlled ? (value as T) : inner, set];
}

/** Keeps something mounted for `ms` after `open` turns false, so its exit animation can play. */
export function usePresence(open: boolean, ms = 160): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (prefersReducedMotion()) {
      setMounted(false);
      return;
    }
    const t = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(t);
  }, [open, ms]);
  return { mounted: open || mounted, closing: !open && mounted };
}

/** Merges several refs into one callback ref. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as MutableRefObject<T | null>).current = node;
    }
  };
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
export function focusables(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
}
