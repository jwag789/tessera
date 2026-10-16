import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Badge, Button, CommandPalette, Icon, SidebarNav, ToastProvider, useHotkey } from '@tessera/react';
import type { Command, SidebarItem } from '@tessera/react';
import { DEMOS } from './demos';
import type { Demo } from './demos';
import { A11yPage, BrandPage, ColorPage, ComponentPage, ElevationPage, IconsPage, MotionPage, ShowcasePage, SpacePage, StartPage, TypePage, VoicePage } from './pages';

interface Route {
  id: string;
  title: string;
  section: string;
  icon?: SidebarItem['icon'];
  page?: ComponentType;
  demo?: Demo;
}

const GROUP_ORDER = ['Actions', 'Forms', 'Navigation', 'Layout', 'Data', 'Status', 'Feedback', 'Overlays', 'Brand'];

const ROUTES: Route[] = [
  { id: 'showcase', title: 'Showcase', section: 'Overview', icon: 'sparkle', page: ShowcasePage },
  { id: 'start', title: 'Getting started', section: 'Overview', icon: 'arrow', page: StartPage },
  { id: 'brand', title: 'Brand', section: 'Overview', icon: 'home', page: BrandPage },
  { id: 'color', title: 'Color', section: 'Foundations', page: ColorPage },
  { id: 'type', title: 'Typography', section: 'Foundations', page: TypePage },
  { id: 'space', title: 'Space and shape', section: 'Foundations', page: SpacePage },
  { id: 'elevation', title: 'Elevation', section: 'Foundations', page: ElevationPage },
  { id: 'motion', title: 'Motion', section: 'Foundations', page: MotionPage },
  { id: 'voice', title: 'Voice and copy', section: 'Foundations', page: VoicePage },
  { id: 'a11y', title: 'Accessibility', section: 'Foundations', page: A11yPage },
  { id: 'icons', title: 'Iconography', section: 'Foundations', page: IconsPage },
  ...[...DEMOS]
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.name.localeCompare(b.name))
    .map((d) => ({ id: `c-${d.name}`, title: d.name, section: d.group, demo: d }))
];

const current = () => ROUTES.find((r) => r.id === location.hash.replace(/^#/, '')) ?? ROUTES[0];

type Theme = 'system' | 'light' | 'dark';
function readTheme(): Theme {
  try {
    const t = localStorage.getItem('tessera-docs-theme');
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

const Mark = () => (
  <svg viewBox="0 0 48 48" width="28" height="28" aria-hidden="true" className="d-mark">
    <rect x="4" y="4" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect x="4" y="26" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect x="26" y="26" width="18" height="18" rx="3" fill="var(--lapis)" />
    <rect className="d-odd" x="28" y="0" width="18" height="18" rx="3" fill="var(--saffron)" />
  </svg>
);

function Brand() {
  return (
    <a className="d-brand" href="#showcase" aria-label="Tessera home">
      <Mark />
      <span className="d-brand-name">Tessera</span>
      <Badge tone="brand">v0.1</Badge>
    </a>
  );
}

function Shell() {
  const [route, setRoute] = useState(current);
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      if (theme === 'system') localStorage.removeItem('tessera-docs-theme');
      else localStorage.setItem('tessera-docs-theme', theme);
    } catch {
      /* storage can be unavailable; the theme still applies for this visit */
    }
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setRoute(current());
      setDrawer(false);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.getElementById('page-title')?.focus({ preventScroll: true }));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = route.id === 'showcase' ? 'Tessera' : `${route.title} · Tessera`;
  }, [route]);

  useHotkey('mod+k', (e) => {
    e.preventDefault();
    setPalette((p) => !p);
  });
  useHotkey('/', (e) => {
    const el = document.activeElement;
    if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return;
    e.preventDefault();
    setDrawer(true);
    search.current?.focus();
  });

  const needle = query.trim().toLowerCase();
  const visible = ROUTES.filter((r) => !needle || `${r.title} ${r.section}`.toLowerCase().includes(needle));
  const sections = useMemo(() => {
    const map = new Map<string, SidebarItem[]>();
    for (const r of visible) {
      const list = map.get(r.section) ?? [];
      list.push({ label: r.title, href: `#${r.id}`, icon: r.icon, active: r.id === route.id, badge: r.demo?.isNew ? 'New' : undefined });
      map.set(r.section, list);
    }
    return [...map].map(([title, items]) => ({ title, items }));
  }, [visible, route.id]);

  const commands: Command[] = useMemo(
    () => [
      ...ROUTES.map((r) => ({
        id: r.id,
        label: r.title,
        group: r.demo ? 'Components' : r.section,
        icon: r.icon ?? (r.demo ? ('file' as const) : ('arrow' as const)),
        keywords: [r.section],
        onRun: () => (location.hash = r.id)
      })),
      { id: 'theme-dark', label: 'Use dark theme', group: 'Theme', icon: 'settings', keywords: ['mode', 'night'], onRun: () => setTheme('dark') },
      { id: 'theme-light', label: 'Use light theme', group: 'Theme', icon: 'settings', keywords: ['mode', 'day'], onRun: () => setTheme('light') },
      { id: 'theme-system', label: 'Match system theme', group: 'Theme', icon: 'settings', keywords: ['mode', 'auto'], onRun: () => setTheme('system') }
    ],
    []
  );

  const idx = ROUTES.indexOf(route);
  const prev = ROUTES[idx - 1];
  const next = ROUTES[idx + 1];
  const Page = route.page;

  return (
    <div className={'d-app' + (drawer ? ' open' : '')}>
      <div className="d-top">
        <Brand />
        <Button size="sm" variant="secondary" className="d-menu" aria-expanded={drawer} aria-controls="d-side" onClick={() => setDrawer(!drawer)}>
          {drawer ? 'Close' : 'Menu'}
        </Button>
      </div>
      <div className="d-scrim" onClick={() => setDrawer(false)} />
      <div className="d-side" id="d-side">
        <SidebarNav
          label="Documentation"
          header={
            <>
              <Brand />
              <div className="d-search">
                <Icon name="search" />
                <input
                  id="d-search"
                  ref={search}
                  type="search"
                  placeholder="Filter pages"
                  aria-label="Filter pages"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && visible[0]) {
                      location.hash = visible[0].id;
                      setQuery('');
                      e.currentTarget.blur();
                    }
                  }}
                />
                {!query && (
                  <span className="d-kbd" aria-hidden="true">
                    /
                  </span>
                )}
              </div>
              <button type="button" className="d-cmdk ts-focus" onClick={() => setPalette(true)}>
                <Icon name="sparkle" />
                Jump to anything
                <kbd className="ts-kbd">⌘K</kbd>
              </button>
            </>
          }
          sections={sections}
          footer={
            <div className="d-foot">
              <span className="d-foot-label">Theme</span>
              <div className="d-seg" role="group" aria-label="Theme">
                {(['system', 'light', 'dark'] as const).map((t) => (
                  <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        {!sections.length && <p className="d-empty">No pages match “{query}”.</p>}
      </div>
      <main className="d-main">
        <div key={route.id}>
          {Page ? <Page /> : route.demo && <ComponentPage demo={route.demo} />}
          <div className={'d-page' + (route.id === 'showcase' ? ' d-page-wide' : '')} style={{ animation: 'none' }}>
            <nav className="d-pager" aria-label="Previous and next page">
              {prev && (
                <a className="d-tilelink" href={`#${prev.id}`}>
                  <em>Previous</em>
                  <b>{prev.title}</b>
                </a>
              )}
              {next && (
                <a className="d-tilelink" href={`#${next.id}`}>
                  <em>Next</em>
                  <b>{next.title}</b>
                </a>
              )}
            </nav>
          </div>
        </div>
      </main>
      <CommandPalette open={palette} onOpenChange={setPalette} commands={commands} placeholder="Jump to a page or run a command…" />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
