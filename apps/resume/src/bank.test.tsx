import { act, render } from '@testing-library/react';
import { StoreProvider, normalize, useStore } from './store';

vi.mock('./cloud', () => ({ cloudEnabled: false, currentSession: async () => null, onSessionChange: () => () => {}, loadAll: async () => ({}), push: async () => {}, signOut: async () => {} }));

let store: ReturnType<typeof useStore>;
function Probe() {
  store = useStore();
  return null;
}
const lines = (resumeId: string) => store.resumes.find((r) => r.id === resumeId)!.experience[0].points.map((p) => p.text);

beforeEach(() => localStorage.clear());

describe('achievement bank', () => {
  it('rewrites a linked achievement in every resume, but not in what was already sent', () => {
    render(<StoreProvider><Probe /></StoreProvider>);
    // Both sample resumes link k1; Northwind's application was sent with the first one.
    const sent = store.applications.find((a) => a.company === 'Northwind')!.snapshot!.resume.experience[0].points[0].text;
    act(() => store.updateAchievement('k1', 'Led the design system used by 60 engineers across 9 teams'));
    expect(lines('ada')[0]).toBe('Led the design system used by 60 engineers across 9 teams');
    expect(lines('ada-design')[0]).toBe('Led the design system used by 60 engineers across 9 teams');
    expect(store.applications.find((a) => a.company === 'Northwind')!.snapshot!.resume.experience[0].points[0].text).toBe(sent);
  });

  it('removing from the bank keeps the text in resumes and stops linking it', () => {
    render(<StoreProvider><Probe /></StoreProvider>);
    act(() => store.removeAchievement('k1'));
    expect(store.achievements.some((a) => a.id === 'k1')).toBe(false);
    const p = store.resumes[0].experience[0].points[0];
    expect(p).toMatchObject({ ref: null });
    expect(p.text).toContain('design system');
  });
});

describe('normalize', () => {
  it('turns old one-per-line bullets into points and adds an empty bank', () => {
    const d = normalize({ resumes: [{ id: 'r', experience: [{ id: 'e', role: '', company: '', start: '', end: '', bullets: 'Built X\n\n  Shipped Y  ' }] }] } as never);
    expect(d.resumes[0].experience[0].points).toEqual([
      { id: 'e-0', text: 'Built X' },
      { id: 'e-1', text: 'Shipped Y' }
    ]);
    expect(d.achievements).toEqual([]);
    expect('bullets' in d.resumes[0].experience[0]).toBe(false);
  });
});
