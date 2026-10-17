import { useEffect, useMemo, useState } from 'react';
import { Button, CommandPalette, DropdownMenu, Icon, Navbar, ThemeProvider, ToastProvider, useHotkey, useTheme } from '@tessera/react';
import type { Command, MenuItem } from '@tessera/react';
import { themes } from '@tessera/tokens';
import { StoreProvider, useStore } from './store';
import { go, useRoute } from './route';
import { ResumesPage } from './pages/Resumes';
import { EditorPage } from './pages/Editor';
import { ApplicationsPage } from './pages/Applications';
import { BackupDialog, openBackup } from './Backup';

const THEME_ORDER = ['tessera', 'cartridge', 'polygon', 'gloop'];
const ordered = [...themes].sort((a, b) => THEME_ORDER.indexOf(a.name) - THEME_ORDER.indexOf(b.name));
const MODES = [
  { id: 'system', label: 'Match system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
] as const;

const Mark = () => (
  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" className="f-mark">
    <rect x="4" y="3" width="17" height="22" rx="3" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
    <rect x="8" y="8" width="9" height="2.5" rx="1" fill="var(--lapis)" />
    <rect x="8" y="13" width="7" height="2" rx="1" fill="var(--ink-muted)" />
    <rect x="8" y="17" width="9" height="2" rx="1" fill="var(--ink-muted)" />
    <rect className="f-mark-odd" x="17" y="17" width="12" height="12" rx="3" fill="var(--saffron)" stroke="var(--ink)" strokeWidth="2" />
  </svg>
);

function Shell() {
  const route = useRoute();
  const { resumes } = useStore();
  const { theme, setTheme, brand, setBrand } = useTheme();
  const [palette, setPalette] = useState(false);
  const [backup, setBackup] = useState(false);
  useEffect(() => {
    const on = () => setBackup(true);
    window.addEventListener('folio:backup', on);
    return () => window.removeEventListener('folio:backup', on);
  }, []);
  useHotkey('mod+k', (e) => {
    e.preventDefault();
    setPalette((p) => !p);
  });

  useEffect(() => {
    const name = route.page === 'editor' ? resumes.find((r) => r.id === route.id)?.name : route.page === 'applications' ? 'Applications' : null;
    document.title = name ? `${name} · Folio` : 'Folio';
  }, [route, resumes]);
  // Move focus to the new page's heading so screen readers announce the change.
  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => document.getElementById('page-title')?.focus({ preventScroll: true }));
  }, [route.page, route.page === 'editor' ? route.id : '']);

  const themeItems: MenuItem[] = [
    { type: 'label', label: 'Theme' },
    ...ordered.map((t) => ({ label: t.label, icon: brand === t.name ? ('check' as const) : undefined, onSelect: () => setBrand(t.name) })),
    { type: 'separator' },
    { type: 'label', label: 'Mode' },
    ...MODES.map((m) => ({ label: m.label, icon: theme === m.id ? ('check' as const) : undefined, onSelect: () => setTheme(m.id) })),
    { type: 'separator' },
    { label: 'Back up or restore…', icon: 'file', onSelect: openBackup }
  ];

  const commands = useMemo<Command[]>(
    () => [
      { id: 'go-resumes', label: 'Resumes', group: 'Go to', icon: 'file', onRun: () => go('/') },
      { id: 'go-apps', label: 'Applications', group: 'Go to', icon: 'calendar', onRun: () => go('/applications') },
      ...resumes.map((r) => ({ id: `open-${r.id}`, label: `Edit ${r.name}`, group: 'Resumes', icon: 'file' as const, keywords: ['resume', 'open'], onRun: () => go(`/resume/${r.id}`) })),
      { id: 'new-resume', label: 'New resume', group: 'Create', icon: 'plus', keywords: ['create', 'add'], onRun: () => go('/new') },
      { id: 'backup', label: 'Back up or restore data', group: 'Create', icon: 'file', keywords: ['export', 'import', 'download', 'json', 'save'], onRun: openBackup },
      { id: 'new-app', label: 'Add application', group: 'Create', icon: 'plus', keywords: ['job', 'track'], onRun: () => go('/applications/new') },
      ...ordered.map((t) => ({ id: `theme-${t.name}`, label: `Use the ${t.label} theme`, group: 'Appearance', icon: 'sparkle' as const, keywords: ['theme', 'look'], onRun: () => setBrand(t.name) })),
      ...MODES.map((m) => ({ id: `mode-${m.id}`, label: m.id === 'system' ? 'Match system mode' : `Use ${m.label.toLowerCase()} mode`, group: 'Appearance', icon: 'settings' as const, keywords: ['dark', 'light', 'mode'], onRun: () => setTheme(m.id) }))
    ],
    [resumes, setBrand, setTheme]
  );

  return (
    <div className="f-shell">
      <Navbar
        sticky
        label="Main"
        brand={
          <a href="#/" aria-label="Folio home">
            <Mark />
            Folio
          </a>
        }
        links={[
          { label: 'Resumes', href: '#/', active: route.page === 'resumes' || route.page === 'editor' },
          { label: 'Applications', href: '#/applications', active: route.page === 'applications' }
        ]}
        actions={
          <>
            <Button size="sm" variant="ghost" iconLeft={<Icon name="search" />} onClick={() => setPalette(true)} aria-label="Search and commands (⌘K)">
              <span className="f-hide-sm">Search</span>
              <kbd className="ts-kbd f-hide-sm">⌘K</kbd>
            </Button>
            <DropdownMenu
              label="Appearance and data"
              trigger={
                <Button size="sm" variant="secondary" iconLeft={<Icon name="sparkle" />}>
                  {ordered.find((t) => t.name === brand)?.label ?? 'Theme'}
                </Button>
              }
              items={themeItems}
            />
          </>
        }
      />
      <main className="f-main">
        {route.page === 'resumes' && <ResumesPage creating={route.creating} />}
        {route.page === 'editor' && <EditorPage key={route.id} id={route.id} />}
        {route.page === 'applications' && <ApplicationsPage adding={route.adding} />}
      </main>
      <BackupDialog open={backup} onClose={() => setBackup(false)} />
      <CommandPalette open={palette} onOpenChange={setPalette} commands={commands} placeholder="Jump to a resume, page or command…" />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider storageKey="folio-theme">
      <ToastProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
