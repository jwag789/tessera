import type { ReactNode } from 'react';
import { cx } from '../utils';

export interface TableColumn<R> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right';
  /** Custom cell. Defaults to `row[key]`. */
  render?: (row: R) => ReactNode;
}

export interface TableProps<R> {
  columns: TableColumn<R>[];
  rows: R[];
  /** Row key. Defaults to `row.id`, then the index. */
  rowKey?: (row: R, index: number) => string | number;
  /** Read by screen readers. */
  caption?: string;
  className?: string;
}

/** Rows of records with the same fields; scrolls sideways inside its own frame. */
export function Table<R extends object>({ columns, rows, rowKey, caption, className }: TableProps<R>) {
  return (
    <div className={cx('ts-table-wrap', className)}>
      <table className="ts-table">
        {caption && <caption className="ts-sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.align === 'right' ? 'ts-num' : undefined}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r, i) : ((r as { id?: string | number }).id ?? i)} style={{ animationDelay: `${i * 50}ms` }}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === 'right' ? 'ts-num' : undefined}>
                  {c.render ? c.render(r) : ((r as Record<string, ReactNode>)[c.key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
