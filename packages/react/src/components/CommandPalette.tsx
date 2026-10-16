import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx, usePresence } from '../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export interface Command {
  id: string;
  label: string;
  group?: string;
  icon?: IconName;
  /** Shown on the right, e.g. "⌘E". Display only. */
  shortcut?: string;
  /** Extra words that should match, e.g. synonyms. */
  keywords?: string[];
  onRun: () => void;
}

/**
 * Scores how well `query` matches `text`: every query character must appear in order.
 * Consecutive runs and word starts score higher. Returns -1 for no match.
 */
export function fuzzyScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  let score = 0;
  let ti = 0;
  let run = 0;
  for (const ch of q) {
    if (ch === ' ') continue;
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    run = found === ti ? run + 1 : 1;
    score += run * 2 + (found === 0 || /[\s\-_/]/.test(t[found - 1]) ? 6 : 0) - Math.min(found - ti, 4);
    ti = found + 1;
  }
  return score + (t.startsWith(q) ? 10 : 0);
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: ReactNode;
}

/** A searchable list of everything you can do, opened with ⌘K (pair it with `useHotkey`). */
export function CommandPalette({ open, onOpenChange, commands, placeholder = 'Type a command or search…', emptyText = 'No commands match.' }: CommandPaletteProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { mounted, closing } = usePresence(open, 180);

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({ c, s: Math.max(fuzzyScore(c.label, query), ...(c.keywords ?? []).map((k) => fuzzyScore(k, query) - 4)) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }, [commands, query]);

  // Grouped for display; when searching, results are ranked and shown flat.
  const grouped = useMemo(() => {
    if (query.trim()) return [{ group: 'Results', items: results }];
    const map = new Map<string, Command[]>();
    for (const c of results) map.set(c.group ?? 'Commands', [...(map.get(c.group ?? 'Commands') ?? []), c]);
    return [...map].map(([group, items]) => ({ group, items }));
  }, [results, query]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const prev = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => input.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function run(c: Command | undefined) {
    if (!c) return;
    onOpenChange(false);
    c.onRun();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!flat.length) return;
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onOpenChange(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  }

  if (!mounted || typeof document === 'undefined') return null;
  let index = -1;
  return createPortal(
    <div className={cx('ts-overlay ts-cmd-overlay', closing && 'ts-closing')} onMouseDown={(e) => e.target === e.currentTarget && onOpenChange(false)}>
      <div className="ts-cmd" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}>
        <div className="ts-cmd-search">
          <Icon name="search" />
          <input
            ref={input}
            className="ts-cmd-input"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={flat[active] ? `${id}-c-${active}` : undefined}
            aria-autocomplete="list"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="ts-kbd">esc</kbd>
        </div>
        <div className="ts-cmd-list" id={`${id}-list`} role="listbox" ref={list} aria-label="Commands">
          {flat.length === 0 && <div className="ts-cmd-empty">{emptyText}</div>}
          {grouped.map((g) =>
            g.items.length ? (
              <Fragment key={g.group}>
                <div className="ts-menu-label" role="presentation">
                  {g.group}
                </div>
                {g.items.map((c) => {
                  index += 1;
                  const i = index;
                  return (
                    <div
                      key={c.id}
                      id={`${id}-c-${i}`}
                      data-i={i}
                      role="option"
                      aria-selected={i === active}
                      className={cx('ts-menu-item ts-cmd-item', i === active && 'ts-menu-item-active')}
                      onMouseMove={() => setActive(i)}
                      onClick={() => run(c)}
                    >
                      {c.icon ? <Icon name={c.icon} /> : <span className="ts-icon" aria-hidden="true" />}
                      <span className="ts-menu-text">{c.label}</span>
                      {c.shortcut && <kbd className="ts-kbd">{c.shortcut}</kbd>}
                      <Icon name="arrow" className="ts-cmd-go" />
                    </div>
                  );
                })}
              </Fragment>
            ) : null
          )}
        </div>
        <div className="ts-cmd-foot" aria-hidden="true">
          <span>
            <kbd className="ts-kbd">↑</kbd>
            <kbd className="ts-kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="ts-kbd">↵</kbd> run
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Calls `handler` when a shortcut is pressed anywhere on the page.
 * `combo` is like "mod+k" (mod = ⌘ on Mac, Ctrl elsewhere), "shift+/", "escape".
 */
export function useHotkey(combo: string, handler: (e: globalThis.KeyboardEvent) => void, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    const parts = combo.toLowerCase().split('+');
    const key = parts.pop();
    const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== key) return;
      const want = (m: string) => parts.includes(m);
      const mod = want('mod');
      if ((mod && !(isMac ? e.metaKey : e.ctrlKey)) || (want('shift') !== e.shiftKey) || (want('alt') !== e.altKey)) return;
      if (!mod && (want('ctrl') !== e.ctrlKey || want('meta') !== e.metaKey)) return;
      ref.current(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, enabled]);
}
