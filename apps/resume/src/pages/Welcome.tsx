// What Folio is, for someone arriving for the first time: the pitch, what's different, the themes, and the
// promises. Everything on it is the real app (the sample resume, the real matcher, live theme previews).
import { Badge, Button, Card, Icon, Mosaic, Progress, ThemeProvider, useTheme } from '@tessera/react';
import type { IconName } from '@tessera/react';
import { themes } from '@tessera/tokens';
import { ScaledPaper } from '../ScaledPaper';
import { matchPosting } from '../match';
import { SAMPLE_POSTING, SAMPLE_RESUME } from '../store';
import { go } from '../route';

export const WELCOMED_KEY = 'folio:welcomed';
const markWelcomed = () => {
  try {
    localStorage.setItem(WELCOMED_KEY, '1');
  } catch {
    /* storage unavailable: the welcome page shows again next visit */
  }
};

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'search', title: 'Tailor to each job', body: 'Paste the posting and see which of its skills your resume shows and which it misses, then make a tailored copy in one click.' },
  { icon: 'file', title: 'Remember what you sent', body: 'Each application keeps the exact page that went out. When they call three weeks later, you know what they’re holding.' },
  { icon: 'copy', title: 'Write it once', body: 'Keep your achievements in one bank and reuse them in any resume. Fix a number once and every resume updates.' },
  { icon: 'check', title: 'Fits on one page', body: 'See where page one ends and fit it in one click, without going unreadably small.' },
  { icon: 'info', title: 'See what the robot sees', body: 'Read your resume the way applicant-tracking systems do, as plain text, before a recruiter’s software does.' },
  { icon: 'calendar', title: 'Never miss a follow-up', body: 'Folio nudges you when a job goes quiet and keeps interviews on a calendar.' }
];

const PROMISES = [
  { title: 'Free, including the PDF', body: 'No paywall at the end. Export as often as you like.' },
  { title: 'No account needed', body: 'Start right now. Sign in later only if you want your work on other devices.' },
  { title: 'No ads, no tracking', body: 'Your resume is personal. Nothing on this page sells it or watches you.' },
  { title: 'Your data is yours', body: 'Download everything as a file any time, and take it with you.' }
];

const THEME_ORDER = ['tessera', 'cartridge', 'polygon', 'gloop'];
const THEME_PITCH: Record<string, string> = {
  tessera: 'Bold and clean, for focused work.',
  cartridge: 'Charcoal plastic and four bright buttons.',
  polygon: 'Grey plastic, pixel type, hard edges.',
  gloop: 'Slime green and orange. Job hunting, but fun.'
};

function ThemeCard({ name, label }: { name: string; label: string }) {
  const { brand, setBrand, resolvedTheme } = useTheme();
  const on = brand === name;
  return (
    <ThemeProvider scope="local" brand={name} theme={resolvedTheme} className={'w-theme' + (on ? ' w-theme-on' : '')}>
      <div className="w-theme-body">
        <Mosaic columns={8} rows={2} seed={name.length * 5} gap={4} interactive={false} />
        <div className="w-theme-head">
          <b>{label}</b>
          {on && (
            <Badge tone="success" dot>
              In use
            </Badge>
          )}
        </div>
        <p>{THEME_PITCH[name]}</p>
        <Button size="sm" variant={on ? 'secondary' : 'primary'} onClick={() => setBrand(name)} disabled={on} aria-label={on ? `${label} is in use` : `Use ${label}`}>
          {on ? 'In use' : `Use ${label}`}
        </Button>
      </div>
    </ThemeProvider>
  );
}

export function WelcomePage() {
  const match = matchPosting(SAMPLE_POSTING, SAMPLE_RESUME);
  const start = (path: string) => {
    markWelcomed();
    go(path);
  };
  const ordered = [...themes].sort((a, b) => THEME_ORDER.indexOf(a.name) - THEME_ORDER.indexOf(b.name));

  return (
    <div className="f-page w-page">
      <section className="w-hero">
        <div className="w-hero-text">
          <p className="w-eyebrow">A resume maker and job tracker</p>
          <h1 className="w-title" id="page-title" tabIndex={-1}>
            Tailor your resume to every job. Remember exactly what you sent.
          </h1>
          <p className="w-lead">Folio checks your resume against each job posting, keeps the version you sent with every application, and reminds you when to follow up. Free, with nothing to sign up for.</p>
          <div className="w-cta">
            <Button size="lg" iconRight={<Icon name="arrow" />} onClick={() => start('/')}>
              Try it with a sample
            </Button>
            <Button size="lg" variant="secondary" onClick={() => start('/new')}>
              Start my resume
            </Button>
          </div>
        </div>
        <div className="w-hero-art" aria-hidden="true">
          <div className="w-hero-page">
            <ScaledPaper resume={SAMPLE_RESUME} />
          </div>
          <Card className="w-hero-match" title="Frontend lead at Globex" eyebrow="Match">
            <Progress value={match.found} max={match.total} label={`Shows ${match.found} of ${match.total} things they ask for`} />
            <div className="f-chips">
              {match.terms
                .filter((t) => t.skill)
                .slice(0, 6)
                .map((t) => (
                  <Badge key={t.term} tone={t.found ? 'success' : 'warning'} dot={t.found}>
                    {t.term}
                  </Badge>
                ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="w-section" aria-labelledby="w-features">
        <h2 id="w-features" className="w-h2">
          What other resume makers don’t do
        </h2>
        <div className="w-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="w-feature">
              <span className="w-feature-icon">
                <Icon name={f.icon} />
              </span>
              <b>{f.title}</b>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-section" aria-labelledby="w-themes">
        <h2 id="w-themes" className="w-h2">
          Job hunting is hard enough. Make it look like you.
        </h2>
        <p className="w-section-lead">Four looks for the app, in light and dark. Your resume itself always prints clean and professional.</p>
        <div className="w-themes">
          {ordered.map((t) => (
            <ThemeCard key={t.name} name={t.name} label={t.label} />
          ))}
        </div>
      </section>

      <section className="w-section" aria-labelledby="w-promises">
        <h2 id="w-promises" className="w-h2">
          Our promises
        </h2>
        <ul className="w-promises">
          {PROMISES.map((p) => (
            <li key={p.title}>
              <Icon name="check" />
              <div>
                <b>{p.title}</b>
                <p>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="w-final">
        <h2 className="w-h2">Your next application starts here.</h2>
        <Button size="lg" iconRight={<Icon name="arrow" />} onClick={() => start('/')}>
          Open Folio
        </Button>
      </section>
    </div>
  );
}
