import { Fragment, useEffect, useId, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { cx } from '../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';

/* ---------- Breadcrumbs ---------- */

export interface Crumb {
  label: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** Collapse the middle into "…" past this many items. Default 4. */
  maxItems?: number;
  className?: string;
}

/** Where the current page sits in the hierarchy. The last item is the current page. */
export function Breadcrumbs({ items, maxItems = 4, className }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxItems;
  const visible: Array<Crumb | 'more'> = collapse ? [items[0], 'more', ...items.slice(items.length - (maxItems - 2))] : items;
  return (
    <nav aria-label="Breadcrumb" className={cx('ts-crumbs', className)}>
      <ol>
        {visible.map((c, i) => {
          const last = i === visible.length - 1;
          return (
            <li key={i}>
              {c === 'more' ? (
                <button type="button" className="ts-crumb-more ts-focus" aria-label="Show full path" onClick={() => setExpanded(true)}>
                  <Icon name="more" />
                </button>
              ) : last ? (
                <span className="ts-crumb-current" aria-current="page">
                  {c.label}
                </span>
              ) : (
                <a className="ts-crumb" href={c.href} onClick={c.onClick}>
                  {c.label}
                </a>
              )}
              {!last && <Icon name="chevron-right" className="ts-crumb-sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---------- Pagination ---------- */

export type PageToken = number | 'gap';

/**
 * The pages to show: always the first and last, the current page with `siblings` on each side,
 * and 'gap' where pages are skipped. A gap never hides a single page.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1): PageToken[] {
  const total = siblings * 2 + 5;
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showLeftGap = left > 3;
  const showRightGap = right < pageCount - 2;
  const span = siblings * 2 + 3;
  if (!showLeftGap) return [...Array.from({ length: span }, (_, i) => i + 1), 'gap', pageCount];
  if (!showRightGap) return [1, 'gap', ...Array.from({ length: span }, (_, i) => pageCount - span + i + 1)];
  return [1, 'gap', ...Array.from({ length: right - left + 1 }, (_, i) => left + i), 'gap', pageCount];
}

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current one. Default 1. */
  siblings?: number;
  /** Accessible name. Default "Pagination". */
  label?: string;
  className?: string;
}

/** Moves between pages of a long list. */
export function Pagination({ page, pageCount, onPageChange, siblings = 1, label = 'Pagination', className }: PaginationProps) {
  if (pageCount < 1) return null;
  const go = (p: number) => p >= 1 && p <= pageCount && p !== page && onPageChange(p);
  return (
    <nav aria-label={label} className={cx('ts-pages', className)}>
      <button type="button" className="ts-page ts-page-step ts-focus" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <Icon name="chevron-left" />
      </button>
      {paginationRange(page, pageCount, siblings).map((t, i) =>
        t === 'gap' ? (
          <span key={`g${i}`} className="ts-page-gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button key={t} type="button" className={cx('ts-page ts-focus', t === page && 'ts-page-current')} aria-current={t === page ? 'page' : undefined} aria-label={`Page ${t}`} onClick={() => go(t)}>
            {t}
          </button>
        )
      )}
      <button type="button" className="ts-page ts-page-step ts-focus" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Next page">
        <Icon name="chevron-right" />
      </button>
    </nav>
  );
}

/* ---------- Navbar ---------- */

export interface NavLink {
  label: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export interface NavbarProps {
  /** Logo and name, usually a link home. */
  brand: ReactNode;
  links?: NavLink[];
  /** Right side: buttons, an avatar menu. */
  actions?: ReactNode;
  /** Stick to the top of the scroll container. */
  sticky?: boolean;
  /** Accessible name. Default "Main". */
  label?: string;
  className?: string;
}

/** The top bar: brand, primary links and actions. Links fold into a menu below 768px. */
export function Navbar({ brand, links = [], actions, sticky, label = 'Main', className }: NavbarProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const renderLinks = (cls: string) =>
    links.map((l, i) => (
      <a
        key={i}
        className={cls}
        href={l.href}
        aria-current={l.active ? 'page' : undefined}
        onClick={(e) => {
          l.onClick?.(e);
          setOpen(false);
        }}
      >
        {l.label}
      </a>
    ));
  return (
    <header className={cx('ts-navbar', sticky && 'ts-navbar-sticky', open && 'ts-navbar-open', links.length > 0 && 'ts-navbar-has-links', className)}>
      <div className="ts-navbar-row">
        <div className="ts-navbar-brand">{brand}</div>
        {links.length > 0 && (
          <nav aria-label={label} className="ts-navbar-links">
            {renderLinks('ts-navlink')}
          </nav>
        )}
        <div className="ts-navbar-actions">{actions}</div>
        {links.length > 0 && (
          <button type="button" className="ts-navbar-toggle ts-focus" aria-expanded={open} aria-controls={`${id}-sheet`} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        )}
      </div>
      {links.length > 0 && (
        <div id={`${id}-sheet`} className="ts-navbar-sheet" hidden={!open}>
          <nav aria-label={`${label} (mobile)`} className="ts-navbar-sheet-links">
            {renderLinks('ts-sheetlink')}
          </nav>
          {actions && <div className="ts-navbar-sheet-actions">{actions}</div>}
        </div>
      )}
    </header>
  );
}

/* ---------- SidebarNav ---------- */

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: IconName;
  badge?: ReactNode;
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /** Nested items; the parent becomes a toggle. */
  items?: SidebarItem[];
}

export interface SidebarNavProps {
  sections: Array<{ title?: string; items: SidebarItem[] }>;
  /** Icons only; labels become tooltips. */
  collapsed?: boolean;
  /** Accessible name. Default "Sidebar". */
  label?: string;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function containsActive(it: SidebarItem): boolean {
  return !!it.active || !!it.items?.some(containsActive);
}

function SidebarEntry({ item, depth, collapsed }: { item: SidebarItem; depth: number; collapsed?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(() => containsActive(item));
  const inner = (
    <>
      {item.icon ? <Icon name={item.icon} /> : depth === 0 && <span className="ts-icon" aria-hidden="true" />}
      <span className="ts-side-label">{item.label}</span>
      {item.badge != null && <span className="ts-side-badge">{item.badge}</span>}
    </>
  );
  if (item.items?.length) {
    return (
      <li>
        <button type="button" className={cx('ts-side-link', containsActive(item) && 'ts-side-within')} aria-expanded={open} aria-controls={`${id}-sub`} onClick={() => setOpen(!open)} title={collapsed ? item.label : undefined}>
          {inner}
          <Icon name="chevron" className="ts-side-chev" />
        </button>
        <ul id={`${id}-sub`} className="ts-side-sub" hidden={!open}>
          {item.items.map((c, i) => (
            <SidebarEntry key={i} item={c} depth={depth + 1} collapsed={collapsed} />
          ))}
        </ul>
      </li>
    );
  }
  return (
    <li>
      <a className="ts-side-link" href={item.href} aria-current={item.active ? 'page' : undefined} onClick={item.onClick} title={collapsed ? item.label : undefined}>
        {inner}
      </a>
    </li>
  );
}

/** Vertical navigation for apps and docs: grouped sections, nested items, an optional icon-only mode. */
export function SidebarNav({ sections, collapsed, label = 'Sidebar', header, footer, className }: SidebarNavProps) {
  return (
    <nav aria-label={label} className={cx('ts-sidebar', collapsed && 'ts-sidebar-collapsed', className)}>
      {header && <div className="ts-sidebar-head">{header}</div>}
      <div className="ts-sidebar-body">
        {sections.map((s, i) => (
          <Fragment key={i}>
            {s.title && <div className="ts-side-title">{s.title}</div>}
            <ul className="ts-side-list">
              {s.items.map((it, j) => (
                <SidebarEntry key={j} item={it} depth={0} collapsed={collapsed} />
              ))}
            </ul>
          </Fragment>
        ))}
      </div>
      {footer && <div className="ts-sidebar-foot">{footer}</div>}
    </nav>
  );
}
