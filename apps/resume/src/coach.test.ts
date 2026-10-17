import { coach } from './coach';

const ids = (s: string) => coach(s).map((h) => h.id);

describe('coach', () => {
  it('says nothing about a strong line', () => {
    expect(coach('Cut median page load from 3.1s to 1.2s by moving rendering to the server')).toEqual([]);
    expect(coach('Grew newsletter signups threefold in a quarter')).toEqual([]);
  });

  it('asks for a verb instead of a weak opener, without repeating itself', () => {
    expect(ids('Responsible for the design system and 40 engineers')).toEqual(['verb']);
    expect(ids('Worked on 3 checkout projects')).toContain('verb');
  });

  it('suggests the past tense for -ing openers', () => {
    const [h] = coach('Leading a team of 5');
    expect(h).toMatchObject({ id: 'tense' });
    expect(h.text).toContain('not “Leading”');
  });

  it('flags filler phrases', () => {
    expect(ids('Built various dashboards for 12 teams')).toEqual(['phrase']);
  });

  it('asks for a number when there is none, in digits or words', () => {
    expect(ids('Built the onboarding flow')).toEqual(['number']);
    expect(ids('Doubled trial conversions')).toEqual([]);
  });

  it('flags lines longer than about two lines', () => {
    expect(ids(`Built ${'a very long sentence '.repeat(12)}for 3 teams`)).toContain('length');
  });

  it('ignores empty lines', () => {
    expect(coach('   ')).toEqual([]);
  });
});
