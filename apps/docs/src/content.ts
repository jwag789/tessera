import { marked } from 'marked';
import brandRaw from './content/_brand.md?raw';
import logosRaw from './content/_logos.md?raw';

marked.setOptions({ gfm: true });

// Content is authored in this repo, so rendering its Markdown as HTML is safe.
export const md = (src: string) => ({ __html: marked.parse(src, { async: false }) as string });
export const mdInline = (src: string) => ({ __html: marked.parseInline(src, { async: false }) as string });

const parts = brandRaw.split(/^## /m);
export const brandIntro = parts[0].trim();
export const brandSections: Record<string, string> = Object.fromEntries(
  parts.slice(1).map((p) => {
    const nl = p.indexOf('\n');
    return [p.slice(0, nl).trim(), p.slice(nl + 1).trim()];
  })
);

export const logosDoc = logosRaw.replace(/^# .*\n+/, '');

const files = import.meta.glob('./content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** Per component: the first paragraph (the lead) and the rest of its guidelines. */
export const componentDocs: Record<string, { lead: string; body: string }> = {};
for (const [path, raw] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.md$/, '');
  if (name.startsWith('_')) continue;
  const text = raw.replace(/^# .*\n+/, '');
  const cut = text.indexOf('\n\n');
  componentDocs[name] = cut < 0 ? { lead: text.trim(), body: '' } : { lead: text.slice(0, cut).trim(), body: text.slice(cut + 2).trim() };
}
