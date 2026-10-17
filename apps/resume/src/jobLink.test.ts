import { apiUrl, fetchJob, htmlToText, parseJobLink, toJob } from './jobLink';

describe('parseJobLink', () => {
  it('reads Greenhouse, Lever and Ashby links', () => {
    expect(parseJobLink('https://boards.greenhouse.io/globex/jobs/4012345')).toEqual({ provider: 'greenhouse', board: 'globex', id: '4012345' });
    expect(parseJobLink('https://job-boards.eu.greenhouse.io/globex/jobs/4012345?gh_src=x')).toMatchObject({ board: 'globex', id: '4012345' });
    expect(parseJobLink('https://boards.greenhouse.io/embed/job_app?for=globex&token=4012345')).toMatchObject({ board: 'globex', id: '4012345' });
    expect(parseJobLink(' https://jobs.lever.co/globex/5ac21346-8e0c/apply ')).toEqual({ provider: 'lever', board: 'globex', id: '5ac21346-8e0c', eu: false });
    expect(parseJobLink('https://jobs.eu.lever.co/globex/abc')).toMatchObject({ eu: true });
    expect(parseJobLink('https://jobs.ashbyhq.com/globex/9f1c/application')).toEqual({ provider: 'ashby', board: 'globex', id: '9f1c' });
  });

  it('ignores anything else', () => {
    expect(parseJobLink('')).toBeNull();
    expect(parseJobLink('not a link')).toBeNull();
    expect(parseJobLink('https://globex.com/careers/123')).toBeNull();
    expect(parseJobLink('https://boards.greenhouse.io/globex')).toBeNull();
    expect(parseJobLink('https://jobs.lever.co/globex')).toBeNull();
  });

  it('points at the public APIs', () => {
    expect(apiUrl(parseJobLink('https://boards.greenhouse.io/globex/jobs/1')!)).toBe('https://boards-api.greenhouse.io/v1/boards/globex/jobs/1');
    expect(apiUrl(parseJobLink('https://jobs.eu.lever.co/globex/abc')!)).toBe('https://api.eu.lever.co/v0/postings/globex/abc?mode=json');
    expect(apiUrl(parseJobLink('https://jobs.ashbyhq.com/globex/abc')!)).toBe('https://api.ashbyhq.com/posting-api/job-board/globex');
  });
});

describe('htmlToText', () => {
  it('keeps paragraphs and turns list items into bullets', () => {
    expect(htmlToText('<p>About&nbsp;us</p><ul><li>React</li><li>TypeScript</li></ul>')).toBe('About us\n• React\n• TypeScript');
  });
});

describe('toJob', () => {
  it('decodes Greenhouse’s escaped HTML', () => {
    const job = toJob(
      { provider: 'greenhouse', board: 'globex-corp', id: '1' },
      { title: 'Frontend lead', location: { name: 'Remote' }, content: '&lt;p&gt;We use &lt;b&gt;React&lt;/b&gt; &amp;amp; Node.&lt;/p&gt;' }
    );
    expect(job).toEqual({ company: 'Globex Corp', role: 'Frontend lead', location: 'Remote', posting: 'We use React & Node.' });
  });

  it('joins Lever’s description, lists and closing', () => {
    const job = toJob(
      { provider: 'lever', board: 'globex', id: 'x' },
      { text: 'Designer', categories: { location: 'Berlin' }, descriptionPlain: 'Intro.', lists: [{ text: 'You have', content: '<li>Figma</li>' }], additionalPlain: 'Benefits.' }
    );
    expect(job.posting).toBe('Intro.\n\nYou have\n• Figma\n\nBenefits.');
    expect(job).toMatchObject({ company: 'Globex', role: 'Designer', location: 'Berlin' });
  });

  it('picks the job out of an Ashby board', () => {
    const data = { jobs: [{ id: 'a', title: 'Other' }, { id: 'b', title: 'Engineer', location: 'NYC', descriptionPlain: 'Build things.' }] };
    expect(toJob({ provider: 'ashby', board: 'globex', id: 'b' }, data)).toMatchObject({ role: 'Engineer', location: 'NYC', posting: 'Build things.' });
    expect(() => toJob({ provider: 'ashby', board: 'globex', id: 'zzz' }, data)).toThrow('not-found');
  });
});

describe('fetchJob', () => {
  const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));

  it('fetches and reads a posting', async () => {
    const fetcher = vi.fn(() => ok({ title: 'Frontend lead', content: '&lt;p&gt;Hi&lt;/p&gt;' }));
    await expect(fetchJob('https://boards.greenhouse.io/globex/jobs/1', fetcher as unknown as typeof fetch)).resolves.toMatchObject({ provider: 'greenhouse', role: 'Frontend lead', posting: 'Hi' });
  });

  it('says why it failed', async () => {
    await expect(fetchJob('https://globex.com/jobs/1')).rejects.toThrow('unsupported');
    const gone = vi.fn(() => Promise.resolve(new Response('', { status: 404 })));
    await expect(fetchJob('https://jobs.lever.co/globex/x', gone as unknown as typeof fetch)).rejects.toThrow('not-found');
    const blocked = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    await expect(fetchJob('https://jobs.lever.co/globex/x', blocked as unknown as typeof fetch)).rejects.toThrow('Failed to fetch');
  });
});
