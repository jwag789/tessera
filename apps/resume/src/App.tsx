import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, CommandPalette, DropdownMenu, Icon, Navbar, ThemeProvider, ToastProvider, useHotkey, useTheme } from '@tessera-design/react';
import type { Command, MenuItem } from '@tessera-design/react';
import { themes } from '@tessera-design/tokens';
import { StoreProvider, useStore } from './store';
import { go, useRoute } from './route';
import { ResumesPage } from './pages/Resumes';
import { EditorPage } from './pages/Editor';
import { ApplicationsPage } from './pages/Applications';
import { WELCOMED_KEY, WelcomePage } from './pages/Welcome';
import { Celebrate } from './Celebrate';
import { BackupDialog, openBackup } from './Backup';
import { AccountMenu, SignInDialog, UploadOfferDialog, openSignIn } from './Account';
import { cloudEnabled } from './cloud';
import { nudges } from './followups';
import { toIsoDay } from './store';

const THEME_ORDER = ['tessera', 'cartridge', 'polygon', 'gloop', 'shonen', 'jelly', 'neon', 'static', 'lagoon', 'clay'];

// A first visit (no saved work, never welcomed) opens on the welcome page. Read before the store saves anything.
try {
  if (!localStorage.getItem('folio:v1') && !localStorage.getItem(WELCOMED_KEY) && !location.hash.replace(/^#\/?/, '')) location.replace('#/welcome');
} catch {
  /* storage unavailable: open the app as usual */
}
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
  const { resumes, applications, account, signOut } = useStore();
  const nudgeCount = nudges(applications, toIsoDay(new Date())).length;
  const { theme, setTheme, brand, setBrand } = useTheme();
  const [palette, setPalette] = useState(false);
  const [backup, setBackup] = useState(false);
  const [signIn, setSignIn] = useState(false);
  useEffect(() => {
    const onBackup = () => setBackup(true);
    const onSignIn = () => setSignIn(true);
    window.addEventListener('folio:backup', onBackup);
    window.addEventListener('folio:sign-in', onSignIn);
    return () => {
      window.removeEventListener('folio:backup', onBackup);
      window.removeEventListener('folio:sign-in', onSignIn);
    };
  }, []);
  useHotkey('mod+k', (e) => {
    e.preventDefault();
    setPalette((p) => !p);
  });

  useEffect(() => {
    const name = route.page === 'editor' ? resumes.find((r) => r.id === route.id)?.name : route.page === 'applications' ? 'Applications' : null;
    document.title = name ? `${name} · Folio` : route.page === 'welcome' ? 'Folio: tailor your resume to every job' : 'Folio';
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
      ...(cloudEnabled
        ? [account ? { id: 'sign-out', label: `Sign out (${account.email})`, group: 'Account', icon: 'logout' as const, keywords: ['log out', 'account'], onRun: signOut } : { id: 'sign-in', label: 'Sign in to save to your account', group: 'Account', icon: 'user' as const, keywords: ['log in', 'account', 'sync'], onRun: openSignIn }]
        : []),
      { id: 'backup', label: 'Back up or restore data', group: 'Create', icon: 'file', keywords: ['export', 'import', 'download', 'json', 'save'], onRun: openBackup },
      { id: 'new-app', label: 'Add application', group: 'Create', icon: 'plus', keywords: ['job', 'track'], onRun: () => go('/applications/new') },
      ...ordered.map((t) => ({ id: `theme-${t.name}`, label: `Use the ${t.label} theme`, group: 'Appearance', icon: 'sparkle' as const, keywords: ['theme', 'look'], onRun: () => setBrand(t.name) })),
      ...MODES.map((m) => ({ id: `mode-${m.id}`, label: m.id === 'system' ? 'Match system mode' : `Use ${m.label.toLowerCase()} mode`, group: 'Appearance', icon: 'settings' as const, keywords: ['dark', 'light', 'mode'], onRun: () => setTheme(m.id) }))
    ],
    [resumes, setBrand, setTheme, account, signOut]
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
          {
            label: (
              <span className="f-navlabel">
                Applications
                {nudgeCount > 0 && (
                  <Badge tone="warning" aria-label={`${nudgeCount} need a follow-up`}>
                    {nudgeCount}
                  </Badge>
                )}
              </span>
            ),
            href: '#/applications',
            active: route.page === 'applications'
          }
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
            {cloudEnabled &&
              (account ? (
                <AccountMenu />
              ) : (
                <Button size="sm" onClick={openSignIn}>
                  Sign in
                </Button>
              ))}
          </>
        }
      />
      <main className="f-main">
        {route.page === 'resumes' && <ResumesPage creating={route.creating} />}
        {route.page === 'editor' && <EditorPage key={route.id} id={route.id} />}
        {route.page === 'applications' && <ApplicationsPage adding={route.adding} />}
        {route.page === 'welcome' && <WelcomePage />}
      </main>
      <footer className="f-footer">
        <p>
          <b>Folio is free, including PDF export.</b> No account needed, no ads, no tracking. {account ? 'Your work is saved to your account.' : 'Your work stays in this browser unless you sign in.'}
        </p>
        <a href="#/welcome">Why Folio</a>
      </footer>
      <Celebrate />
      <BackupDialog open={backup} onClose={() => setBackup(false)} />
      <SignInDialog open={signIn} onClose={() => setSignIn(false)} />
      <UploadOfferDialog />
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
