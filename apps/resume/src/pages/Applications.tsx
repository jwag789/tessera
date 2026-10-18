import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Badge, Button, Combobox, DatePicker, Drawer, EmptyState, Icon, Popover, Select, Stepper, Table, Tabs, TextField, Textarea, useToast } from '@tessera-design/react';
import type { TableColumn } from '@tessera-design/react';
import { STATUSES, formatDay, fromIsoDay, toIsoDay, uid, useStore } from '../store';
import type { Application, Status } from '../store';
import { go } from '../route';
import { MatchPanel, SentVersion } from '../Tailor';
import { FollowUps } from '../FollowUpsPanel';
import { matchPosting, tailor } from '../match';
import { PROVIDER_LABEL, fetchJob, parseJobLink } from '../jobLink';

const blank = (): Application => ({ id: uid(), company: '', role: '', status: 'saved', appliedOn: null, resumeId: null, link: '', notes: '' });
const statusOf = (s: Status) => STATUSES.find((x) => x.id === s)!;
// The path a job moves along. Rejected can happen at any point, so it isn't a step.
const PIPELINE: Status[] = ['saved', 'applied', 'interview', 'offer'];

function Pipeline({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  if (status === 'rejected') {
    return (
      <div className="f-pipeline f-pipeline-closed">
        <Badge tone="danger" dot>
          Rejected
        </Badge>
        <Button size="sm" variant="ghost" onClick={() => onChange('applied')}>
          Reopen as applied
        </Button>
      </div>
    );
  }
  const at = PIPELINE.indexOf(status);
  const next = PIPELINE[at + 1];
  return (
    <div className="f-pipeline">
      <Stepper label="Application stage" current={at} onStepClick={(i) => onChange(PIPELINE[i])} steps={PIPELINE.map((s) => ({ id: s, label: statusOf(s).label }))} />
      <div className="f-pipeline-actions">
        {next && (
          <Button size="sm" iconRight={<Icon name="arrow" />} onClick={() => onChange(next)}>
            Move to {statusOf(next).label.toLowerCase()}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onChange('rejected')}>
          Mark rejected
        </Button>
      </div>
    </div>
  );
}

/** The status badge doubles as a quick switcher, so the table doesn't need the drawer for the common change. */
function StatusCell({ app }: { app: Application }) {
  const { saveApplication } = useStore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const s = statusOf(app.status);
  const change = (status: Status) => {
    setOpen(false);
    if (status === app.status) return;
    saveApplication({ ...app, status, appliedOn: status === 'applied' && !app.appliedOn ? toIsoDay(new Date()) : app.appliedOn });
    toast({ title: `${app.company}: ${statusOf(status).label}`, icon: 'success', action: { label: 'Undo', onClick: () => saveApplication(app) } });
  };
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title={`Status for ${app.company}`}
      placement="bottom-start"
      trigger={
        <button type="button" className="f-status ts-focus" aria-label={`Status: ${s.label}. Change status for ${app.company}`}>
          <Badge tone={s.tone} dot>
            {s.label}
          </Badge>
          <Icon name="chevron" />
        </button>
      }
    >
      <div className="f-status-list" role="group" aria-label="Choose a status">
        {STATUSES.map((x) => (
          <button key={x.id} type="button" className="f-status-opt ts-focus" aria-pressed={x.id === app.status} onClick={() => change(x.id)}>
            <Badge tone={x.tone} dot>
              {x.label}
            </Badge>
            {x.id === app.status && <Icon name="check" />}
          </button>
        ))}
      </div>
    </Popover>
  );
}

function ApplicationDrawer({ app, isNew, onClose }: { app: Application | null; isNew: boolean; onClose: () => void }) {
  const { resumes, applications, saveApplication, removeApplication, addResume } = useStore();
  const { toast } = useToast();
  // Names already used, so a second job at the same company is spelled the same way.
  const unique = (xs: string[]) => [...new Set(xs.map((x) => x.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const companies = useMemo(() => unique(applications.map((a) => a.company)), [applications]);
  const roles = useMemo(() => unique(applications.map((a) => a.role)), [applications]);
  const [draft, setDraft] = useState<Application>(app ?? blank());
  const [tried, setTried] = useState(false);
  const [tab, setTab] = useState('details');
  useEffect(() => {
    setDraft(app ?? blank());
    setTried(false);
    setTab('details');
  }, [app]);
  const set = (patch: Partial<Application>) => setDraft((d) => ({ ...d, ...patch }));
  const missing = !draft.company.trim();

  // Fill in from a link to the posting. Only empty fields are filled, so nothing typed is lost.
  const [filling, setFilling] = useState<'idle' | 'loading' | 'failed'>('idle');
  useEffect(() => setFilling('idle'), [app, draft.link]);
  const linkRef = parseJobLink(draft.link);
  const fillFromLink = async () => {
    setFilling('loading');
    try {
      const job = await fetchJob(draft.link);
      setDraft((d) => ({
        ...d,
        company: d.company.trim() ? d.company : job.company,
        role: d.role.trim() ? d.role : job.role,
        posting: d.posting?.trim() ? d.posting : job.posting,
        notes: d.notes.trim() || !job.location ? d.notes : `Location: ${job.location}`
      }));
      setFilling('idle');
      toast({ title: 'Filled in from the posting', description: [job.role, job.company].filter(Boolean).join(' at '), icon: 'success' });
    } catch {
      setFilling('failed');
    }
  };

  const save = () => {
    setTried(true);
    if (missing) return;
    saveApplication({ ...draft, company: draft.company.trim(), role: draft.role.trim(), nextStep: draft.nextStep?.date ? draft.nextStep : null });
    toast({ title: isNew ? 'Application added' : 'Application saved', description: draft.company, icon: 'success' });
    onClose();
  };
  const resume = resumes.find((r) => r.id === draft.resumeId) ?? null;
  const match = useMemo(() => matchPosting(draft.posting ?? '', resume), [draft.posting, resume]);
  /** A copy of the chosen resume for this job, attached to it if it hasn't been sent yet, opened in the editor. */
  const tailorCopy = () => {
    setTried(true);
    if (missing || !resume) return;
    const company = draft.company.trim();
    const copy = tailor(resume, match, `${resume.name} · ${company}`, uid());
    addResume(copy);
    const sent = draft.status !== 'saved';
    saveApplication({ ...draft, company, role: draft.role.trim(), resumeId: sent ? draft.resumeId : copy.id, tailoredId: copy.id });
    toast({ title: 'Tailored copy created', description: sent ? `${copy.name}. The sent version stays attached.` : copy.name, icon: 'success' });
    onClose();
    go(`/resume/${copy.id}`);
  };

  const remove = () => {
    const gone = draft;
    removeApplication(gone.id);
    onClose();
    toast({ title: 'Application deleted', description: gone.company, icon: 'trash', action: { label: 'Undo', onClick: () => saveApplication(gone) } });
  };

  return (
    <Drawer
      open={!!app}
      onClose={onClose}
      title={isNew ? 'Add application' : draft.company || 'Application'}
      description={isNew ? 'Track a job from saved to offer.' : draft.role}
      footer={
        <>
          {!isNew && (
            <Button variant="ghost" iconLeft={<Icon name="trash" />} onClick={remove} style={{ marginRight: 'auto' }}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>{isNew ? 'Add application' : 'Save'}</Button>
        </>
      }
    >
      <Tabs
        label="Application"
        value={tab}
        onChange={setTab}
        items={[
          {
            id: 'details',
            label: 'Details',
            content: (
          <form
            className="f-form"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="f-link-fill">
              <TextField
                label="Link to the posting"
                type="url"
                icon="external"
                placeholder="https://"
                hint={draft.link ? undefined : 'Paste a Greenhouse, Lever or Ashby link to fill in the rest.'}
                value={draft.link}
                onChange={(e) => set({ link: e.target.value })}
              />
              {linkRef && (
                <Button variant="secondary" iconLeft={<Icon name="sparkle" />} loading={filling === 'loading'} onClick={fillFromLink}>
                  Fill in from {PROVIDER_LABEL[linkRef.provider]}
                </Button>
              )}
            </div>
            {filling === 'failed' && (
              <Alert tone="warning" title="Couldn’t read that posting from here">
                <span className="f-alert-body">
                  Some job sites don’t let other websites load their ads. Open the posting, copy the text, and paste it under Match.
                  <Button size="sm" variant="secondary" onClick={() => setTab('match')}>
                    Paste it under Match
                  </Button>
                </span>
              </Alert>
            )}
            <div className="f-row">
          <TextField label="Next step" placeholder="e.g. Interview with the design team" value={draft.nextStep?.label ?? ''} onChange={(e) => set({ nextStep: e.target.value || draft.nextStep?.date ? { date: draft.nextStep?.date ?? '', label: e.target.value } : null })} />
          <DatePicker label="When" value={fromIsoDay(draft.nextStep?.date || null)} onChange={(d) => set({ nextStep: { label: draft.nextStep?.label || 'Next step', date: toIsoDay(d) } })} placeholder="Pick a date" />
        </div>
        <Pipeline status={draft.status} onChange={(s) => set({ status: s, appliedOn: s === 'applied' && !draft.appliedOn ? toIsoDay(new Date()) : draft.appliedOn })} />
            <Combobox
              label="Company"
              allowCustom
              options={companies}
              value={draft.company || null}
              onChange={(v) => set({ company: v ?? '' })}
              placeholder="Type a company"
              emptyText="Type a company name"
              error={tried && missing ? 'Add the company name.' : undefined}
            />
            <Combobox label="Role" allowCustom options={roles} value={draft.role || null} onChange={(v) => set({ role: v ?? '' })} placeholder="e.g. Frontend engineer" emptyText="Type a role" />
            <Select label="Status" value={draft.status} onChange={(v) => set({ status: v as Status })} options={STATUSES.map((s) => ({ value: s.id, label: s.label }))} />
            <DatePicker label="Applied on" value={fromIsoDay(draft.appliedOn)} onChange={(d) => set({ appliedOn: toIsoDay(d) })} max={new Date()} placeholder="Not yet" />
            <Select
              label="Resume sent"
              value={draft.resumeId ?? 'none'}
              onChange={(v) => set({ resumeId: v === 'none' ? null : v })}
              options={[{ value: 'none', label: 'None yet' }, ...resumes.map((r) => ({ value: r.id, label: r.name }))]}
            />
            <Textarea label="Notes" hint="Contacts, interview dates, what they asked." autoResize value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />
          </form>
            )
          },
          {
            id: 'match',
            label: match.total ? `Match ${match.found}/${match.total}` : 'Match',
            content: (
              <div className="f-form">
                <Textarea
                  label="Job posting"
                  hint="Paste the whole ad. It stays in Folio and is only compared with your resume."
                  rows={6}
                  autoResize={false}
                  value={draft.posting ?? ''}
                  onChange={(e) => set({ posting: e.target.value })}
                />
                {resume ? (
                  <>
                    <p className="f-meta">
                      Comparing with <b>{resume.name}</b>. Change it under Details.
                    </p>
                    <MatchPanel match={match} />
                    {match.total > 0 && (
                      <Button variant="secondary" iconLeft={<Icon name="copy" />} onClick={tailorCopy}>
                        Tailor a copy for {draft.company.trim() || 'this job'}
                      </Button>
                    )}
                  </>
                ) : (
                  <Alert tone="info" title="Choose a resume to compare">
                    <span className="f-alert-body">
                      Pick the resume you’re sending under Details.
                      <Button size="sm" variant="secondary" onClick={() => setTab('details')}>
                        Go to Details
                      </Button>
                    </span>
                  </Alert>
                )}
              </div>
            )
          },
          {
            id: 'sent',
            label: 'Sent version',
            content: <SentVersion app={draft} onReplace={(r) => set({ snapshot: { resume: structuredClone(r), sentAt: toIsoDay(new Date()) } })} />
          }
        ]}
      />
    </Drawer>
  );
}

export function ApplicationsPage({ adding }: { adding: boolean }) {
  const { applications, resumes } = useStore();
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Application | null>(null);
  // A fresh blank per visit to #/applications/new, not per render.
  const addDraft = useMemo(() => (adding ? blank() : null), [adding]);

  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, applications.filter((a) => a.status === s.id).length]));
  const needle = query.trim().toLowerCase();
  const rows = applications.filter((a) => (filter === 'all' || a.status === filter) && (!needle || `${a.company} ${a.role}`.toLowerCase().includes(needle)));
  const active = applications.filter((a) => a.status === 'applied' || a.status === 'interview').length;

  const columns: TableColumn<Application>[] = [
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (a) => (
        <span className="f-company">
          {/* The name is right beside it, so the initials are decoration for screen readers. */}
          <span aria-hidden="true">
            <Avatar name={a.company} size={34} />
          </span>
          <button type="button" className="f-link ts-focus" onClick={() => setEditing(a)}>
            <b>{a.company}</b>
            <span>{a.role}</span>
          </button>
        </span>
      )
    },
    { key: 'status', header: 'Status', sortable: true, sortValue: (a) => STATUSES.findIndex((s) => s.id === a.status), render: (a) => <StatusCell app={a} /> },
    { key: 'appliedOn', header: 'Applied', sortable: true, sortValue: (a) => a.appliedOn ?? '', render: (a) => formatDay(a.appliedOn) },
    { key: 'resume', header: 'Resume', render: (a) => resumes.find((r) => r.id === a.resumeId)?.name ?? <span className="f-muted">None</span> }
  ];

  return (
    <div className="f-page">
      <header className="f-head">
        <div>
          <h1 className="f-title" id="page-title" tabIndex={-1}>
            Applications
          </h1>
          <p className="f-lead">
            {applications.length ? `${applications.length} jobs tracked, ${active} in progress.` : 'Every job you save or apply to, and where each one stands.'}
          </p>
        </div>
        <Button iconLeft={<Icon name="plus" />} onClick={() => go('/applications/new')}>
          Add application
        </Button>
      </header>

      <FollowUps onOpen={setEditing} />

      <div className="f-stats">
        {STATUSES.map((s) => (
          <button key={s.id} type="button" data-surface="label" className={'f-stat ts-focus' + (filter === s.id ? ' f-stat-on' : '')} aria-pressed={filter === s.id} onClick={() => setFilter(filter === s.id ? 'all' : s.id)}>
            <b>{counts[s.id]}</b>
            <Badge tone={s.tone} dot>
              {s.label}
            </Badge>
          </button>
        ))}
      </div>

      <div className="f-toolbar">
        <TextField label="Search" className="f-search" icon="search" placeholder="Company or role" value={query} onChange={(e) => setQuery(e.target.value)} />
        {filter !== 'all' && (
          <Button variant="ghost" iconLeft={<Icon name="x" />} onClick={() => setFilter('all')}>
            Show all {applications.length}
          </Button>
        )}
      </div>

      <Table
        caption="Job applications"
        columns={columns}
        rows={rows}
        defaultSort={{ key: 'appliedOn', direction: 'desc' }}
        empty={
          <EmptyState
            title={applications.length ? 'Nothing matches' : 'No applications yet'}
            description={applications.length ? 'Try another status or clear the search.' : 'Add the jobs you’re eyeing, then move them along as you hear back.'}
            actions={
              applications.length ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilter('all');
                    setQuery('');
                  }}
                >
                  Show everything
                </Button>
              ) : (
                <Button onClick={() => go('/applications/new')}>Add application</Button>
              )
            }
          />
        }
      />

      <ApplicationDrawer
        app={adding ? addDraft : editing}
        isNew={adding}
        onClose={() => {
          setEditing(null);
          if (adding) go('/applications');
        }}
      />
    </div>
  );
}
