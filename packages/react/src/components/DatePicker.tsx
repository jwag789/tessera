import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { Placement } from '../positioning';
import { useDismiss } from '../positioning';
import { cx, useControllable } from '../utils';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';
import { Floating, focusTrigger } from './Popover';

/* ---------- date helpers (local time, day precision) ---------- */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export function addMonths(d: Date, n: number) {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}
export const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const clampDay = (d: Date, min?: Date, max?: Date) => (min && d < startOfDay(min) ? startOfDay(min) : max && d > startOfDay(max) ? startOfDay(max) : d);

/** The 6×7 grid of days shown for a month, starting on `weekStartsOn` (0 = Sunday). */
export function monthGrid(month: Date, weekStartsOn = 0): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const fmtLong = (d: Date, locale?: string) => d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

/* ---------- Calendar ---------- */

export interface CalendarProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** Days that can't be picked. */
  isDisabled?: (date: Date) => boolean;
  /** Days with something on them get a dot. Return a short description ("Interview") to have it read out. */
  isMarked?: (date: Date) => boolean | string;
  /** 0 = Sunday (default), 1 = Monday. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /** Focus the selected day (or today) on mount. */
  autoFocus?: boolean;
  /** Called on Escape. */
  onEscape?: () => void;
  className?: string;
}

/** A month grid for picking a day (WAI-ARIA date grid). */
export function Calendar({ value: valueProp, defaultValue = null, onChange, min, max, isDisabled, isMarked, weekStartsOn = 0, locale, autoFocus, onEscape, className }: CalendarProps) {
  const id = useId();
  const [value, setValue] = useControllable<Date | null>(valueProp, defaultValue);
  const today = startOfDay(new Date());
  const [focusDay, setFocusDay] = useState(() => clampDay(startOfDay(value ?? today), min, max));
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(!!autoFocus);
  const month = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1);
  const monthKey = month.getTime();
  const days = useMemo(() => monthGrid(new Date(monthKey), weekStartsOn), [monthKey, weekStartsOn]);
  const weekdays = useMemo(() => days.slice(0, 7).map((d) => ({ short: d.toLocaleDateString(locale, { weekday: 'narrow' }), long: d.toLocaleDateString(locale, { weekday: 'long' }) })), [days, locale]);
  const title = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const disabled = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max)) || !!isDisabled?.(d);

  useEffect(() => {
    if (!moved.current) return;
    // Wait a frame: inside a floating panel the grid is hidden until it has been positioned.
    const raf = requestAnimationFrame(() => {
      moved.current = false;
      grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  });

  function go(next: Date, animate = true) {
    const n = clampDay(next, min, max);
    if (animate && (n.getMonth() !== focusDay.getMonth() || n.getFullYear() !== focusDay.getFullYear())) setDir(n > focusDay ? 1 : -1);
    moved.current = true;
    setFocusDay(n);
  }

  function pick(d: Date) {
    if (disabled(d)) return;
    setValue(d);
    onChange?.(d);
    setFocusDay(d);
  }

  function onKeyDown(e: KeyboardEvent) {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      PageUp: () => addMonths(focusDay, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusDay, e.shiftKey ? 12 : 1),
      Home: () => addDays(focusDay, -((focusDay.getDay() - weekStartsOn + 7) % 7)),
      End: () => addDays(focusDay, 6 - ((focusDay.getDay() - weekStartsOn + 7) % 7))
    };
    if (map[e.key]) {
      e.preventDefault();
      go(map[e.key]());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(focusDay);
    } else if (e.key === 'Escape' && onEscape) {
      e.preventDefault();
      e.stopPropagation();
      onEscape();
    }
  }

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));
  return (
    <div className={cx('ts-cal', className)}>
      <div className="ts-cal-head">
        <button type="button" className="ts-cal-nav ts-focus" aria-label="Previous month" onClick={() => go(addMonths(focusDay, -1))} disabled={!!min && month <= new Date(min.getFullYear(), min.getMonth(), 1)}>
          <Icon name="chevron-left" />
        </button>
        <div className="ts-cal-title" id={`${id}-title`} aria-live="polite">
          {title}
        </div>
        <button type="button" className="ts-cal-nav ts-focus" aria-label="Next month" onClick={() => go(addMonths(focusDay, 1))} disabled={!!max && month >= new Date(max.getFullYear(), max.getMonth(), 1)}>
          <Icon name="chevron-right" />
        </button>
      </div>
      <div role="grid" aria-labelledby={`${id}-title`} className={cx('ts-cal-grid', dir === 1 && 'ts-cal-next', dir === -1 && 'ts-cal-prev')} key={month.getTime()} ref={grid} onKeyDown={onKeyDown}>
        <div role="row" className="ts-cal-row">
          {weekdays.map((w, i) => (
            <div role="columnheader" key={i} className="ts-cal-dow" aria-label={w.long}>
              <abbr title={w.long}>{w.short}</abbr>
            </div>
          ))}
        </div>
        {weeks.map((week, w) => (
          <div role="row" className="ts-cal-row" key={w}>
            {week.map((d) => {
              const outside = d.getMonth() !== month.getMonth();
              const sel = sameDay(d, value);
              const off = disabled(d);
              const mark = isMarked?.(d);
              const dayName = d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
              return (
                <div role="gridcell" key={d.getTime()} aria-selected={sel || undefined}>
                  <button
                    type="button"
                    className={cx('ts-day', outside && 'ts-day-out', sel && 'ts-day-selected', sameDay(d, today) && 'ts-day-today', mark && 'ts-day-marked')}
                    tabIndex={sameDay(d, focusDay) ? 0 : -1}
                    aria-label={mark ? `${dayName}, ${typeof mark === 'string' ? mark : 'has something scheduled'}` : dayName}
                    aria-current={sameDay(d, today) ? 'date' : undefined}
                    aria-disabled={off || undefined}
                    disabled={off}
                    onClick={() => {
                      setFocusDay(d);
                      pick(d);
                    }}
                  >
                    {d.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- DatePicker ---------- */

export interface DatePickerProps extends Omit<CalendarProps, 'autoFocus' | 'onEscape' | 'className'> {
  label: ReactNode;
  placeholder?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  /** Adds a hidden input with the date as YYYY-MM-DD. */
  name?: string;
  placement?: Placement;
  id?: string;
  className?: string;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A field that opens a calendar to pick one day. */
export function DatePicker({ label, placeholder = 'Pick a date', hint, error, disabled, name, placement = 'bottom-start', id: idProp, className, value: valueProp, defaultValue = null, onChange, locale, ...calendar }: DatePickerProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [value, setValue] = useControllable<Date | null>(valueProp, defaultValue);
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(open, [anchor, panel], () => setOpen(false));

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div ref={anchor} className={cx('ts-sel', open && 'ts-sel-open')}>
        <button
          type="button"
          id={id}
          className="ts-sel-trigger"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${id}-label ${id}-value`}
          {...describedBy(id, hint, error)}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <Icon name="calendar" />
          <span className={cx('ts-sel-value', !value && 'ts-sel-ph')} id={`${id}-value`}>
            {value ? fmtLong(value, locale) : placeholder}
          </span>
          <Icon name="chevron" className="ts-sel-chev" />
        </button>
        {name && <input type="hidden" name={name} value={value ? iso(value) : ''} />}
      </div>
      <Floating anchorRef={anchor} open={open} placement={placement} floatingRef={panel} className="ts-popover ts-cal-pop" role="dialog" aria-label="Choose a date">
        <Calendar
          {...calendar}
          locale={locale}
          value={value}
          autoFocus
          onEscape={() => {
            setOpen(false);
            focusTrigger(anchor.current);
          }}
          onChange={(d) => {
            setValue(d);
            onChange?.(d);
            setOpen(false);
            focusTrigger(anchor.current);
          }}
        />
      </Floating>
    </Field>
  );
}
