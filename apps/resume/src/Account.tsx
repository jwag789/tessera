// Signing in, the account menu, what the save indicator says, and the first-sign-in upload offer.
import { useState } from 'react';
import { Alert, Avatar, Badge, Button, Dialog, DropdownMenu, Icon, Spinner, TextField } from '@tessera-design/react';
import { sendMagicLink } from './cloud';
import { useStore } from './store';
import type { Data } from './store';
import { openBackup } from './Backup';

export const openSignIn = () => window.dispatchEvent(new Event('folio:sign-in'));

export function SignInDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const close = () => {
    setState('idle');
    setError('');
    onClose();
  };
  const send = async () => {
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError('Enter an email address like you@example.com.');
      return;
    }
    setError('');
    setState('sending');
    try {
      await sendMagicLink(value);
      setState('sent');
    } catch (e) {
      setState('idle');
      setError((e as Error).message);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={close}
      title={state === 'sent' ? 'Check your email' : 'Sign in to Folio'}
      actions={
        state === 'sent' ? (
          <Button onClick={close}>Done</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={() => void send()} loading={state === 'sending'}>
              Email me a sign-in link
            </Button>
          </>
        )
      }
    >
      {state === 'sent' ? (
        <Alert tone="success" title={`We sent a link to ${email.trim()}`}>
          Open it on this device to finish signing in. It works once and expires in an hour. No email after a minute? Check spam.
        </Alert>
      ) : (
        <form
          className="f-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <p className="f-dialog-text">Sign in to save your resumes and applications to your account and open them on any device. No password: we email you a link.</p>
          <TextField label="Email" type="email" icon="mail" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={error || undefined} />
        </form>
      )}
    </Dialog>
  );
}

export function AccountMenu() {
  const { account, signOut } = useStore();
  if (!account) return null;
  return (
    <DropdownMenu
      label="Account"
      trigger={
        <button type="button" className="f-account ts-focus" aria-label={`Account: ${account.email}`}>
          <Avatar name={account.email} size={32} />
        </button>
      }
      items={[
        { type: 'label', label: account.email },
        { label: 'Back up or restore…', icon: 'file', onSelect: openBackup },
        { type: 'separator' },
        { label: 'Sign out', icon: 'logout', onSelect: signOut }
      ]}
    />
  );
}

/** What's happened to the latest edit: saved where, saving now, or failed with a retry. */
export function SaveStatus() {
  const { account, sync, retrySync } = useStore();
  if (!account)
    return (
      <Badge tone="neutral" dot>
        Saved in this browser
      </Badge>
    );
  if (sync === 'loading' || sync === 'saving')
    return (
      <span className="f-saving" role="status">
        <Spinner size={14} label={sync === 'loading' ? 'Loading your data' : 'Saving'} />
        {sync === 'loading' ? 'Loading…' : 'Saving…'}
      </span>
    );
  if (sync === 'error')
    return (
      <span className="f-saving" role="status">
        <Badge tone="danger" dot>
          Not saved
        </Badge>
        <Button size="sm" variant="ghost" iconLeft={<Icon name="arrow" />} onClick={retrySync}>
          Retry
        </Button>
      </span>
    );
  return (
    <Badge tone="success" dot>
      Saved to your account
    </Badge>
  );
}

const count = (d: Data) => `${d.resumes.length} ${d.resumes.length === 1 ? 'resume' : 'resumes'} and ${d.applications.length} ${d.applications.length === 1 ? 'application' : 'applications'}`;

export function UploadOfferDialog() {
  const { uploadOffer, answerUpload, account } = useStore();
  return (
    <Dialog
      open={!!uploadOffer}
      onClose={() => answerUpload(false)}
      title="Bring your work into your account?"
      actions={
        <>
          <Button variant="ghost" onClick={() => answerUpload(false)}>
            Start empty
          </Button>
          <Button onClick={() => answerUpload(true)}>Upload {uploadOffer ? count(uploadOffer) : ''}</Button>
        </>
      }
    >
      <p className="f-dialog-text">
        This browser has {uploadOffer ? count(uploadOffer) : ''} from before you signed in. Upload them to {account?.email} to open them anywhere. Either way, the copy in this browser stays where it is.
      </p>
    </Dialog>
  );
}
