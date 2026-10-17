import { useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { cx, useControllable } from '../utils';

export interface TableColumn<R> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right';
  /** Custom cell. Defaults to `row[key]`. */
  render?: (row: R) => ReactNode;
  /** Let people sort by this column. */
  sortable?: boolean;
  /** Value to sort by. Defaults to `row[key]`. */
  sortValue?: (row: R) => string | number | Date | null | undefined;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableProps<R> {
  columns: TableColumn<R>[];
  rows: R[];
  /** Row key. Defaults to `row.id`, then the index. Needed for selection. */
  rowKey?: (row: R, index: number) => string | number;
  /** Read by screen readers. */
  caption?: string;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Sort `rows` here (default). Turn off when the server sorts and `rows` arrive in order. */
  sortRows?: boolean;
  /** Adds a checkbox column. */
  selectable?: boolean;
  /** Names a row for its checkbox, e.g. (r) => r.company. Default "row N". */
  rowLabel?: (row: R) => string;
  selected?: Array<string | number>;
  defaultSelected?: Array<string | number>;
  onSelectionChange?: (keys: Array<string | number>) => void;
  /** Keep the header visible while the body scrolls; set a `maxHeight` for the scroll area. */
  stickyHeader?: boolean;
  maxHeight?: number | string;
  /** Shown when there are no rows. */
  empty?: ReactNode;
  className?: string;
}

/** Compares two sort values: numbers and dates numerically, strings with locale-aware natural order, empties last. */
export function compareValues(a: unknown, b: unknown): number {
  const empty = (v: unknown) => v === null || v === undefined || v === '';
  if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Rows of records with the same fields: sortable columns, row selection, a sticky header. */
export function Table<R extends object>({
  columns,
  rows,
  rowKey,
  caption,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  sortRows = true,
  selectable,
  rowLabel,
  selected: selectedProp,
  defaultSelected = [],
  onSelectionChange,
  stickyHeader,
  maxHeight,
  empty,
  className
}: TableProps<R>) {
  const [sort, setSort] = useControllable<SortState | null>(sortProp, defaultSort, onSortChange);
  const [selected, setSelected] = useControllable(selectedProp, defaultSelected, onSelectionChange);
  const keyOf = (r: R, i: number) => (rowKey ? rowKey(r, i) : ((r as { id?: string | number }).id ?? i));

  const shown = useMemo(() => {
    if (!sort || !sortRows) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue ?? ((r: R) => (r as Record<string, unknown>)[col.key] as string | number);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return rows
      .map((r, i) => ({ r, i }))
      .sort((a, b) => {
        const va = get(a.r);
        const vb = get(b.r);
        const isEmpty = (v: unknown) => v === null || v === undefined || v === '';
        if (isEmpty(va) || isEmpty(vb)) return compareValues(va, vb); // empties stay last either way
        return compareValues(va, vb) * dir || a.i - b.i;
      })
      .map((x) => x.r);
  }, [rows, columns, sort, sortRows]);

  const allKeys = shown.map((r) => keyOf(r, rows.indexOf(r)));
  const selectedSet = new Set(selected);
  const allOn = allKeys.length > 0 && allKeys.every((k) => selectedSet.has(k));
  const someOn = !allOn && allKeys.some((k) => selectedSet.has(k));
  const headerBox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOn;
  }, [someOn]);

  function cycleSort(key: string) {
    if (!sort || sort.key !== key) setSort({ key, direction: 'asc' });
    else if (sort.direction === 'asc') setSort({ key, direction: 'desc' });
    else setSort(null);
  }

  function toggleRow(k: string | number) {
    setSelected(selectedSet.has(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  }

  return (
    <div className={cx('ts-table-wrap', stickyHeader && 'ts-table-sticky', className)} style={maxHeight !== undefined ? { maxHeight, overflowY: 'auto' } : undefined}>
      <table className="ts-table">
        {caption && <caption className="ts-sr-only">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="ts-table-check">
                <label className="ts-check">
                  <input ref={headerBox} type="checkbox" checked={allOn} aria-label={allOn ? 'Deselect all rows' : 'Select all rows'} onChange={() => setSelected(allOn ? selected.filter((k) => !allKeys.includes(k)) : [...new Set([...selected, ...allKeys])])} />
                  <span className="ts-check-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={someOn ? 'M6 12h12' : 'M5 12.5l4.5 4.5L19 7.5'} />
                    </svg>
                  </span>
                </label>
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th key={c.key} scope="col" className={cx(c.align === 'right' && 'ts-num')} aria-sort={c.sortable ? (active ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}>
                  {c.sortable ? (
                    <button type="button" className={cx('ts-sort', active && 'ts-sort-on')} onClick={() => cycleSort(c.key)}>
                      {c.header}
                      <svg className="ts-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-dir={active ? sort!.direction : undefined}>
                        <path className="ts-sort-up" d="M8 10l4-4 4 4" />
                        <path className="ts-sort-down" d="M8 14l4 4 4-4" />
                      </svg>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {shown.length === 0 && empty && (
            <tr className="ts-table-empty">
              <td colSpan={columns.length + (selectable ? 1 : 0)}>{empty}</td>
            </tr>
          )}
          {shown.map((r, i) => {
            const k = keyOf(r, rows.indexOf(r));
            const on = selectedSet.has(k);
            return (
              <tr key={k} className={on ? 'ts-row-selected' : undefined} style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
                {selectable && (
                  <td className="ts-table-check">
                    <label className="ts-check">
                      <input type="checkbox" checked={on} aria-label={`Select ${rowLabel ? rowLabel(r) : `row ${i + 1}`}`} onChange={() => toggleRow(k)} />
                      <span className="ts-check-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                    </label>
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'ts-num' : undefined}>
                    {c.render ? c.render(r) : ((r as Record<string, ReactNode>)[c.key] ?? null)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
