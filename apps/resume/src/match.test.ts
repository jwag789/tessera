import { matchPosting, tailor } from './match';
import { blankResume } from './store';
import type { Resume } from './store';

const resume = (patch: Partial<Resume> = {}): Resume => ({ ...blankResume('Test', 'modern'), ...patch });
const POSTING = `Senior Frontend Engineer at Globex. You'll build our payments dashboard in React and TypeScript.
We care about accessibility (WCAG 2.2) and web performance. Experience with GraphQL, CI/CD and C++ is a plus.
You will mentor engineers and work with design on our design system. Payments experience helps: our payments
platform handles payments in 40 countries. We go to market fast and excel at shipping.`;

describe('matchPosting', () => {
  it('finds the skills a posting asks for, by any common spelling', () => {
    const m = matchPosting(POSTING, null);
    const names = m.terms.map((t) => t.term);
    expect(names).toEqual(expect.arrayContaining(['React', 'TypeScript', 'Accessibility', 'Web performance', 'GraphQL', 'CI/CD', 'C++', 'Mentoring', 'Design systems']));
  });

  it('ignores everyday words that are also tool names', () => {
    const names = matchPosting(POSTING, null).terms.map((t) => t.term);
    expect(names).not.toContain('Go');
    expect(names).not.toContain('Excel');
    expect(names).not.toContain('C');
  });

  it('picks up words the posting repeats as the domain', () => {
    const payments = matchPosting(POSTING, null).terms.find((t) => t.term === 'payments');
    expect(payments).toMatchObject({ skill: false, mentions: 4 });
  });

  it('marks what the resume already shows, wherever it is written', () => {
    const r = resume({
      skills: ['JS', 'TypeScript'],
      experience: [{ id: 'e', role: 'Engineer', company: 'Acme', start: '', end: '', bullets: 'Mentored three engineers\nMade checkout WCAG compliant\nBuilt payment flows' }]
    });
    const m = matchPosting(POSTING, r);
    const found = new Set(m.terms.filter((t) => t.found).map((t) => t.term));
    expect(found.has('TypeScript')).toBe(true);
    expect(found.has('Accessibility')).toBe(true); // WCAG counts
    expect(found.has('Mentoring')).toBe(true); // "Mentored" counts as mentor
    expect(found.has('payments')).toBe(true); // "payment" stems the same
    expect(found.has('React')).toBe(false);
    expect(m.found).toBe(m.terms.filter((t) => t.found).length);
    expect(m.total).toBe(m.terms.length);
  });

  it('lists known skills before repeated words, most mentioned first', () => {
    const m = matchPosting('Python Python Python SQL. Logistics logistics logistics.', null);
    expect(m.terms.map((t) => t.term)).toEqual(['Python', 'SQL', 'logistics']);
  });
});

describe('tailor', () => {
  it('moves matching skills first and adds nothing the person did not write', () => {
    const r = resume({ skills: ['Figma', 'React', 'Node.js', 'TypeScript'] });
    const t = tailor(r, matchPosting(POSTING, r), 'Test — Globex', 'new-id');
    expect(t.skills).toEqual(['React', 'TypeScript', 'Figma', 'Node.js']);
    expect(t).toMatchObject({ id: 'new-id', name: 'Test — Globex' });
    expect(r.skills).toEqual(['Figma', 'React', 'Node.js', 'TypeScript']); // original untouched
  });
});
