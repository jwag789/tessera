import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Accordion, Breadcrumbs, Button, Checkbox, EmptyState, Icon, Progress, Select, Tabs, TagInput, TextField, Textarea, Tooltip, useToast } from '@tessera/react';
import { Paper } from '../Paper';
import { SaveStatus } from '../Account';
import { EditorMatch } from '../Tailor';
import { ScaledPaper } from '../ScaledPaper';
import { TEMPLATES, uid, useStore } from '../store';
import type { Education, Experience, Resume, TemplateId } from '../store';
import { go } from '../route';

/** A repeatable entry (a job, a school) with move and remove controls. */
function Entry({ title, index, count, onMove, onRemove, children }: { title: string; index: number; count: number; onMove: (to: number) => void; onRemove: () => void; children: ReactNode }) {
  return (
    <div className="f-entry">
      <div className="f-entry-head">
        <b>{title}</b>
        <span className="f-entry-tools">
          <Tooltip content="Move up">
            <Button size="sm" variant="ghost" aria-label={`Move ${title} up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
              <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
            </Button>
          </Tooltip>
          <Tooltip content="Move down">
            <Button size="sm" variant="ghost" aria-label={`Move ${title} down`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
              <Icon name="chevron" />
            </Button>
          </Tooltip>
          <Tooltip content="Remove">
            <Button size="sm" variant="ghost" aria-label={`Remove ${title}`} onClick={onRemove}>
              <Icon name="trash" />
            </Button>
          </Tooltip>
        </span>
      </div>
      <div className="f-form">{children}</div>
    </div>
  );
}

/** What a recruiter expects to find, in the order worth fixing. */
function completeness(r: Resume) {
  const checks: [boolean, string][] = [
    [!!r.profile.name.trim(), 'add your name'],
    [!!r.profile.email.trim() || !!r.profile.phone.trim(), 'add an email or phone number'],
    [!!r.profile.title.trim(), 'add a headline'],
    [r.profile.summary.trim().length >= 80, 'write a summary of two or three sentences'],
    [r.experience.length > 0, 'add a job'],
    [r.experience.some((e) => e.bullets.split('\n').filter((b) => b.trim()).length >= 2), 'list at least two achievements for a job'],
    [r.education.length > 0, 'add your education'],
    [r.skills.length >= 3, 'add at least three skills']
  ];
  return { done: checks.filter(([ok]) => ok).length, total: checks.length, next: checks.find(([ok]) => !ok)?.[1] };
}

function Completeness({ r }: { r: Resume }) {
  const { done, total, next } = completeness(r);
  return (
    <div className="f-complete">
      <Progress value={done} max={total} steps tone={done === total ? 'success' : 'brand'} label={done === total ? 'Ready to send' : `${Math.round((done / total) * 100)}% complete`} />
      <p className="f-meta">{next ? `Next: ${next}.` : 'Everything a recruiter looks for is here.'}</p>
    </div>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

function Form({ r, set }: { r: Resume; set: (r: Resume) => void }) {
  const p = r.profile;
  const profile = (k: keyof Resume['profile']) => ({ value: p[k], onChange: (e: { target: { value: string } }) => set({ ...r, profile: { ...p, [k]: e.target.value } }) });
  const setExp = (i: number, patch: Partial<Experience>) => set({ ...r, experience: r.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const setEdu = (i: number, patch: Partial<Education>) => set({ ...r, education: r.education.map((e, j) => (j === i ? { ...e, ...patch } : e)) });

  return (
    <Accordion
      type="multiple"
      defaultValue={['profile', 'experience']}
      items={[
        {
          id: 'profile',
          title: 'Profile',
          content: (
            <div className="f-form">
              <div className="f-row">
                <TextField label="Full name" autoComplete="name" {...profile('name')} />
                <TextField label="Headline" placeholder="e.g. Senior frontend engineer" {...profile('title')} />
              </div>
              <div className="f-row">
                <TextField label="Email" type="email" icon="mail" autoComplete="email" {...profile('email')} />
                <TextField label="Phone" type="tel" autoComplete="tel" {...profile('phone')} />
              </div>
              <div className="f-row">
                <TextField label="Location" placeholder="City, country" {...profile('location')} />
                <TextField label="Website" placeholder="yoursite.com" {...profile('website')} />
              </div>
              <Textarea label="Summary" hint="Two or three sentences. Lead with what you're best at." maxLength={400} showCount autoResize {...profile('summary')} />
            </div>
          )
        },
        {
          id: 'experience',
          title: `Experience (${r.experience.length})`,
          content: (
            <div className="f-entries">
              {r.experience.map((e, i) => (
                <Entry
                  key={e.id}
                  title={e.role || e.company || `Job ${i + 1}`}
                  index={i}
                  count={r.experience.length}
                  onMove={(to) => set({ ...r, experience: move(r.experience, i, to) })}
                  onRemove={() => set({ ...r, experience: r.experience.filter((x) => x.id !== e.id) })}
                >
                  <div className="f-row">
                    <TextField label="Role" value={e.role} onChange={(ev) => setExp(i, { role: ev.target.value })} />
                    <TextField label="Company" value={e.company} onChange={(ev) => setExp(i, { company: ev.target.value })} />
                  </div>
                  <div className="f-row">
                    <TextField label="Start" type="month" value={e.start} onChange={(ev) => setExp(i, { start: ev.target.value })} />
                    <TextField label="End" type="month" value={e.end} disabled={!e.end && !!e.start} onChange={(ev) => setExp(i, { end: ev.target.value })} />
                  </div>
                  <Checkbox label="I work here now" checked={!e.end} onChange={(ev) => setExp(i, { end: ev.target.checked ? '' : e.start })} />
                  <Textarea label="What you did" hint="One achievement per line. Start with a verb and include a number when you can." autoResize value={e.bullets} onChange={(ev) => setExp(i, { bullets: ev.target.value })} />
                </Entry>
              ))}
              <Button variant="secondary" iconLeft={<Icon name="plus" />} onClick={() => set({ ...r, experience: [...r.experience, { id: uid(), role: '', company: '', start: '', end: '', bullets: '' }] })}>
                Add a job
              </Button>
            </div>
          )
        },
        {
          id: 'education',
          title: `Education (${r.education.length})`,
          content: (
            <div className="f-entries">
              {r.education.map((e, i) => (
                <Entry
                  key={e.id}
                  title={e.degree || e.school || `School ${i + 1}`}
                  index={i}
                  count={r.education.length}
                  onMove={(to) => set({ ...r, education: move(r.education, i, to) })}
                  onRemove={() => set({ ...r, education: r.education.filter((x) => x.id !== e.id) })}
                >
                  <div className="f-row">
                    <TextField label="Degree" value={e.degree} onChange={(ev) => setEdu(i, { degree: ev.target.value })} />
                    <TextField label="School" value={e.school} onChange={(ev) => setEdu(i, { school: ev.target.value })} />
                  </div>
                  <div className="f-row">
                    <TextField label="Start" type="month" value={e.start} onChange={(ev) => setEdu(i, { start: ev.target.value })} />
                    <TextField label="End" type="month" value={e.end} onChange={(ev) => setEdu(i, { end: ev.target.value })} />
                  </div>
                </Entry>
              ))}
              <Button variant="secondary" iconLeft={<Icon name="plus" />} onClick={() => set({ ...r, education: [...r.education, { id: uid(), school: '', degree: '', start: '', end: '' }] })}>
                Add a school
              </Button>
            </div>
          )
        },
        {
          id: 'skills',
          title: `Skills (${r.skills.length})`,
          content: <TagInput label="Skills" hint="Press Enter after each one. Put the ones the job asks for first." value={r.skills} onChange={(skills) => set({ ...r, skills })} max={20} />
        }
      ]}
    />
  );
}

export function EditorPage({ id }: { id: string }) {
  const { resumes, saveResume } = useStore();
  const { toast } = useToast();
  const resume = resumes.find((r) => r.id === id);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1100px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  if (!resume) {
    return (
      <div className="f-page">
        <EmptyState
          title="That resume isn't here"
          description="It may have been deleted, or the link is from another browser. Resumes live in this browser only."
          actions={<Button onClick={() => go('/')}>Back to resumes</Button>}
        />
      </div>
    );
  }

  const exportPdf = () => {
    toast({ title: 'Choose “Save as PDF”', description: 'Your browser’s print dialog does the export.', icon: 'info' });
    setTimeout(() => window.print(), 300);
  };
  const form = (
    <div className="f-form">
      <Completeness r={resume} />
      <EditorMatch
        resume={resume}
        onAddSkill={(term) => {
          if (resume.skills.some((s) => s.toLowerCase() === term.toLowerCase())) return;
          saveResume({ ...resume, skills: [...resume.skills, term] });
          toast({ title: `Added ${term} to skills`, icon: 'success', action: { label: 'Undo', onClick: () => saveResume(resume) } });
        }}
      />
      <Form r={resume} set={saveResume} />
    </div>
  );
  const preview = (
    <div className="f-preview">
      <ScaledPaper resume={resume} />
    </div>
  );

  return (
    <div className="f-page f-editor">
      <Breadcrumbs items={[{ label: 'Resumes', href: '#/' }, { label: resume.name }]} />
      <header className="f-head f-head-editor">
        <div className="f-editor-name">
          <TextField label="Resume name" value={resume.name} onChange={(e) => saveResume({ ...resume, name: e.target.value })} />
          <SaveStatus />
        </div>
        <div className="f-editor-tools">
          <Select label="Template" className="f-template" value={resume.template} onChange={(v) => saveResume({ ...resume, template: v as TemplateId })} options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))} />
          <Button iconLeft={<Icon name="file" />} onClick={exportPdf}>
            Export PDF
          </Button>
        </div>
      </header>
      {wide ? (
        <div className="f-split">
          <div className="f-split-form">{form}</div>
          <div className="f-split-preview">{preview}</div>
        </div>
      ) : (
        <Tabs
          label="Editor view"
          items={[
            { id: 'edit', label: 'Edit', content: form },
            { id: 'preview', label: 'Preview', content: preview }
          ]}
        />
      )}
      {/* What prints: the page at full size, outside the app shell. */}
      {createPortal(
        <div className="f-print">
          <Paper resume={resume} />
        </div>,
        document.body
      )}
    </div>
  );
}
