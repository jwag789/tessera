// Folio's data: resumes and job applications, kept in localStorage. One context, plain updater functions.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type TemplateId = 'classic' | 'modern' | 'compact';
export const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Serif headings, centered header, one column.' },
  { id: 'modern', label: 'Modern', description: 'A colored sidebar for contact and skills.' },
  { id: 'compact', label: 'Compact', description: 'Tight spacing to fit more on one page.' }
];

export interface Experience {
  id: string;
  role: string;
  company: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM, empty while current
  bullets: string; // one per line
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
}

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
    { id: 'e1', role: 'Staff frontend engineer', company: 'Analytical Engines', start: '2022-03', end: '', bullets: 'Led the design system used by 40 engineers across 6 product teams\nCut median page load from 3.1s to 1.2s by moving rendering to the server\nMentored four engineers into senior roles' },
    { id: 'e2', role: 'Frontend engineer', company: 'Babbage & Co', start: '2018-06', end: '2022-02', bullets: 'Built the checkout used by 2M customers a month\nIntroduced visual regression tests that caught 120 bugs before release' }
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

const SAMPLE_APPS: Application[] = [
  { id: 'a1', company: 'Globex', role: 'Frontend lead', status: 'interview', appliedOn: '2026-10-02', resumeId: 'ada', link: 'https://globex.example/jobs/42', notes: 'Second round on the 21st with the design team.' },
  { id: 'a2', company: 'Northwind', role: 'Staff engineer', status: 'applied', appliedOn: '2026-10-09', resumeId: 'ada', link: '', notes: '' },
  { id: 'a3', company: 'Umbrella', role: 'Design engineer', status: 'offer', appliedOn: '2026-09-18', resumeId: 'ada-design', link: '', notes: 'Offer expires Oct 30.' },
  { id: 'a4', company: 'Initech', role: 'Senior frontend engineer', status: 'rejected', appliedOn: '2026-09-04', resumeId: 'ada', link: '', notes: '' },
  { id: 'a6', company: 'Massive Dynamic', role: 'Frontend engineer', status: 'applied', appliedOn: '2026-10-12', resumeId: 'ada', link: '', notes: '' },
  { id: 'a7', company: 'Stark Industries', role: 'Design systems lead', status: 'interview', appliedOn: '2026-09-29', resumeId: 'ada-design', link: '', notes: 'Portfolio review Friday.' },
  { id: 'a8', company: 'Wonka', role: 'Creative technologist', status: 'saved', appliedOn: null, resumeId: null, link: '', notes: '' },
  { id: 'a9', company: 'Cyberdyne', role: 'Senior UI engineer', status: 'applied', appliedOn: '2026-10-15', resumeId: 'ada', link: '', notes: '' },
  { id: 'a5', company: 'Hooli', role: 'UI platform engineer', status: 'saved', appliedOn: null, resumeId: null, link: 'https://hooli.example/careers', notes: 'Referral from Grace.' }
];

const KEY = 'folio:v1';
export interface Data {
  resumes: Resume[];
  applications: Application[];
}
function load(): Data {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Data;
  } catch {
    /* storage unavailable or corrupt: start from the samples */
  }
  return { resumes: [SAMPLE_RESUME, SAMPLE_RESUME_2], applications: SAMPLE_APPS };
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
  return { resumes: d.resumes, applications: d.applications };
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

interface Store extends Data {
  replaceAll: (d: Data) => void;
  saveResume: (r: Resume) => void;
  addResume: (r: Resume) => void;
  removeResume: (id: string) => void;
  saveApplication: (a: Application) => void;
  removeApplication: (id: string) => void;
}
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: changes last for this visit */
    }
  }, [data]);

  const saveResume = useCallback((r: Resume) => setData((d) => ({ ...d, resumes: d.resumes.map((x) => (x.id === r.id ? { ...r, updatedAt: now() } : x)) })), []);
  const addResume = useCallback((r: Resume) => setData((d) => ({ ...d, resumes: [r, ...d.resumes] })), []);
  const removeResume = useCallback(
    (id: string) =>
      setData((d) => ({ resumes: d.resumes.filter((x) => x.id !== id), applications: d.applications.map((a) => (a.resumeId === id ? { ...a, resumeId: null } : a)) })),
    []
  );
  const saveApplication = useCallback(
    (a: Application) =>
      setData((d) => ({ ...d, applications: d.applications.some((x) => x.id === a.id) ? d.applications.map((x) => (x.id === a.id ? a : x)) : [a, ...d.applications] })),
    []
  );
  const removeApplication = useCallback((id: string) => setData((d) => ({ ...d, applications: d.applications.filter((x) => x.id !== id) })), []);

  const replaceAll = useCallback((d: Data) => setData(d), []);
  const value = useMemo(() => ({ ...data, replaceAll, saveResume, addResume, removeResume, saveApplication, removeApplication }), [data, replaceAll, saveResume, addResume, removeResume, saveApplication, removeApplication]);
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
