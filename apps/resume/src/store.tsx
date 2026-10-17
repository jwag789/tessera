// Folio's data: resumes and job applications, kept in localStorage. One context, plain updater functions.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cloudEnabled, currentSession, loadAll, onSessionChange, push, signOut as cloudSignOut } from './cloud';
import type { Session } from './cloud';
import { diffData, isEmpty } from './sync';
import type { ReactNode } from 'react';

export type TemplateId = 'classic' | 'modern' | 'compact';
export const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Serif headings, centered header, one column.' },
  { id: 'modern', label: 'Modern', description: 'A colored sidebar for contact and skills.' },
  { id: 'compact', label: 'Compact', description: 'Tight spacing to fit more on one page.' }
];

/** One line under a job. Linked lines (`ref`) mirror an achievement in the bank and update with it. */
export interface Point {
  id: string;
  text: string;
  ref?: string | null;
}
export interface Experience {
  id: string;
  role: string;
  company: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM, empty while current
  points: Point[];
  /** Before points: one line per achievement. Read once on load, then dropped. */
  bullets?: string;
}
/** An achievement written once and linked into any number of resumes. */
export interface Achievement {
  id: string;
  text: string;
}
export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}
export interface Resume {
  id: string;
  name: string;
  template: TemplateId;
  updatedAt: string;
  profile: { name: string; title: string; email: string; phone: string; location: string; website: string; summary: string };
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export type Status = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
export const STATUSES: { id: Status; label: string; tone: 'neutral' | 'brand' | 'warning' | 'success' | 'danger' }[] = [
  { id: 'saved', label: 'Saved', tone: 'neutral' },
  { id: 'applied', label: 'Applied', tone: 'brand' },
  { id: 'interview', label: 'Interview', tone: 'warning' },
  { id: 'offer', label: 'Offer', tone: 'success' },
  { id: 'rejected', label: 'Rejected', tone: 'danger' }
];
export interface Application {
  id: string;
  company: string;
  role: string;
  status: Status;
  appliedOn: string | null; // YYYY-MM-DD
  resumeId: string | null;
  link: string;
  notes: string;
  /** The job posting, pasted in, for matching. */
  posting?: string;
  /** The resume tailored for this job, which may differ from the one already sent. */
  tailoredId?: string | null;
  /** A frozen copy of the resume as it was sent. Taken when the application moves past Saved. */
  snapshot?: { resume: Resume; sentAt: string } | null;
}

/** Keeps an application's snapshot in step with it: taken once it's sent, dropped if a different resume is chosen. */
export function withSnapshot(a: Application, resumes: Resume[]): Application {
  let snap = a.snapshot ?? null;
  if (snap && snap.resume.id !== a.resumeId) snap = null;
  const r = resumes.find((x) => x.id === a.resumeId);
  if (!snap && r && a.status !== 'saved') snap = { resume: structuredClone(r), sentAt: a.appliedOn ?? toIsoDay(new Date()) };
  return { ...a, snapshot: snap };
}

/** Whether a resume has been edited since a snapshot of it was taken. */
export const editedSince = (current: Resume, snap: Resume) => JSON.stringify({ ...current, updatedAt: '' }) !== JSON.stringify({ ...snap, updatedAt: '' });

export const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export function blankResume(name: string, template: TemplateId): Resume {
  return {
    id: uid(),
    name,
    template,
    updatedAt: now(),
    profile: { name: '', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    experience: [],
    education: [],
    skills: []
  };
}

const SAMPLE_BANK: Achievement[] = [
  { id: 'k1', text: 'Led the design system used by 40 engineers across 6 product teams' },
  { id: 'k2', text: 'Cut median page load from 3.1s to 1.2s by moving rendering to the server' },
  { id: 'k3', text: 'Mentored four engineers into senior roles' },
  { id: 'k4', text: 'Built the checkout used by 2M customers a month' },
  { id: 'k5', text: 'Introduced visual regression tests that caught 120 bugs before release' }
];
const linked = (...ids: string[]): Point[] => ids.map((id) => ({ id: `p-${id}`, text: SAMPLE_BANK.find((a) => a.id === id)!.text, ref: id }));

const SAMPLE_RESUME: Resume = {
  id: 'ada',
  name: 'Frontend engineer',
  template: 'modern',
  updatedAt: '2026-10-14T10:00:00.000Z',
  profile: {
    name: 'Ada Lovelace',
    title: 'Senior frontend engineer',
    email: 'ada@lovelace.dev',
    phone: '+44 20 7946 0958',
    location: 'London, UK',
    website: 'lovelace.dev',
    summary: 'Frontend engineer who turns complicated products into calm, fast interfaces. Eight years building design systems and the apps on top of them.'
  },
  experience: [
    { id: 'e1', role: 'Staff frontend engineer', company: 'Analytical Engines', start: '2022-03', end: '', points: linked('k1', 'k2', 'k3') },
    { id: 'e2', role: 'Frontend engineer', company: 'Babbage & Co', start: '2018-06', end: '2022-02', points: linked('k4', 'k5') }
  ],
  education: [{ id: 'd1', school: 'University of London', degree: 'BSc Mathematics', start: '2014-09', end: '2018-06' }],
  skills: ['TypeScript', 'React', 'Design systems', 'Accessibility', 'Performance', 'Node.js']
};

const SAMPLE_RESUME_2: Resume = {
  ...SAMPLE_RESUME,
  id: 'ada-design',
  name: 'Design engineer',
  template: 'classic',
  updatedAt: '2026-10-08T10:00:00.000Z',
  profile: { ...SAMPLE_RESUME.profile, title: 'Design engineer', summary: 'Design engineer who prototypes in code and ships the real thing. Happiest between a Figma file and a pull request.' },
  skills: ['Prototyping', 'Figma', 'React', 'CSS', 'Motion', 'Design systems']
};

const GLOBEX_POSTING = `Frontend Lead, Globex

Globex is hiring a Frontend Lead to own the web app that 3 million people use to manage their payments.

What you'll do
- Lead a team of five frontend engineers and mentor them as they grow
- Own our design system with the design team, in React and TypeScript
- Make the payments dashboard fast: you'll own web performance and Core Web Vitals
- Make accessibility part of every release (WCAG 2.2 AA)
- Work with product on the roadmap and present to stakeholders

What we're looking for
- 6+ years building production React apps with TypeScript
- Experience leading engineers and doing code reviews
- GraphQL and testing with Playwright or Cypress
- Payments or fintech experience is a plus`;

const HOOLI_POSTING = `UI Platform Engineer, Hooli

Build the platform every Hooli product team ships on: our component library, build tooling and the
patterns that keep 40 apps consistent. You'll work in TypeScript and React, own our Storybook, and
help teams adopt the platform. Experience with Vite or Webpack, monorepos and CI/CD helps. Bonus:
Kubernetes, Node.js and a habit of writing great documentation. The platform team partners with design
on the design system and with every product team on platform adoption.`;

const SAMPLE_APPS: Application[] = [
  { id: 'a1', company: 'Globex', role: 'Frontend lead', status: 'interview', appliedOn: '2026-10-02', resumeId: 'ada', link: 'https://globex.example/jobs/42', notes: 'Second round on the 21st with the design team.', posting: GLOBEX_POSTING },
  { id: 'a2', company: 'Northwind', role: 'Staff engineer', status: 'applied', appliedOn: '2026-10-09', resumeId: 'ada', link: '', notes: '' },
  { id: 'a3', company: 'Umbrella', role: 'Design engineer', status: 'offer', appliedOn: '2026-09-18', resumeId: 'ada-design', link: '', notes: 'Offer expires Oct 30.' },
  { id: 'a4', company: 'Initech', role: 'Senior frontend engineer', status: 'rejected', appliedOn: '2026-09-04', resumeId: 'ada', link: '', notes: '' },
  { id: 'a6', company: 'Massive Dynamic', role: 'Frontend engineer', status: 'applied', appliedOn: '2026-10-12', resumeId: 'ada', link: '', notes: '' },
  { id: 'a7', company: 'Stark Industries', role: 'Design systems lead', status: 'interview', appliedOn: '2026-09-29', resumeId: 'ada-design', link: '', notes: 'Portfolio review Friday.' },
  { id: 'a8', company: 'Wonka', role: 'Creative technologist', status: 'saved', appliedOn: null, resumeId: null, link: '', notes: '' },
  { id: 'a9', company: 'Cyberdyne', role: 'Senior UI engineer', status: 'applied', appliedOn: '2026-10-15', resumeId: 'ada', link: '', notes: '' },
  { id: 'a5', company: 'Hooli', role: 'UI platform engineer', status: 'saved', appliedOn: null, resumeId: null, link: 'https://hooli.example/careers', notes: 'Referral from Grace.', posting: HOOLI_POSTING }
];

const KEY = 'folio:v1';
export interface Data {
  resumes: Resume[];
  applications: Application[];
  achievements: Achievement[];
}

/** Brings data from any version up to date: bullets become points, a missing bank becomes empty. */
export function normalize(d: Partial<Data>): Data {
  const resumes = (d.resumes ?? []).map((r) => ({
    ...r,
    experience: r.experience.map(({ bullets, ...e }) => ({
      ...e,
      points: e.points ?? (bullets ?? '').split('\n').filter((b) => b.trim()).map((text, i) => ({ id: `${e.id}-${i}`, text: text.trim() }))
    }))
  }));
  return { resumes, applications: d.applications ?? [], achievements: d.achievements ?? [] };
}
function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw) as Partial<Data>);
  } catch {
    /* storage unavailable or corrupt: start from the samples */
  }
  return sampleData();
}

/** The samples, with the resume each sent application went out with. Globex got an older draft. */
function sampleData(): Data {
  const resumes = [SAMPLE_RESUME, SAMPLE_RESUME_2];
  const older: Resume = {
    ...SAMPLE_RESUME,
    profile: { ...SAMPLE_RESUME.profile, summary: 'Frontend engineer with eight years of experience building web apps and design systems.' },
    skills: ['JavaScript', 'React', 'CSS', 'Design systems']
  };
  return {
    resumes,
    achievements: SAMPLE_BANK,
    applications: SAMPLE_APPS.map((a) => (a.id === 'a1' ? { ...a, snapshot: { resume: older, sentAt: a.appliedOn! } } : withSnapshot(a, resumes)))
  };
}

/** Reads a backup file's text. Throws a readable message if it isn't one. */
export function parseBackup(text: string): Data {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file isn’t valid JSON. Choose a backup downloaded from Folio.');
  }
  const d = raw as Partial<Data> & { app?: string };
  if (d?.app !== 'folio' || !Array.isArray(d.resumes) || !Array.isArray(d.applications)) {
    throw new Error('That file isn’t a Folio backup. Choose a file named like folio-backup-2026-10-17.json.');
  }
  return normalize(d);
}

/** Saves everything as a JSON file the person keeps. */
export function downloadBackup(data: Data) {
  const blob = new Blob([JSON.stringify({ app: 'folio', version: 1, savedAt: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `folio-backup-${toIsoDay(new Date())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export type SyncState = 'local' | 'loading' | 'saving' | 'saved' | 'error';
export interface Account {
  id: string;
  email: string;
}

interface Store extends Data {
  replaceAll: (d: Data) => void;
  saveResume: (r: Resume) => void;
  addResume: (r: Resume) => void;
  removeResume: (id: string) => void;
  saveApplication: (a: Application) => void;
  removeApplication: (id: string) => void;
  /** Adds an achievement to the bank and returns it. */
  addAchievement: (text: string) => Achievement;
  /** Rewrites an achievement in the bank and in every resume line linked to it. Sent copies keep their text. */
  updateAchievement: (id: string, text: string) => void;
  /** Removes it from the bank; linked lines keep their text and stop updating. */
  removeAchievement: (id: string) => void;
  /** Signed in with a server account, or null when working locally. */
  account: Account | null;
  sync: SyncState;
  retrySync: () => void;
  signOut: () => void;
  /** This browser's local work, offered for upload on a first sign-in to an empty account. */
  uploadOffer: Data | null;
  answerUpload: (upload: boolean) => void;
}
const StoreContext = createContext<Store | null>(null);

const EMPTY: Data = { resumes: [], applications: [], achievements: [] };
const cacheKey = (uid: string) => `folio:cloud:${uid}`;
function readJson(key: string): Data | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? normalize(JSON.parse(raw) as Partial<Data>) : null;
  } catch {
    return null;
  }
}
function writeJson(key: string, d: Data) {
  try {
    localStorage.setItem(key, JSON.stringify(d));
  } catch {
    /* storage unavailable: changes last for this visit */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load);
  const [account, setAccount] = useState<Account | null>(null);
  const [sync, setSync] = useState<SyncState>('local');
  const [uploadOffer, setUploadOffer] = useState<Data | null>(null);

  // Server mode: `saved` is what the server has; `latest` is what's on screen. Saves run one at a time.
  const saved = useRef<Data | null>(null);
  const latest = useRef(data);
  latest.current = data;
  const who = useRef<Account | null>(null);
  const busy = useRef(false);
  const again = useRef(false);

  const flush = useCallback(async () => {
    const acct = who.current;
    if (!acct || !saved.current) return;
    if (busy.current) {
      again.current = true;
      return;
    }
    const target = latest.current;
    const changes = diffData(saved.current, target);
    if (isEmpty(changes)) {
      setSync('saved');
      return;
    }
    busy.current = true;
    setSync('saving');
    try {
      await push(changes, acct.id);
      if (who.current?.id === acct.id) saved.current = target;
      setSync(latest.current === target ? 'saved' : 'saving');
    } catch {
      setSync('error');
    } finally {
      busy.current = false;
      if (again.current) {
        again.current = false;
        void flush();
      }
    }
  }, []);

  useEffect(() => {
    if (!cloudEnabled) return;
    const enter = (session: Session) => {
      const acct = { id: session.user.id, email: session.user.email ?? '' };
      if (who.current?.id === acct.id) return;
      who.current = acct;
      saved.current = null;
      setAccount(acct);
      setSync('loading');
      setData(readJson(cacheKey(acct.id)) ?? EMPTY);
      loadAll()
        .then((server) => {
          if (who.current?.id !== acct.id) return;
          saved.current = server;
          setData(server);
          setSync('saved');
          const local = readJson(KEY);
          if (!server.resumes.length && !server.applications.length && !server.achievements.length && local && (local.resumes.length || local.applications.length || local.achievements.length)) setUploadOffer(local);
        })
        .catch(() => setSync('error'));
    };
    const leave = () => {
      who.current = null;
      saved.current = null;
      setAccount(null);
      setUploadOffer(null);
      setSync('local');
      setData(load());
    };
    void currentSession().then((s) => s && enter(s));
    return onSessionChange((s) => (s ? enter(s) : who.current && leave()));
  }, []);

  // Keep a local copy either way; in server mode, also save to the server shortly after edits stop.
  useEffect(() => {
    if (!account) {
      writeJson(KEY, data);
      return;
    }
    writeJson(cacheKey(account.id), data);
    if (!saved.current) return;
    const t = setTimeout(() => void flush(), 600);
    return () => clearTimeout(t);
  }, [data, account, flush]);

  // Retry when the connection comes back, and warn before closing with unsaved changes.
  useEffect(() => {
    const online = () => void flush();
    const leaving = (e: BeforeUnloadEvent) => {
      if (who.current && saved.current && !isEmpty(diffData(saved.current, latest.current))) e.preventDefault();
    };
    window.addEventListener('online', online);
    window.addEventListener('beforeunload', leaving);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('beforeunload', leaving);
    };
  }, [flush]);

  const saveResume = useCallback((r: Resume) => setData((d) => ({ ...d, resumes: d.resumes.map((x) => (x.id === r.id ? { ...r, updatedAt: now() } : x)) })), []);
  const addResume = useCallback((r: Resume) => setData((d) => ({ ...d, resumes: [r, ...d.resumes] })), []);
  const removeResume = useCallback(
    (id: string) =>
      setData((d) => ({ ...d, resumes: d.resumes.filter((x) => x.id !== id), applications: d.applications.map((a) => (a.resumeId === id ? { ...a, resumeId: null } : a)) })),
    []
  );
  const saveApplication = useCallback(
    (raw: Application) =>
      setData((d) => {
        const a = withSnapshot(raw, d.resumes);
        return { ...d, applications: d.applications.some((x) => x.id === a.id) ? d.applications.map((x) => (x.id === a.id ? a : x)) : [a, ...d.applications] };
      }),
    []
  );
  const removeApplication = useCallback((id: string) => setData((d) => ({ ...d, applications: d.applications.filter((x) => x.id !== id) })), []);
  const addAchievement = useCallback((text: string) => {
    const a = { id: uid(), text };
    setData((d) => ({ ...d, achievements: [...d.achievements, a] }));
    return a;
  }, []);
  const updateAchievement = useCallback(
    (id: string, text: string) =>
      setData((d) => ({
        ...d,
        achievements: d.achievements.map((a) => (a.id === id ? { ...a, text } : a)),
        resumes: d.resumes.map((r) =>
          r.experience.some((e) => e.points.some((p) => p.ref === id))
            ? { ...r, updatedAt: now(), experience: r.experience.map((e) => ({ ...e, points: e.points.map((p) => (p.ref === id ? { ...p, text } : p)) })) }
            : r
        )
      })),
    []
  );
  const removeAchievement = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        achievements: d.achievements.filter((a) => a.id !== id),
        resumes: d.resumes.map((r) => ({ ...r, experience: r.experience.map((e) => ({ ...e, points: e.points.map((p) => (p.ref === id ? { ...p, ref: null } : p)) })) }))
      })),
    []
  );
  const replaceAll = useCallback((d: Data) => setData(d), []);
  const retrySync = useCallback(() => void flush(), [flush]);
  const signOut = useCallback(() => void cloudSignOut(), []);
  const answerUpload = useCallback(
    (upload: boolean) => {
      if (upload && uploadOffer) setData(uploadOffer);
      setUploadOffer(null);
    },
    [uploadOffer]
  );

  const value = useMemo(
    () => ({ ...data, replaceAll, saveResume, addResume, removeResume, saveApplication, removeApplication, addAchievement, updateAchievement, removeAchievement, account, sync, retrySync, signOut, uploadOffer, answerUpload }),
    [data, replaceAll, saveResume, addResume, removeResume, saveApplication, removeApplication, addAchievement, updateAchievement, removeAchievement, account, sync, retrySync, signOut, uploadOffer, answerUpload]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore needs a StoreProvider');
  return s;
}

/** "Mar 2022", or "Present" for an empty end date. */
export function formatMonth(ym: string, fallback = '') {
  if (!ym) return fallback;
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en', { month: 'short', year: 'numeric' });
}
export function formatDay(iso: string | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}
export const toIsoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromIsoDay = (iso: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
