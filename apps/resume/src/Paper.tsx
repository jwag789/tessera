// The resume as it prints. Paper has its own fixed palette and fonts, so the PDF looks the same in every app theme.
import type { CSSProperties } from 'react';
import type { Resume } from './store';
import { formatMonth } from './store';

const range = (start: string, end: string) => [formatMonth(start), formatMonth(end, start ? 'Present' : '')].filter(Boolean).join(' – ');
const contact = (r: Resume) => [r.profile.email, r.profile.phone, r.profile.location, r.profile.website].filter(Boolean);

function Experience({ r }: { r: Resume }) {
  if (!r.experience.length) return null;
  return (
    <section className="p-section">
      <h2>Experience</h2>
      {r.experience.map((e) => (
        <div key={e.id} className="p-item">
          <div className="p-item-head">
            <b>{e.role || 'Role'}</b>
            {e.company && <span>{e.company}</span>}
            <time>{range(e.start, e.end)}</time>
          </div>
          {e.points.some((p) => p.text.trim()) && (
            <ul>
              {e.points
                .filter((p) => p.text.trim())
                .map((p) => (
                  <li key={p.id}>{p.text}</li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

function Education({ r }: { r: Resume }) {
  if (!r.education.length) return null;
  return (
    <section className="p-section">
      <h2>Education</h2>
      {r.education.map((e) => (
        <div key={e.id} className="p-item">
          <div className="p-item-head">
            <b>{e.degree || 'Degree'}</b>
            {e.school && <span>{e.school}</span>}
            <time>{range(e.start, e.end)}</time>
          </div>
        </div>
      ))}
    </section>
  );
}

function Skills({ r }: { r: Resume }) {
  if (!r.skills.length) return null;
  return (
    <section className="p-section">
      <h2>Skills</h2>
      <ul className="p-skills">
        {r.skills.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}

export function Paper({ resume: r }: { resume: Resume }) {
  const vars = { '--p-scale': r.layout?.scale ?? 1, '--p-margin': r.layout?.margin ?? 1 } as CSSProperties;
  const head = (
    <header className="p-head">
      <h1>{r.profile.name || 'Your name'}</h1>
      {r.profile.title && <p className="p-title">{r.profile.title}</p>}
    </header>
  );
  const summary = r.profile.summary && <p className="p-summary">{r.profile.summary}</p>;
  if (r.template === 'modern') {
    return (
      <article className="paper paper-modern" aria-label="Resume preview" style={vars}>
        <aside className="p-side">
          {head}
          <ul className="p-contact">
            {contact(r).map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Skills r={r} />
          <Education r={r} />
        </aside>
        <div className="p-main">
          {summary}
          <Experience r={r} />
        </div>
      </article>
    );
  }
  return (
    <article className={`paper paper-${r.template}`} aria-label="Resume preview" style={vars}>
      {head}
      <p className="p-contact-line">{contact(r).join('  ·  ')}</p>
      {summary}
      <Experience r={r} />
      <Education r={r} />
      <Skills r={r} />
    </article>
  );
}
