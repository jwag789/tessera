import { useState } from 'react';
import { Alert, Button, Card, Skeleton, Dialog, DropdownMenu, EmptyState, Grid, Icon, RadioGroup, TextField, useToast } from '@tessera/react';
import { ScaledPaper } from '../ScaledPaper';
import { TEMPLATES, blankResume, uid, useStore } from '../store';
import type { Resume, TemplateId } from '../store';
import { go } from '../route';
import { BACKUP_TIP_KEY, openBackup } from '../Backup';
import { openSignIn } from '../Account';
import { cloudEnabled } from '../cloud';

const edited = (iso: string) => new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });

function NewResumeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addResume } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<TemplateId>('modern');
  const create = () => {
    const r = blankResume(name.trim() || 'Untitled resume', template);
    addResume(r);
    toast({ title: 'Resume created', description: r.name, icon: 'success' });
    setName('');
    onClose();
    go(`/resume/${r.id}`);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New resume"
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create}>Create resume</Button>
        </>
      }
    >
      <form
        className="f-form"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        <TextField label="Name" placeholder="e.g. Frontend engineer" hint="Only you see this. Name it after the kind of job it's for." value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <RadioGroup label="Template" value={template} onChange={(v) => setTemplate(v as TemplateId)} options={TEMPLATES.map((t) => ({ value: t.id, label: t.label, description: t.description }))} />
      </form>
    </Dialog>
  );
}

function ResumeCard({ resume, onDelete }: { resume: Resume; onDelete: () => void }) {
  const { addResume, applications } = useStore();
  const { toast } = useToast();
  const used = applications.filter((a) => a.resumeId === resume.id).length;
  const open = () => go(`/resume/${resume.id}`);
  return (
    <Card
      className="f-resume-card"
      onClick={open}
      eyebrow={TEMPLATES.find((t) => t.id === resume.template)?.label}
      title={resume.name}
      actions={
        // The buttons sit inside a clickable card, so keep their clicks to themselves.
        <span className="f-card-actions" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={open}>
            Edit
          </Button>
          <DropdownMenu
            label={`Actions for ${resume.name}`}
            trigger={
              <Button size="sm" variant="ghost" aria-label={`Actions for ${resume.name}`}>
                <Icon name="more" />
              </Button>
            }
            items={[
              {
                label: 'Duplicate',
                icon: 'copy',
                onSelect: () => {
                  addResume({ ...resume, id: uid(), name: `${resume.name} (copy)`, updatedAt: new Date().toISOString() });
                  toast({ title: 'Duplicated', description: resume.name, icon: 'success' });
                }
              },
              { type: 'separator' },
              { label: 'Delete', icon: 'trash', danger: true, onSelect: onDelete }
            ]}
          />
        </span>
      }
    >
      <div className="f-thumb" aria-hidden="true">
        <ScaledPaper resume={resume} />
      </div>
      <p className="f-meta">
        Edited {edited(resume.updatedAt)} · {used === 1 ? 'Used for 1 application' : `Used for ${used} applications`}
      </p>
    </Card>
  );
}

export function ResumesPage({ creating }: { creating: boolean }) {
  const { resumes, removeResume, account, sync } = useStore();
  const { toast } = useToast();
  const [doomed, setDoomed] = useState<Resume | null>(null);
  const [tip, setTip] = useState(() => {
    try {
      return !localStorage.getItem(BACKUP_TIP_KEY);
    } catch {
      return true;
    }
  });
  const hideTip = () => {
    setTip(false);
    try {
      localStorage.setItem(BACKUP_TIP_KEY, '1');
    } catch {
      /* storage unavailable: the tip comes back next visit */
    }
  };
  return (
    <div className="f-page">
      <header className="f-head">
        <div>
          <h1 className="f-title" id="page-title" tabIndex={-1}>
            Resumes
          </h1>
          <p className="f-lead">One resume per kind of job. Edit on the left, see the page on the right, export to PDF when it's ready.</p>
        </div>
        <Button iconLeft={<Icon name="plus" />} onClick={() => go('/new')}>
          New resume
        </Button>
      </header>
      {tip && !account && (
        <Alert tone="info" title="Your work is saved in this browser only" onDismiss={hideTip}>
          <span className="f-alert-body">
            {cloudEnabled ? 'Sign in to save it to your account and open it on any device, or download a backup.' : 'Clearing your browser data deletes it too. Download a backup now and then, or to move to another computer.'}
            {cloudEnabled && (
              <Button size="sm" onClick={openSignIn}>
                Sign in
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={openBackup}>
              Back up now
            </Button>
          </span>
        </Alert>
      )}
      {sync === 'loading' && !resumes.length ? (
        <Grid minChildWidth={260} gap={6}>
          {[0, 1].map((i) => (
            <div key={i} className="f-skeleton-card" aria-hidden="true">
              <Skeleton width="40%" height={12} />
              <Skeleton width="70%" height={22} />
              <Skeleton height={200} />
              <Skeleton lines={2} />
            </div>
          ))}
        </Grid>
      ) : resumes.length ? (
        <Grid minChildWidth={260} gap={6}>
          {resumes.map((r) => (
            <ResumeCard key={r.id} resume={r} onDelete={() => setDoomed(r)} />
          ))}
        </Grid>
      ) : (
        <EmptyState
          title="No resumes yet"
          description="Start from a template. You can switch templates any time without losing what you wrote."
          actions={
            <Button iconLeft={<Icon name="plus" />} onClick={() => go('/new')}>
              New resume
            </Button>
          }
        />
      )}
      <NewResumeDialog open={creating} onClose={() => go('/')} />
      <Dialog
        open={!!doomed}
        onClose={() => setDoomed(null)}
        title="Delete this resume?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setDoomed(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (doomed) {
                  removeResume(doomed.id);
                  toast({ title: 'Resume deleted', description: doomed.name, icon: 'trash' });
                }
                setDoomed(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <b>{doomed?.name}</b> will be deleted. Applications that used it stay, without a resume attached.
      </Dialog>
    </div>
  );
}
