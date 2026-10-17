// What a job posting asks for, and how much of it a resume shows. Keyword matching, no AI: that's also how
// most applicant-tracking systems filter, so "does the resume use their words" is the question worth answering.
import type { Resume } from './store';

/** Known skills and tools, each with the spellings postings use. The first spelling is the one shown. */
const DICTIONARY: string[][] = [
  // Languages and runtimes
  ['JavaScript', 'js', 'ecmascript', 'es6'], ['TypeScript', 'ts'], ['Python'], ['Java'], ['Kotlin'], ['Swift'], ['Objective-C'], ['Go', 'golang'], ['Rust'], ['Ruby'], ['PHP'], ['C#', 'c sharp'], ['C++', 'cpp'], ['C'], ['Scala'], ['Elixir'], ['Dart'], ['R'], ['SQL'], ['Bash', 'shell scripting'], ['Node.js', 'node', 'nodejs'], ['Deno'], ['.NET', 'dotnet'],
  // Frontend
  ['React', 'react.js', 'reactjs'], ['React Native'], ['Next.js', 'nextjs'], ['Vue', 'vue.js', 'vuejs'], ['Nuxt'], ['Angular'], ['Svelte', 'sveltekit'], ['Redux'], ['HTML', 'html5'], ['CSS', 'css3'], ['Sass', 'scss'], ['Tailwind', 'tailwind css', 'tailwindcss'], ['Webpack'], ['Vite'], ['GraphQL'], ['REST', 'rest api', 'rest apis', 'restful'], ['Web performance', 'core web vitals', 'performance optimization'], ['Accessibility', 'a11y', 'wcag'], ['Design systems', 'design system', 'component library'], ['Responsive design', 'responsive'], ['Storybook'], ['Flutter'],
  // Backend, data and infrastructure
  ['Django'], ['Flask'], ['FastAPI'], ['Rails', 'ruby on rails'], ['Spring', 'spring boot'], ['Express', 'express.js'], ['PostgreSQL', 'postgres'], ['MySQL'], ['MongoDB', 'mongo'], ['Redis'], ['Elasticsearch'], ['Kafka'], ['AWS', 'amazon web services'], ['GCP', 'google cloud'], ['Azure'], ['Docker'], ['Kubernetes', 'k8s'], ['Terraform'], ['CI/CD', 'continuous integration', 'continuous delivery'], ['Linux'], ['Microservices', 'microservice'], ['Serverless'], ['Git', 'github', 'gitlab'], ['Observability', 'monitoring'], ['Security'],
  // Data and ML
  ['Machine learning', 'ml'], ['Deep learning'], ['LLMs', 'llm', 'large language models'], ['NLP', 'natural language processing'], ['Data analysis', 'data analytics'], ['Data visualization', 'dataviz'], ['Statistics', 'statistical'], ['A/B testing', 'ab testing', 'experimentation'], ['Pandas'], ['NumPy'], ['PyTorch'], ['TensorFlow'], ['Spark', 'apache spark'], ['Airflow'], ['dbt'], ['Snowflake'], ['BigQuery'], ['Tableau'], ['Looker'], ['Power BI'], ['Excel'], ['ETL'],
  // Testing and practice
  ['Testing', 'unit testing', 'automated testing', 'test automation'], ['Jest'], ['Vitest'], ['Cypress'], ['Playwright'], ['TDD', 'test-driven'], ['Code review', 'code reviews'], ['Agile'], ['Scrum'], ['Kanban'], ['Mentoring', 'mentorship', 'mentor'], ['Technical leadership', 'tech lead'], ['System design', 'architecture'], ['API design'],
  // Design and product
  ['Figma'], ['Sketch'], ['Adobe XD'], ['Photoshop'], ['Illustrator'], ['Prototyping', 'prototype', 'prototypes'], ['Wireframing', 'wireframes'], ['User research', 'ux research'], ['Usability testing'], ['Interaction design'], ['Visual design'], ['UX', 'user experience'], ['UI', 'user interface'], ['Motion', 'animation'], ['Typography'], ['Product management'], ['Roadmapping', 'roadmap', 'roadmaps'], ['Product strategy'], ['Analytics', 'product analytics'], ['Jira'], ['Confluence'], ['Notion'],
  // Business, marketing and people
  ['SEO'], ['Content strategy'], ['Copywriting'], ['Social media'], ['Email marketing'], ['Google Analytics'], ['Salesforce'], ['HubSpot'], ['CRM'], ['Sales'], ['Customer success'], ['Project management'], ['Budgeting', 'budget'], ['Forecasting'], ['Stakeholder management', 'stakeholders'], ['Communication', 'communication skills'], ['Collaboration', 'cross-functional'], ['Leadership', 'people management', 'managing a team'], ['Recruiting', 'recruitment'], ['Public speaking', 'presenting'], ['Writing', 'technical writing', 'documentation'], ['Problem solving', 'problem-solving'], ['Remote', 'remote work'], ['Startup', 'startups'], ['B2B'], ['SaaS'], ['E-commerce', 'ecommerce']
];

/** Words common to every posting, so a repeated one isn't treated as a requirement. */
const STOP = new Set(
  'about above after again against all also although always among and any are aren around as at be because been before being below between both but by can cannot could did does doing down during each either else ever every few for from further get gets getting give given go had has have having he her here hers him his how however if in into is isn it its itself just know like make makes making many may me might more most much must my need needs new no nor not now of off often on once one only or other our ours out over own per please provide provides re role roles same see seeking she should since so some such take than that the their them then there these they this those through to too toward under until up upon us use used using very via want wants was way we well were what when where which while who whom why will with within without work working would year years yet you your yours team teams company companies experience experienced job jobs position candidate candidates opportunity opportunities including include includes strong ability able skills skill knowledge understanding looking join help build building across based best great high level part plus preferred required requirements responsibilities qualifications ideal equal employer benefits salary apply application bonus day days time full eg ie etc etc. what you\'ll we\'re you\'re we\'ll'.split(
    /\s+/
  )
);

export interface Term {
  term: string;
  /** In the resume (anywhere: skills, summary, achievements, titles). */
  found: boolean;
  /** A known skill, so it can be offered for the skills list. Repeated posting words are not. */
  skill: boolean;
  /** How often the posting mentions it; more often means more important. */
  mentions: number;
}
export interface Match {
  terms: Term[];
  found: number;
  total: number;
}

/** Names that are also everyday words ("go to market", "excel at", "spark ideas") only count in their proper case. */
const CASED = new Set(['Go', 'R', 'C', 'Swift', 'Rust', 'Express', 'Spring', 'Spark', 'Dart', 'Flask', 'Excel', 'Sketch', 'Notion', 'Java']);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Matches a spelling as a whole word; works for "C++", "C#", ".NET" and "CI/CD" too. */
// Longer spellings also match common endings ("mentored", "prototyping"); short ones stay exact so "React" isn't "reacted".
const wordRe = (alias: string) => {
  const a = alias.toLowerCase();
  const endings = /[a-z]$/.test(a) && a.length >= 6 ? '(?:s|es|d|ed|ing|er|ers)?' : '';
  return new RegExp(`(?<![a-z0-9+#])${escape(a)}${endings}(?![a-z0-9+#])`, 'g');
};
const count = (text: string, alias: string) => (text.match(wordRe(alias)) ?? []).length;
const countCased = (text: string, name: string) => (text.match(new RegExp(`(?<![A-Za-z0-9+#])${escape(name)}(?![A-Za-z0-9+#])`, 'g')) ?? []).length;
/** Mentions of a dictionary entry in `raw` text (original case) or `lower` (lowercased). */
function mentionsOf(spellings: string[], raw: string, lower: string) {
  if (CASED.has(spellings[0])) return countCased(raw, spellings[0]) + spellings.slice(1).reduce((n, sp) => n + count(lower, sp), 0);
  return spellings.reduce((n, sp) => n + count(lower, sp), 0);
}
/** A light stem, so "designed", "designs" and "designing" count as "design". */
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '').replace(/(.)\1$/, '$1');

export function resumeText(r: Resume) {
  const p = r.profile;
  return [p.title, p.summary, ...r.skills, ...r.experience.flatMap((e) => [e.role, e.company, e.bullets]), ...r.education.flatMap((e) => [e.degree, e.school])].join('\n');
}

/** What the posting asks for, most mentioned first, and whether the resume shows each one. */
export function matchPosting(posting: string, resume: Resume | null): Match {
  const text = posting.toLowerCase();
  const mineRaw = resume ? resumeText(resume) : '';
  const mine = mineRaw.toLowerCase();
  const terms: Term[] = [];
  const claimed = new Set<string>();

  for (const spellings of DICTIONARY) {
    const mentions = mentionsOf(spellings, posting, text);
    if (!mentions) continue;
    spellings.forEach((s) => s.toLowerCase().split(/\s+/).forEach((w) => claimed.add(stem(w))));
    terms.push({ term: spellings[0], skill: true, mentions, found: mentionsOf(spellings, mineRaw, mine) > 0 });
  }

  // Words the posting repeats that aren't in the dictionary: likely the domain ("payments", "logistics").
  const words = text.match(/[a-z][a-z-]{3,}/g) ?? [];
  const freq = new Map<string, { n: number; word: string }>();
  for (const w of words) {
    if (STOP.has(w)) continue;
    const s = stem(w);
    if (claimed.has(s) || STOP.has(s)) continue;
    const e = freq.get(s) ?? { n: 0, word: w };
    e.n++;
    freq.set(s, e);
  }
  const mineStems = new Set((mine.match(/[a-z][a-z-]{2,}/g) ?? []).map(stem));
  for (const [s, { n, word }] of freq) {
    if (n >= 3) terms.push({ term: word, skill: false, mentions: n, found: mineStems.has(s) });
  }

  terms.sort((a, b) => Number(b.skill) - Number(a.skill) || b.mentions - a.mentions || a.term.localeCompare(b.term));
  const found = terms.filter((t) => t.found).length;
  return { terms, found, total: terms.length };
}

/** A copy of the resume for one job: matching skills first, nothing added that the person didn't write. */
export function tailor(r: Resume, m: Match, name: string, id: string): Resume {
  const wanted = new Set(m.terms.filter((t) => t.found).map((t) => t.term.toLowerCase()));
  const first = r.skills.filter((s) => wanted.has(s.toLowerCase()));
  const rest = r.skills.filter((s) => !wanted.has(s.toLowerCase()));
  return { ...structuredClone(r), id, name, skills: [...first, ...rest], updatedAt: new Date().toISOString() };
}
