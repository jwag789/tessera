// Tailoring a resume to a job (the match panel, shown in the application drawer and the editor) and the
// sent version an application keeps.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Alert, Badge, Button, Icon, Progress, Select } from '@tessera-design/react';
import { matchPosting } from './match';
import type { Match } from './match';
import { Paper } from './Paper';
import { ScaledPaper } from './ScaledPaper';
import { editedSince, formatDay, useStore } from './store';
import type { Application, Resume } from './store';

/** Covered and missing terms for one posting. `onAdd` offers each missing skill for the skills list. */
export function MatchPanel({ match, onAdd }: { match: Match; onAdd?: (term: string) => void }) {
  if (!match.total) return <p className="f-meta">Paste a job posting to see which of its skills and keywords your resume shows.</p>;
  const pct = Math.round((match.found / match.total) * 100);
  const covered = match.terms.filter((t) => t.found);
  const missing = match.terms.filter((t) => !t.found);
  return (
    <div className="f-match">
      <Progress value={match.found} max={match.total} tone={pct >= 80 ? 'success' : 'brand'} label={`Shows ${match.found} of the ${match.total} things this job asks for`} />
      {missing.length > 0 && (
        <div className="f-match-group">
          <b>Not on your resume yet</b>
          <p className="f-meta">{onAdd ? 'Add the ones you really have. Folio never adds anything for you.' : 'Mention the ones you really have, in their words. Most mentioned first.'}</p>
          <div className="f-chips">
            {missing.map((t) =>
              onAdd && t.skill ? (
                <Button key={t.term} size="sm" variant="secondary" iconLeft={<Icon name="plus" />} onClick={() => onAdd(t.term)} aria-label={`Add ${t.term} to skills`}>
                  {t.term}
                </Button>
              ) : (
                <Badge key={t.term} tone="warning">
                  {t.term}
                  {t.mentions > 1 && <span className="f-chip-count">×{t.mentions}</span>}
                </Badge>
              )
            )}
          </div>
        </div>
      )}
      {covered.length > 0 && (
        <div className="f-match-group">
          <b>Already on your resume</b>
          <div className="f-chips">
            {covered.map((t) => (
              <Badge key={t.term} tone="success" dot>
                {t.term}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** In the editor: how this resume does against the jobs it's attached to, with one-click adds. */
export function EditorMatch({ resume, onAddSkill }: { resume: Resume; onAddSkill: (term: string) => void }) {
  const { applications } = useStore();
  const jobs = applications.filter((a) => (a.resumeId === resume.id || a.tailoredId === resume.id) && a.posting?.trim());
  const [pick, setPick] = useState(jobs[0]?.id ?? '');
  const job = jobs.find((a) => a.id === pick) ?? jobs[0];
  if (!job) return null;
  return (
    <section className="f-panel" data-surface="label" aria-labelledby="tailor-head">
      <div className="f-panel-head">
        <h2 id="tailor-head">Tailoring for {job.company}</h2>
        {jobs.length > 1 && (
          <Select label="Job" className="f-panel-select" value={job.id} onChange={setPick} options={jobs.map((a) => ({ value: a.id, label: `${a.company}${a.role ? ` · ${a.role}` : ''}` }))} />
        )}
      </div>
      <MatchPanel match={matchPosting(job.posting ?? '', resume)} onAdd={onAddSkill} />
    </section>
  );
}

/** The resume as it was sent, whether it has changed since, and a way to print that exact version. */
export function SentVersion({ app, onReplace }: { app: Application; onReplace: (r: Resume) => void }) {
  const { resumes } = useStore();
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener('afterprint', done);
    const t = setTimeout(() => window.print(), 100);
    return () => {
      clearTimeout(t);
      window.removeEventListener('afterprint', done);
    };
  }, [printing]);

  const current = resumes.find((r) => r.id === app.resumeId) ?? null;
  const snap = app.snapshot;
  if (!snap) {
    return (
      <div className="f-form">
        <p className="f-dialog-text">
          When this application moves past Saved, Folio keeps a copy of the resume you sent, so weeks later you can see exactly the page {app.company || 'they'} have.
        </p>
        {current && app.status !== 'saved' && (
          <Button variant="secondary" onClick={() => onReplace(current)}>
            Keep a copy of “{current.name}” now
          </Button>
        )}
      </div>
    );
  }
  const changed = current ? editedSince(current, snap.resume) : false;
  return (
    <div className="f-form">
      <p className="f-dialog-text">
        Sent {formatDay(snap.sentAt)}, from “{snap.resume.name}”.
      </p>
      {changed && current ? (
        <Alert tone="info" title="You’ve edited this resume since">
          <span className="f-alert-body">
            This is the version {app.company || 'they'} have.
            <Button size="sm" variant="secondary" onClick={() => onReplace(current)}>
              Replace with the current version
            </Button>
          </span>
        </Alert>
      ) : (
        <Badge tone="success" dot>
          Same as the current resume
        </Badge>
      )}
      <div className="f-sent-page">
        <ScaledPaper resume={snap.resume} />
      </div>
      <Button variant="secondary" iconLeft={<Icon name="file" />} onClick={() => setPrinting(true)}>
        Print or save this version as PDF
      </Button>
      {printing &&
        createPortal(
          <div className="f-print">
            <Paper resume={snap.resume} />
          </div>,
          document.body
        )}
    </div>
  );
}
