// Back up and restore: everything lives in this browser, so this is the only safety net.
import { useState } from 'react';
import { Alert, Button, Dialog, FileDropzone, Icon, useToast } from '@tessera/react';
import { downloadBackup, parseBackup, useStore } from './store';
import type { Data } from './store';

export const BACKUP_TIP_KEY = 'folio:backup-tip-dismissed';
/** Opens the backup dialog from anywhere (the navbar menu, the command palette, the tip on Resumes). */
export const openBackup = () => window.dispatchEvent(new Event('folio:backup'));

const count = (d: Data) => `${d.resumes.length} ${d.resumes.length === 1 ? 'resume' : 'resumes'} and ${d.applications.length} ${d.applications.length === 1 ? 'application' : 'applications'}`;

export function BackupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pending, setPending] = useState<Data | null>(null);
  const [error, setError] = useState('');

  const close = () => {
    setFiles([]);
    setPending(null);
    setError('');
    onClose();
  };
  const pick = async (next: File[]) => {
    setFiles(next);
    setPending(null);
    setError('');
    if (!next[0]) return;
    try {
      setPending(parseBackup(await next[0].text()));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const restore = () => {
    if (!pending) return;
    store.replaceAll(pending);
    toast({ title: 'Backup restored', description: count(pending), icon: 'success' });
    close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Back up and restore"
      actions={
        pending ? (
          <>
            <Button variant="ghost" onClick={() => pick([])}>
              Cancel
            </Button>
            <Button variant="danger" onClick={restore}>
              Replace my data
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={close}>
            Done
          </Button>
        )
      }
    >
      <div className="f-form">
        <p className="f-dialog-text">Folio keeps everything in this browser. Download a backup to keep a copy, or to move your work to another computer.</p>
        <Button
          variant="secondary"
          iconLeft={<Icon name="file" />}
          onClick={() => {
            downloadBackup({ resumes: store.resumes, applications: store.applications, achievements: store.achievements });
            try {
              localStorage.setItem(BACKUP_TIP_KEY, '1');
            } catch {
              /* storage unavailable */
            }
            toast({ title: 'Backup downloaded', description: count(store), icon: 'success' });
          }}
        >
          Download backup ({count(store)})
        </Button>
        <FileDropzone
          label="Restore from a backup"
          accept=".json"
          maxSize={5 * 1024 * 1024}
          files={files}
          onFilesChange={(f) => void pick(f.slice(-1))}
          onReject={(r) => setError(r[0] ? `${r[0].file.name}: ${r[0].reason}` : '')}
          hint="Use a file from Download backup above."
        />
        {error && (
          <Alert tone="danger" title="Couldn’t read that file">
            {error}
          </Alert>
        )}
        {pending && (
          <Alert tone="warning" title={`Replace everything with ${count(pending)}?`}>
            Your current {count(store)} will be replaced. Download a backup first if you might want them back.
          </Alert>
        )}
      </div>
    </Dialog>
  );
}
