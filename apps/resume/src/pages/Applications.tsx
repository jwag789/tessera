import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, DatePicker, Drawer, EmptyState, Icon, Select, Table, TextField, Textarea, useToast } from '@tessera/react';
import type { TableColumn } from '@tessera/react';
import { STATUSES, formatDay, fromIsoDay, toIsoDay, uid, useStore } from '../store';
import type { Application, Status } from '../store';
import { go } from '../route';

const blank = (): Application => ({ id: uid(), company: '', role: '', status: 'saved', appliedOn: null, resumeId: null, link: '', notes: '' });
const statusOf = (s: Status) => STATUSES.find((x) => x.id === s)!;

function ApplicationDrawer({ app, isNew, onClose }: { app: Application | null; isNew: boolean; onClose: () => void }) {
  const { resumes, saveApplication, removeApplication } = useStore();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Application>(app ?? blank());
  const [tried, setTried] = useState(false);
  useEffect(() => {
    setDraft(app ?? blank());
    setTried(false);
  }, [app]);
  const set = (patch: Partial<Application>) => setDraft((d) => ({ ...d, ...patch }));
  const missing = !draft.company.trim();

  const save = () => {
    setTried(true);
    if (missing) return;
    saveApplication({ ...draft, company: draft.company.trim(), role: draft.role.trim() });
    toast({ title: isNew ? 'Application added' : 'Application saved', description: draft.company, icon: 'success' });
    onClose();
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
      <form
        className="f-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <TextField label="Company" value={draft.company} onChange={(e) => set({ company: e.target.value })} error={tried && missing ? 'Add the company name.' : undefined} autoFocus={isNew} />
        <TextField label="Role" value={draft.role} onChange={(e) => set({ role: e.target.value })} />
        <Select label="Status" value={draft.status} onChange={(v) => set({ status: v as Status })} options={STATUSES.map((s) => ({ value: s.id, label: s.label }))} />
        <DatePicker label="Applied on" value={fromIsoDay(draft.appliedOn)} onChange={(d) => set({ appliedOn: toIsoDay(d) })} max={new Date()} placeholder="Not yet" />
        <Select
          label="Resume sent"
          value={draft.resumeId ?? 'none'}
          onChange={(v) => set({ resumeId: v === 'none' ? null : v })}
          options={[{ value: 'none', label: 'None yet' }, ...resumes.map((r) => ({ value: r.id, label: r.name }))]}
        />
        <TextField label="Job posting" type="url" icon="external" placeholder="https://" value={draft.link} onChange={(e) => set({ link: e.target.value })} />
        <Textarea label="Notes" hint="Contacts, interview dates, what they asked." autoResize value={draft.notes} onChange={(e) => set({ notes: e.target.value })} />
      </form>
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
        <button type="button" className="f-link ts-focus" onClick={() => setEditing(a)}>
          <b>{a.company}</b>
          <span>{a.role}</span>
        </button>
      )
    },
    { key: 'status', header: 'Status', sortable: true, sortValue: (a) => STATUSES.findIndex((s) => s.id === a.status), render: (a) => <Badge tone={statusOf(a.status).tone} dot>{statusOf(a.status).label}</Badge> },
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
