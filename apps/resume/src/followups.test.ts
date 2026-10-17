import { addDays, daysBetween, nudgeFor, nudges, upcoming } from './followups';
import type { Application } from './store';

const TODAY = '2026-10-17';
const app = (patch: Partial<Application>): Application => ({ id: 'a', company: 'Globex', role: '', status: 'applied', appliedOn: '2026-10-01', resumeId: null, link: '', notes: '', ...patch });

describe('dates', () => {
  it('adds days across month ends and counts days between', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(daysBetween('2026-10-01', TODAY)).toBe(16);
  });
});

describe('nudgeFor', () => {
  it('nudges a job that has been quiet for a week', () => {
    expect(nudgeFor(app({}), TODAY)?.reason).toBe('Applied 16 days ago, no reply yet');
    expect(nudgeFor(app({ appliedOn: '2026-10-12' }), TODAY)).toBeNull();
  });

  it('leaves alone jobs that are saved, closed or have something scheduled', () => {
    expect(nudgeFor(app({ status: 'saved' }), TODAY)).toBeNull();
    expect(nudgeFor(app({ status: 'offer' }), TODAY)).toBeNull();
    expect(nudgeFor(app({ status: 'rejected' }), TODAY)).toBeNull();
    expect(nudgeFor(app({ nextStep: { date: '2026-10-21', label: 'Interview' } }), TODAY)).toBeNull();
  });

  it('nudges again after a past next step', () => {
    expect(nudgeFor(app({ status: 'interview', nextStep: { date: '2026-10-10', label: 'Interview' } }), TODAY)).not.toBeNull();
  });

  it('waits until the follow-up date you set', () => {
    expect(nudgeFor(app({ followUpOn: '2026-10-20' }), TODAY)).toBeNull();
    expect(nudgeFor(app({ followUpOn: TODAY }), TODAY)?.reason).toBe('You planned to follow up by now');
  });

  it('lists the longest-waiting first', () => {
    const list = nudges([app({ id: 'b', appliedOn: '2026-10-05' }), app({ id: 'c', appliedOn: '2026-09-20' })], TODAY);
    expect(list.map((n) => n.app.id)).toEqual(['c', 'b']);
  });
});

describe('upcoming', () => {
  it('lists next steps in the coming month, soonest first, skipping past and closed ones', () => {
    const apps = [
      app({ id: 'late', nextStep: { date: '2026-11-10', label: 'Final round' } }),
      app({ id: 'soon', nextStep: { date: '2026-10-19', label: 'Call' } }),
      app({ id: 'past', nextStep: { date: '2026-10-10', label: 'Old' } }),
      app({ id: 'far', nextStep: { date: '2027-01-10', label: 'Far' } }),
      app({ id: 'closed', status: 'rejected', nextStep: { date: '2026-10-20', label: 'Cancelled' } })
    ];
    expect(upcoming(apps, TODAY).map((a) => a.id)).toEqual(['soon', 'late']);
  });
});
