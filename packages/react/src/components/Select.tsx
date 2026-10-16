import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx, prefersReducedMotion, useControllable } from '../utils';
import { Badge } from './Badge';
import type { BadgeProps } from './Badge';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
  /** Second line in muted text. */
  description?: ReactNode;
  /** A letter or two, or any node; shown in a 30px tile. */
  icon?: ReactNode;
  badge?: ReactNode;
  badgeTone?: BadgeProps['tone'];
  disabled?: boolean;
}

export type OptionInput = string | SelectOption;
export const normalizeOptions = (options: OptionInput[]): SelectOption[] =>
  options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

/** First enabled index at or after `from`, stepping by `dir` and wrapping. -1 if none. */
export function nextEnabled(options: { disabled?: boolean }[], from: number, dir: 1 | -1): number {
  const n = options.length;
  for (let k = 0; k < n; k++) {
    const j = (((from + dir * k) % n) + n) % n;
    if (!options[j].disabled) return j;
  }
  return -1;
}

/** The inside of one option row, shared by Select and Combobox. */
export function OptionContent({ option, label }: { option: SelectOption; label?: ReactNode }) {
  return (
    <>
      {option.icon && (
        <span className="ts-opt-icon" aria-hidden="true">
          {option.icon}
        </span>
      )}
      <span className="ts-opt-text">
        <span className="ts-opt-label">{label ?? option.label}</span>
        {option.description && <span className="ts-opt-desc">{option.description}</span>}
      </span>
      {option.badge && <Badge tone={option.badgeTone ?? 'accent'}>{option.badge}</Badge>}
      <svg className="ts-opt-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </>
  );
}

export interface SelectProps {
  label: ReactNode;
  options: OptionInput[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string, option: SelectOption) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  /** Adds a hidden input so the value posts with a form. */
  name?: string;
  id?: string;
  /** Start open (for demos). */
  defaultOpen?: boolean;
  className?: string;
}

/** A custom dropdown for picking one option (WAI-ARIA select-only combobox). */
export function Select({ label, options, value: valueProp, defaultValue = null, onChange, placeholder, hint, error, disabled, name, id: idProp, defaultOpen, className }: SelectProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const listId = `${id}-list`;
  const opts = normalizeOptions(options);
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue);
  const selIndex = opts.findIndex((o) => o.value === value);
  const [open, setOpenState] = useState(!!defaultOpen);
  const [closing, setClosing] = useState(false);
  const [active, setActive] = useState(selIndex);
  const [side, setSide] = useState<'down' | 'up'>('down');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ s: '', t: 0 });
  const keyNav = useRef(false);

  function setOpen(next: boolean) {
    if (next === open) return;
    if (next) {
      const r = trigger.current?.getBoundingClientRect();
      if (r) {
        const below = window.innerHeight - r.bottom;
        setSide(below < 260 && r.top > below ? 'up' : 'down');
      }
      setActive(selIndex >= 0 ? selIndex : nextEnabled(opts, 0, 1));
      setClosing(false);
      setOpenState(true);
    } else {
      setOpenState(false);
      if (prefersReducedMotion()) return;
      setClosing(true);
      setTimeout(() => setClosing(false), 140);
    }
  }

  function choose(i: number) {
    const o = opts[i];
    if (!o || o.disabled) return;
    setValue(o.value);
    onChange?.(o.value, o);
    setOpen(false);
    trigger.current?.focus();
  }

  function move(to: number) {
    keyNav.current = true;
    setActive(to);
  }

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  });

  useEffect(() => {
    if (!open || !keyNav.current || !list.current || active < 0) return;
    keyNav.current = false;
    const el = list.current.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (!el) return;
    const l = list.current;
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 6;
  }, [active, open]);

  function typeahead(e: KeyboardEvent, ch: string) {
    e.preventDefault();
    const now = Date.now();
    const t = typed.current;
    t.s = (now - t.t > 600 ? '' : t.s) + ch.toLowerCase();
    t.t = now;
    const from = active < 0 ? 0 : active + (t.s.length === 1 ? 1 : 0);
    for (let n = 0; n < opts.length; n++) {
      const j = (from + n) % opts.length;
      if (!opts[j].disabled && opts[j].label.toLowerCase().startsWith(t.s)) {
        if (open) move(j);
        else choose(j);
        return;
      }
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const dir = k === 'ArrowDown' ? 1 : -1;
      move(nextEnabled(opts, active < 0 ? 0 : active + dir, dir));
    } else if (k === 'Home' || k === 'End') {
      if (!open) return;
      e.preventDefault();
      move(k === 'Home' ? nextEnabled(opts, 0, 1) : nextEnabled(opts, opts.length - 1, -1));
    } else if (k === 'Enter' || k === ' ') {
      if (k === ' ' && typed.current.s && Date.now() - typed.current.t < 600) return typeahead(e, ' ');
      e.preventDefault();
      if (open && active >= 0) choose(active);
      else setOpen(true);
    } else if (k === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    } else if (k === 'Tab') {
      if (open) setOpen(false);
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      typeahead(e, k);
    }
  }

  const selected = selIndex >= 0 ? opts[selIndex] : null;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={cx('ts-sel', open && 'ts-sel-open')} ref={root}>
        <button
          type="button"
          id={id}
          ref={trigger}
          className="ts-sel-trigger"
          disabled={disabled}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
          {...describedBy(id, hint, error)}
          onClick={() => setOpen(!open)}
          onKeyDown={onKeyDown}
        >
          {selected?.icon && (
            <span className="ts-opt-icon ts-sel-icon" aria-hidden="true">
              {selected.icon}
            </span>
          )}
          <span className={cx('ts-sel-value', !selected && 'ts-sel-ph')}>{selected ? selected.label : placeholder ?? 'Select…'}</span>
          <Icon name="chevron" className="ts-sel-chev" />
        </button>
        {name && <input type="hidden" name={name} value={value ?? ''} />}
        {(open || closing) && (
          <ul ref={list} id={listId} role="listbox" tabIndex={-1} aria-labelledby={`${id}-label`} className={cx('ts-sel-list', `ts-sel-${side}`, !open && 'ts-sel-closing')}>
            {opts.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-opt-${i}`}
                data-i={i}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                className={cx('ts-opt', i === active && 'ts-opt-active', o.value === value && 'ts-opt-selected', o.disabled && 'ts-opt-disabled')}
                style={{ animationDelay: `${i * 22}ms` }}
                onMouseEnter={() => !o.disabled && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
              >
                <OptionContent option={o} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
