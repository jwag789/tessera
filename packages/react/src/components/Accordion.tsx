import { useId, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx, useControllable } from '../utils';
import { Icon } from './Icon';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** `single`: opening one closes the others. `multiple`: each opens on its own. */
  type?: 'single' | 'multiple';
  /** Ids of open items. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (open: string[]) => void;
  className?: string;
}

/** Stacked sections that expand in place (WAI-ARIA accordion). */
export function Accordion({ items, type = 'single', value, defaultValue = [], onChange, className }: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useControllable(value, defaultValue, onChange);
  const headers = useRef<Array<HTMLButtonElement | null>>([]);

  function toggle(id: string) {
    const isOpen = open.includes(id);
    if (type === 'single') setOpen(isOpen ? [] : [id]);
    else setOpen(isOpen ? open.filter((x) => x !== id) : [...open, id]);
  }

  function onKeyDown(e: KeyboardEvent, i: number) {
    const enabled = items.map((it, j) => (it.disabled ? -1 : j)).filter((j) => j >= 0);
    const pos = enabled.indexOf(i);
    const target =
      e.key === 'ArrowDown' ? enabled[(pos + 1) % enabled.length] : e.key === 'ArrowUp' ? enabled[(pos - 1 + enabled.length) % enabled.length] : e.key === 'Home' ? enabled[0] : e.key === 'End' ? enabled[enabled.length - 1] : undefined;
    if (target === undefined) return;
    e.preventDefault();
    headers.current[target]?.focus();
  }

  return (
    <div className={cx('ts-accordion', className)}>
      {items.map((it, i) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={cx('ts-acc-item', isOpen && 'ts-acc-open')}>
            <h3 className="ts-acc-heading">
              <button
                type="button"
                ref={(el) => {
                  headers.current[i] = el;
                }}
                id={`${base}-h-${it.id}`}
                className="ts-acc-trigger"
                aria-expanded={isOpen}
                aria-controls={`${base}-p-${it.id}`}
                disabled={it.disabled}
                onClick={() => toggle(it.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span>{it.title}</span>
                <span className="ts-acc-sign" aria-hidden="true">
                  <Icon name="plus" />
                </span>
              </button>
            </h3>
            <div className="ts-acc-panel" id={`${base}-p-${it.id}`} role="region" aria-labelledby={`${base}-h-${it.id}`} data-open={isOpen}>
              <div className="ts-acc-inner">
                <div className="ts-acc-body">{it.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
