import { blankResume, editedSince, withSnapshot } from './store';
import type { Application } from './store';

const r1 = { ...blankResume('Frontend', 'modern'), id: 'r1' };
const r2 = { ...blankResume('Design', 'classic'), id: 'r2' };
const app: Application = { id: 'a', company: 'Globex', role: '', status: 'saved', appliedOn: null, resumeId: 'r1', link: '', notes: '' };

describe('withSnapshot', () => {
  it('takes no copy while the job is only saved', () => {
    expect(withSnapshot(app, [r1]).snapshot).toBeNull();
  });

  it('copies the resume once the application is sent, dated the day it was applied', () => {
    const a = withSnapshot({ ...app, status: 'applied', appliedOn: '2026-10-02' }, [r1]);
    expect(a.snapshot).toMatchObject({ sentAt: '2026-10-02', resume: { id: 'r1', name: 'Frontend' } });
    expect(a.snapshot!.resume).not.toBe(r1); // a copy, not a reference
  });

  it('keeps the copy when the resume is edited later', () => {
    const sent = withSnapshot({ ...app, status: 'applied' }, [r1]);
    const edited = { ...r1, name: 'Frontend v2' };
    const again = withSnapshot({ ...sent, status: 'interview' }, [edited]);
    expect(again.snapshot!.resume.name).toBe('Frontend');
    expect(editedSince(edited, again.snapshot!.resume)).toBe(true);
    expect(editedSince({ ...r1, updatedAt: 'later' }, again.snapshot!.resume)).toBe(false);
  });

  it('starts over when a different resume is chosen', () => {
    const sent = withSnapshot({ ...app, status: 'applied' }, [r1, r2]);
    const switched = withSnapshot({ ...sent, resumeId: 'r2' }, [r1, r2]);
    expect(switched.snapshot!.resume.id).toBe('r2');
  });
});
