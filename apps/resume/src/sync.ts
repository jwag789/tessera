// What changed between the last saved snapshot and now, as rows to write and ids to delete.
// Pure, so it's tested without a server.
import type { Data } from './store';

export const TABLES = ['resumes', 'applications', 'achievements'] as const;
export type Table = (typeof TABLES)[number];
export type Changes = { [T in Table]: { upsert: Data[T]; remove: string[] } };

function diffList<T extends { id: string }>(before: T[], after: T[]) {
  const old = new Map(before.map((x) => [x.id, JSON.stringify(x)]));
  const now = new Set(after.map((x) => x.id));
  return {
    upsert: after.filter((x) => old.get(x.id) !== JSON.stringify(x)),
    remove: before.filter((x) => !now.has(x.id)).map((x) => x.id)
  };
}

export function diffData(before: Data, after: Data): Changes {
  return {
    resumes: diffList(before.resumes, after.resumes),
    applications: diffList(before.applications, after.applications),
    achievements: diffList(before.achievements, after.achievements)
  };
}

export const isEmpty = (c: Changes) => TABLES.every((t) => !c[t].upsert.length && !c[t].remove.length);
