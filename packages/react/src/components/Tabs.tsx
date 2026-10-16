import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx, useControllable } from '../utils';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Accessible name for the tab list. */
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

/** Switches between sibling views without leaving the page (WAI-ARIA tabs, automatic activation). */
export function Tabs({ items, label, value: valueProp, defaultValue, onChange, className }: TabsProps) {
  const base = useId();
  const [value, setValue] = useControllable(valueProp, defaultValue ?? items[0]?.id ?? '', onChange);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ink, setInk] = useState({ x: 0, w: 0, ready: false });

  const measure = () => {
    const el = refs.current[value];
    if (el) setInk({ x: el.offsetLeft + 12, w: Math.max(0, el.offsetWidth - 24), ready: true });
  };
  useLayoutEffect(measure, [value, items.length]);
  useEffect(() => {
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  });

  function onKeyDown(e: KeyboardEvent) {
    const i = items.findIndex((t) => t.id === value);
    const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = items[(n + items.length) % items.length];
    setValue(next.id);
    refs.current[next.id]?.focus();
  }

  const active = items.find((t) => t.id === value);
  return (
    <div className={cx('ts-tabs', className)}>
      <div className="ts-tablist" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {items.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              className="ts-tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel`}
              tabIndex={on ? 0 : -1}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              onClick={() => setValue(t.id)}
            >
              {t.label}
            </button>
          );
        })}
        <span className="ts-tab-ink" aria-hidden="true" style={{ width: ink.w, transform: `translateX(${ink.x}px)`, opacity: ink.ready ? 1 : 0 }} />
      </div>
      {active && (
        <div key={active.id} className="ts-tabpanel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${active.id}`} tabIndex={0}>
          {active.content}
        </div>
      )}
    </div>
  );
}
