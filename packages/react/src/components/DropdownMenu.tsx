import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import type { Placement } from '../positioning';
import { useDismiss } from '../positioning';
import { cx } from '../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Floating, focusTrigger } from './Popover';

export type MenuItem =
  | {
      type?: 'item';
      label: string;
      icon?: IconName;
      /** Shown on the right, e.g. "⌘D". Display only. */
      shortcut?: string;
      /** Destructive: drawn in danger. */
      danger?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: 'separator' }
  | { type: 'label'; label: string };

export interface DropdownMenuProps {
  /** The element that opens the menu, usually a Button. */
  trigger: ReactElement;
  items: MenuItem[];
  placement?: Placement;
  /** Accessible name for the menu when the trigger's text isn't enough. */
  label?: string;
  className?: string;
}

type ActionItem = Extract<MenuItem, { label: string }> & { type?: 'item' };
const isAction = (i: MenuItem): i is ActionItem => i.type === undefined || i.type === 'item';

/** A list of actions that opens from a button (WAI-ARIA menu button). */
export function DropdownMenu({ trigger, items, placement = 'bottom-start', label, className }: DropdownMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typed = useRef({ s: '', t: 0 });

  const actionable = items.map((it, i) => (isAction(it) && !it.disabled ? i : -1)).filter((i) => i >= 0);

  useDismiss(open, [anchorRef, menuRef], () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => menuRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  function openWith(which: 'first' | 'last' | 'none') {
    setActive(which === 'first' ? (actionable[0] ?? -1) : which === 'last' ? (actionable[actionable.length - 1] ?? -1) : -1);
    setOpen(true);
  }

  function close(refocus = true) {
    setOpen(false);
    if (refocus) focusTrigger(anchorRef.current);
  }

  function select(i: number) {
    const it = items[i];
    if (!it || !isAction(it) || it.disabled) return;
    close();
    it.onSelect?.();
  }

  function step(dir: 1 | -1) {
    if (!actionable.length) return;
    const pos = actionable.indexOf(active);
    const next = pos < 0 ? (dir === 1 ? 0 : actionable.length - 1) : (pos + dir + actionable.length) % actionable.length;
    setActive(actionable[next]);
  }

  function onMenuKey(e: KeyboardEvent) {
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      step(k === 'ArrowDown' ? 1 : -1);
    } else if (k === 'Home' || k === 'End') {
      e.preventDefault();
      setActive(k === 'Home' ? actionable[0] : actionable[actionable.length - 1]);
    } else if (k === 'Enter' || k === ' ') {
      e.preventDefault();
      if (active >= 0) select(active);
    } else if (k === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (k === 'Tab') {
      close(false);
    } else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      const t = typed.current;
      t.s = (now - t.t > 600 ? '' : t.s) + k.toLowerCase();
      t.t = now;
      const start = Math.max(0, actionable.indexOf(active)) + (t.s.length === 1 ? 1 : 0);
      for (let n = 0; n < actionable.length; n++) {
        const i = actionable[(start + n) % actionable.length];
        if ((items[i] as ActionItem).label.toLowerCase().startsWith(t.s)) {
          setActive(i);
          break;
        }
      }
    }
  }

  const p = isValidElement(trigger) ? (trigger.props as Record<string, unknown>) : {};
  const triggerEl = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        id: `${id}-trigger`,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? `${id}-menu` : undefined,
        onClick: (e: MouseEvent) => {
          (p.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
          if (open) close(false);
          else openWith(e.detail === 0 ? 'first' : 'none');
        },
        onKeyDown: (e: KeyboardEvent) => {
          (p.onKeyDown as ((e: KeyboardEvent) => void) | undefined)?.(e);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            openWith(e.key === 'ArrowDown' ? 'first' : 'last');
          }
        }
      })
    : trigger;

  return (
    <>
      <span ref={anchorRef} className="ts-anchor">
        {triggerEl}
      </span>
      <Floating
        anchorRef={anchorRef}
        open={open}
        placement={placement}
        floatingRef={menuRef}
        className={cx('ts-menu', className)}
        id={`${id}-menu`}
        role="menu"
        tabIndex={-1}
        aria-label={label}
        aria-labelledby={label ? undefined : `${id}-trigger`}
        aria-activedescendant={active >= 0 ? `${id}-item-${active}` : undefined}
        onKeyDown={onMenuKey}
      >
        {items.map((it, i) => {
          if (it.type === 'separator') return <div key={i} className="ts-menu-sep" role="separator" />;
          if (it.type === 'label')
            return (
              <div key={i} className="ts-menu-label" role="presentation">
                {it.label}
              </div>
            );
          return (
            <div
              key={i}
              id={`${id}-item-${i}`}
              role="menuitem"
              aria-disabled={it.disabled || undefined}
              className={cx('ts-menu-item', i === active && 'ts-menu-item-active', it.danger && 'ts-menu-item-danger', it.disabled && 'ts-menu-item-disabled')}
              style={{ animationDelay: `${i * 18}ms` }}
              onMouseEnter={() => !it.disabled && setActive(i)}
              onMouseLeave={() => setActive(-1)}
              onClick={() => select(i)}
            >
              {it.icon ? <Icon name={it.icon} /> : <span className="ts-icon" aria-hidden="true" />}
              <span className="ts-menu-text">{it.label}</span>
              {it.shortcut && <kbd className="ts-kbd">{it.shortcut}</kbd>}
            </div>
          );
        })}
      </Floating>
    </>
  );
}

