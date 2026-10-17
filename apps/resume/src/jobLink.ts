// Fill in an application from a link to the posting. Greenhouse, Lever and Ashby host most tech job ads and
// publish them through public, keyless APIs. Some of those APIs refuse calls from other websites, so a failure
// here is normal and the drawer falls back to "paste the text".

export type Provider = 'greenhouse' | 'lever' | 'ashby';
export interface JobRef {
  provider: Provider;
  board: string;
  id: string;
  eu?: boolean;
}
export interface FetchedJob {
  company: string;
  role: string;
  location: string;
  posting: string;
}

export const PROVIDER_LABEL: Record<Provider, string> = { greenhouse: 'Greenhouse', lever: 'Lever', ashby: 'Ashby' };

/** Which hosted job board a link points at, or null for anything else. */
export function parseJobLink(input: string): JobRef | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  // boards.greenhouse.io/acme/jobs/123, job-boards.greenhouse.io/acme/jobs/123, job-boards.eu.greenhouse.io/…
  if (/(^|\.)greenhouse\.io$/.test(host)) {
    const at = parts.indexOf('jobs');
    const board = parts[0] === 'embed' ? url.searchParams.get('for') : at > 0 ? parts[at - 1] : null;
    const id = at >= 0 ? parts[at + 1] : url.searchParams.get('token');
    return board && id && /^\d+$/.test(id) ? { provider: 'greenhouse', board, id } : null;
  }
  // jobs.lever.co/acme/<uuid>[/apply], jobs.eu.lever.co/…
  if (host === 'jobs.lever.co' || host === 'jobs.eu.lever.co') {
    return parts.length >= 2 ? { provider: 'lever', board: parts[0], id: parts[1], eu: host.includes('.eu.') } : null;
  }
  // jobs.ashbyhq.com/acme/<uuid>[/application]
  if (host === 'jobs.ashbyhq.com') {
    return parts.length >= 2 ? { provider: 'ashby', board: parts[0], id: parts[1] } : null;
  }
  return null;
}

export function apiUrl(ref: JobRef): string {
  const b = encodeURIComponent(ref.board);
  const id = encodeURIComponent(ref.id);
  if (ref.provider === 'greenhouse') return `https://boards-api.greenhouse.io/v1/boards/${b}/jobs/${id}`;
  if (ref.provider === 'lever') return `https://api${ref.eu ? '.eu' : ''}.lever.co/v0/postings/${b}/${id}?mode=json`;
  // Ashby has no single-job endpoint: fetch the board and pick the job out of it.
  return `https://api.ashbyhq.com/posting-api/job-board/${b}`;
}

/** "acme-labs" → "Acme Labs", for when the API doesn't say the company's name. */
const nameFromBoard = (board: string) => board.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Readable text from posting HTML: block elements become line breaks, list items become bullets. */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('li').forEach((li) => li.prepend('• '));
  doc.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  doc.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, ul, ol, tr').forEach((el) => el.append('\n'));
  return (doc.body.textContent ?? '')
    .replace(/ /g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Greenhouse escapes its HTML once more inside the JSON, so it needs decoding before it can be parsed. */
const unescapeHtml = (s: string) => new DOMParser().parseFromString(s, 'text/html').documentElement.textContent ?? '';

// Third-party JSON, read defensively.
type Json = Record<string, any>;

/** The fields Folio keeps, from one provider's JSON. Throws if the job isn't in it. */
export function toJob(ref: JobRef, data: Json): FetchedJob {
  const fallback = nameFromBoard(ref.board);
  let job: FetchedJob;
  if (ref.provider === 'greenhouse') {
    job = { company: data.company_name || fallback, role: data.title ?? '', location: data.location?.name ?? '', posting: htmlToText(unescapeHtml(data.content ?? '')) };
  } else if (ref.provider === 'lever') {
    const lists = (data.lists ?? []).map((l: Json) => `${l.text}\n${htmlToText(l.content ?? '')}`).join('\n\n');
    const posting = [data.descriptionPlain, lists, data.additionalPlain].map((s) => (s ?? '').trim()).filter(Boolean).join('\n\n');
    job = { company: fallback, role: data.text ?? '', location: data.categories?.location ?? '', posting };
  } else {
    const found = (data.jobs ?? []).find((j: Json) => j.id === ref.id || String(j.jobUrl ?? '').includes(ref.id));
    if (!found) throw new Error('not-found');
    job = { company: fallback, role: found.title ?? '', location: found.location ?? '', posting: (found.descriptionPlain ?? htmlToText(found.descriptionHtml ?? '')).trim() };
  }
  if (!job.role && !job.posting) throw new Error('not-found');
  return job;
}

/** Fetch and read a posting. Rejects when the browser blocks the call, the job is gone, or the link isn't one we know. */
export async function fetchJob(link: string, fetcher: typeof fetch = fetch): Promise<FetchedJob & { provider: Provider }> {
  const ref = parseJobLink(link);
  if (!ref) throw new Error('unsupported');
  const res = await fetcher(apiUrl(ref), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(res.status === 404 ? 'not-found' : 'failed');
  return { ...toJob(ref, await res.json()), provider: ref.provider };
}
