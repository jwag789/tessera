// When a job has gone quiet and deserves a follow-up, and what's coming up. Dates are YYYY-MM-DD strings,
// which compare correctly as text.
import type { Application } from './store';

export const QUIET_DAYS = 7;

export function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
export function daysBetween(from: string, to: string) {
  const [a, b] = [from, to].map((s) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  });
  return Math.round((b - a) / 86400000);
}

export interface Nudge {
  app: Application;
  reason: string;
}

/** Applied or interviewing, nothing scheduled, and quiet for a week (or past the follow-up date you set). */
export function nudgeFor(a: Application, today: string): Nudge | null {
  if (a.status !== 'applied' && a.status !== 'interview') return null;
  if (a.nextStep && a.nextStep.date >= today) return null;
  if (a.followUpOn) return a.followUpOn <= today ? { app: a, reason: 'You planned to follow up by now' } : null;
  if (!a.appliedOn) return null;
  const quiet = daysBetween(a.appliedOn, today);
  if (quiet < QUIET_DAYS) return null;
  return { app: a, reason: a.status === 'interview' ? `No news for ${quiet} days since you applied` : `Applied ${quiet} days ago, no reply yet` };
}

export const nudges = (apps: Application[], today: string) =>
  apps
    .map((a) => nudgeFor(a, today))
    .filter((n): n is Nudge => !!n)
    .sort((x, y) => (x.app.appliedOn ?? '').localeCompare(y.app.appliedOn ?? ''));

/** Next steps from today through the next `days` days, soonest first. */
export const upcoming = (apps: Application[], today: string, days = 30) =>
  apps
    .filter((a) => a.nextStep && a.nextStep.date >= today && a.nextStep.date <= addDays(today, days) && a.status !== 'rejected')
    .sort((x, y) => x.nextStep!.date.localeCompare(y.nextStep!.date));
