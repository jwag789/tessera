import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx, useControllable } from '../utils';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';
import { OptionContent, normalizeOptions } from './Select';
import type { OptionInput, SelectOption } from './Select';

export interface ComboboxProps {
  label: ReactNode;
  options: OptionInput[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, option: SelectOption | null) => void;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** Custom matcher. Default: case-insensitive match on label and description text. */
  filter?: (option: SelectOption, query: string) => boolean;
}

const defaultFilter = (o: SelectOption, q: string) => {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = `${o.label} ${typeof o.description === 'string' ? o.description : ''} ${o.value}`.toLowerCase();
  return hay.includes(needle);
};

/** Wraps the first match of `query` in `label` with <mark>. */
export function highlight(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return label;
  return (
    <>
      {label.slice(0, i)}
      <mark className="ts-mark">{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
}

/** A text input that filters a list as you type (WAI-ARIA combobox with list autocomplete). */
export function Combobox({ label, options, value: valueProp, defaultValue = null, onChange, placeholder, emptyText = 'No matches', hint, error, disabled, name, id: idProp, className, filter = defaultFilter }: ComboboxProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const listId = `${id}-list`;
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue);
  const selected = opts.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? '');
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const shown = typing ? opts.filter((o) => filter(o, query)) : opts;

  useEffect(() => {
    if (!typing) setQuery(selected?.label ?? '');
  }, [selected?.label, typing]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) commitClose();
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  });

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    const l = list.current;
    if (!el || !l) return;
    if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 6;
    else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 6;
  }, [active]);

  function commitClose() {
    setOpen(false);
    setTyping(false);
    setActive(-1);
  }

  function choose(o: SelectOption) {
    if (o.disabled) return;
    setValue(o.value);
    onChange?.(o.value, o);
    setQuery(o.label);
    commitClose();
    input.current?.focus();
  }

  function firstEnabled(list: SelectOption[], from: number, dir: 1 | -1) {
    for (let k = 0; k < list.length; k++) {
      const j = (((from + dir * k) % list.length) + list.length) % list.length;
      if (!list[j].disabled) return j;
    }
    return -1;
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      if (!open) {
        setOpen(true);
        const sel = shown.findIndex((o) => o.value === value);
        setActive(sel >= 0 ? sel : firstEnabled(shown, dir === 1 ? 0 : shown.length - 1, dir));
        return;
      }
      if (shown.length) setActive(firstEnabled(shown, active < 0 ? (dir === 1 ? 0 : shown.length - 1) : active + dir, dir));
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && shown[active]) {
        e.preventDefault();
        choose(shown[active]);
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        commitClose();
      } else if (query) {
        setQuery('');
        setValue(null);
        onChange?.(null, null);
      }
    } else if (e.key === 'Tab') {
      if (open) commitClose();
    }
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={cx('ts-combo', open && 'ts-sel-open')} ref={root}>
        <div className="ts-control">
          <Icon name="search" />
          <input
            ref={input}
            id={id}
            className="ts-input"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
            autoComplete="off"
            placeholder={placeholder}
            disabled={disabled}
            value={query}
            {...describedBy(id, hint, error)}
            onChange={(e) => {
              setQuery(e.target.value);
              setTyping(true);
              setOpen(true);
              setActive(e.target.value ? 0 : -1);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {query && !disabled && (
            <button
              type="button"
              className="ts-combo-clear ts-focus"
              aria-label="Clear"
              onClick={() => {
                setQuery('');
                setTyping(true);
                setValue(null);
                onChange?.(null, null);
                input.current?.focus();
              }}
            >
              <Icon name="x" />
            </button>
          )}
        </div>
        {name && <input type="hidden" name={name} value={value ?? ''} />}
        {open && (
          <ul ref={list} id={listId} role="listbox" aria-labelledby={`${id}-label`} className="ts-sel-list ts-sel-down">
            {shown.length === 0 && (
              <li className="ts-combo-empty" role="presentation">
                {emptyText}
              </li>
            )}
            {shown.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-opt-${i}`}
                data-i={i}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                className={cx('ts-opt', i === active && 'ts-opt-active', o.value === value && 'ts-opt-selected', o.disabled && 'ts-opt-disabled')}
                style={{ animationDelay: `${Math.min(i, 8) * 18}ms` }}
                onMouseEnter={() => !o.disabled && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <OptionContent option={o} label={highlight(o.label, typing ? query : '')} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
