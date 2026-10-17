// Sync logic against a fake server: what gets loaded, saved, offered and retried.
import { act, render } from '@testing-library/react';
import { StoreProvider, useStore } from './store';
import type { Data } from './store';
import { diffData } from './sync';

const server = vi.hoisted(() => ({
  data: { resumes: [], applications: [] } as Data,
  pushes: [] as unknown[],
  fail: false,
  listener: null as ((s: unknown) => void) | null
}));
const session = { user: { id: 'u1', email: 'ada@lovelace.dev' } };

vi.mock('./cloud', () => ({
  cloudEnabled: true,
  currentSession: async () => null,
  onSessionChange: (cb: (s: unknown) => void) => {
    server.listener = cb;
    return () => {};
  },
  loadAll: async () => structuredClone(server.data),
  push: async (changes: unknown) => {
    if (server.fail) throw new Error('offline');
    server.pushes.push(changes);
  },
  signOut: async () => server.listener?.(null)
}));

let store: ReturnType<typeof useStore>;
function Probe() {
  store = useStore();
  return null;
}
const app = { id: 'x', company: 'Globex', role: 'Lead', status: 'applied' as const, appliedOn: null, resumeId: null, link: '', notes: '' };
// Real timers: saves wait 600ms after the last edit, and several steps finish a promise later.
const wait = (ms = 0) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const signIn = async () => {
  await act(async () => server.listener?.(session));
  await wait();
};
const settle = () => wait(700);

beforeEach(() => {
  localStorage.clear();
  server.data = { resumes: [], applications: [] };
  server.pushes = [];
  server.fail = false;
});

describe('diffData', () => {
  it('lists changed and new rows to write, and missing ones to delete', () => {
    const before: Data = { resumes: [], applications: [app, { ...app, id: 'y' }] };
    const after: Data = { resumes: [], applications: [{ ...app, status: 'offer' }, { ...app, id: 'z' }] };
    const c = diffData(before, after);
    expect(c.applications.upsert.map((a) => a.id)).toEqual(['x', 'z']);
    expect(c.applications.remove).toEqual(['y']);
    expect(c.resumes).toEqual({ upsert: [], remove: [] });
  });
});

describe('server sync', () => {
  it('loads the account on sign-in and saves edits as one batch', async () => {
    server.data = { resumes: [], applications: [app] };
    render(<StoreProvider><Probe /></StoreProvider>);
    await signIn();
    expect(store.account?.email).toBe('ada@lovelace.dev');
    expect(store.applications.map((a) => a.company)).toEqual(['Globex']);
    expect(store.sync).toBe('saved');

    act(() => store.saveApplication({ ...app, status: 'interview' }));
    act(() => store.saveApplication({ ...app, status: 'offer' }));
    await settle();
    expect(server.pushes).toHaveLength(1);
    expect(server.pushes[0]).toMatchObject({ applications: { upsert: [{ id: 'x', status: 'offer' }], remove: [] } });
    expect(store.sync).toBe('saved');
  });

  it('offers to upload local work on a first sign-in to an empty account', async () => {
    render(<StoreProvider><Probe /></StoreProvider>);
    const local = store.resumes.length + store.applications.length;
    expect(local).toBeGreaterThan(0); // the samples
    await signIn();
    expect(store.uploadOffer).not.toBeNull();
    expect(store.resumes).toHaveLength(0);
    act(() => store.answerUpload(true));
    await settle();
    expect(store.resumes.length + store.applications.length).toBe(local);
    expect(server.pushes).toHaveLength(1);
  });

  it('marks a failed save and retries it', async () => {
    render(<StoreProvider><Probe /></StoreProvider>);
    await signIn();
    act(() => store.answerUpload(false));
    server.fail = true;
    act(() => store.saveApplication(app));
    await settle();
    expect(store.sync).toBe('error');
    server.fail = false;
    act(() => store.retrySync());
    await wait();
    expect(store.sync).toBe('saved');
    expect(server.pushes).toHaveLength(1);
  });

  it('goes back to this browser’s data on sign-out', async () => {
    render(<StoreProvider><Probe /></StoreProvider>);
    const localCount = store.applications.length;
    await signIn();
    act(() => store.answerUpload(false));
    act(() => store.signOut());
    await wait();
    expect(store.account).toBeNull();
    expect(store.sync).toBe('local');
    expect(store.applications).toHaveLength(localCount);
  });
});
