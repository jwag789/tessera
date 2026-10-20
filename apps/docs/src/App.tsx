import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Badge, Button, CommandPalette, Icon, SegmentedControl, Select, SidebarNav, ThemeProvider, ToastProvider, useHotkey, useTheme } from '@tessera-design/react';
import { themes } from '@tessera-design/tokens';
import type { Command, SidebarItem } from '@tessera-design/react';
import { DEMOS } from './demos';
import type { Demo } from './demos';
import { FOLIO_URL, A11yPage, BrandPage, ThemesPage, ColorPage, ComponentPage, ElevationPage, IconsPage, MotionPage, ShowcasePage, SpacePage, StartPage, TypePage, VoicePage } from './pages';

interface Route {
  id: string;
  title: string;
  section: string;
  icon?: SidebarItem['icon'];
  page?: ComponentType;
  demo?: Demo;
}

const GROUP_ORDER = ['Actions', 'Forms', 'Navigation', 'Layout', 'Data', 'Status', 'Feedback', 'Overlays', 'Theming', 'Brand'];

const ROUTES: Route[] = [
  { id: 'showcase', title: 'Showcase', section: 'Overview', icon: 'sparkle', page: ShowcasePage },
  { id: 'start', title: 'Getting started', section: 'Overview', icon: 'arrow', page: StartPage },
  { id: 'brand', title: 'Brand', section: 'Overview', icon: 'home', page: BrandPage },
  { id: 'themes', title: 'Themes', section: 'Overview', icon: 'settings', page: ThemesPage },
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

const THEME_ORDER = ['tessera', 'cartridge', 'polygon', 'gloop', 'shonen', 'jelly', 'neon', 'static', 'lagoon', 'clay'];
const themeOptions = [...themes]
  .sort((a, b) => THEME_ORDER.indexOf(a.name) - THEME_ORDER.indexOf(b.name))
  .map((t) => ({ value: t.name, label: t.label, icon: <span className={`d-theme-dot d-theme-dot-${t.name}`} /> }));

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
  const { theme, setTheme, brand, setBrand } = useTheme();
  const search = useRef<HTMLInputElement>(null);

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
    // Folio isn't a docs page; it sits at the end of Overview as an outbound link.
    if (!needle || 'folio demo app resume'.includes(needle)) {
      const overview = map.get('Overview') ?? [];
      overview.push({ label: 'Folio demo app', href: FOLIO_URL, icon: 'external', badge: 'App' });
      map.set('Overview', overview);
    }
    return [...map].map(([title, items]) => ({ title, items }));
  }, [visible, route.id, needle]);

  const commands: Command[] = useMemo(
    () => [
      { id: 'folio', label: 'Open Folio, the demo app', group: 'Overview', icon: 'external', keywords: ['resume', 'job tracker', 'example', 'demo'], onRun: () => (location.href = FOLIO_URL) },
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
      { id: 'theme-system', label: 'Match system theme', group: 'Theme', icon: 'settings', keywords: ['mode', 'auto'], onRun: () => setTheme('system') },
      ...themes.map((t) => ({ id: `brand-${t.name}`, label: `Switch to the ${t.label} theme`, group: 'Theme', icon: 'sparkle' as const, keywords: ['theme', 'skin', 'look', t.name], onRun: () => setBrand(t.name) }))
    ],
    [setTheme, setBrand]
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
                <div className="d-search-box">
                  <Icon name="search" />
                  <input
                    id="d-search"
                    className="ts-input"
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
              <Select
                label="Theme"
                className="d-theme-select"
                options={themeOptions}
                value={brand}
                onChange={(v) => setBrand(v)}
              />
              <SegmentedControl
                label="Mode"
                size="sm"
                block
                options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
                value={theme}
                onChange={(v) => setTheme(v as typeof theme)}
              />
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
    <ThemeProvider storageKey="tessera-docs-theme">
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  );
}
