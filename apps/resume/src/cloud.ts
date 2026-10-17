// The server: Supabase for sign-in and storage. Without VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY the
// app runs local-only, exactly as before, so a fork or a fresh clone works with no setup.
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { TABLES } from './sync';
import type { Changes } from './sync';
import { normalize } from './store';
import type { Data } from './store';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// PKCE puts the sign-in code in the query string, which keeps it out of the hash the router uses.
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } }) : null;
export const cloudEnabled = !!supabase;

export type { Session };

export async function currentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onSessionChange(cb: (s: Session | null) => void) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

/** Emails a one-time sign-in link that returns to this page. */
export async function sendMagicLink(email: string) {
  if (!supabase) throw new Error('Sign-in isn’t set up for this copy of Folio.');
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export async function loadAll(): Promise<Data> {
  if (!supabase) throw new Error('No server');
  const [r, a, k] = await Promise.all(TABLES.map((t) => supabase!.from(t).select('data')));
  for (const res of [r, a, k]) if (res.error) throw new Error(res.error.message);
  return normalize({ resumes: r.data!.map((row) => row.data), applications: a.data!.map((row) => row.data), achievements: k.data!.map((row) => row.data) });
}

/** Writes one batch of changes. Rows carry the record whole; row-level security checks user_id. */
export async function push(c: Changes, userId: string) {
  if (!supabase) return;
  const now = new Date().toISOString();
  const ops: PromiseLike<{ error: { message: string } | null }>[] = [];
  for (const table of TABLES) {
    const { upsert, remove } = c[table];
    if (upsert.length) ops.push(supabase.from(table).upsert(upsert.map((x) => ({ user_id: userId, id: x.id, data: x, updated_at: now }))));
    if (remove.length) ops.push(supabase.from(table).delete().eq('user_id', userId).in('id', remove));
  }
  const results = await Promise.all(ops);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
