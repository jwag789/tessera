// The editor's preview: the page (does it fit on one?) and what an applicant-tracking system reads from it.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Icon, Popover, Slider, Switch, Tabs, useToast } from '@tessera/react';
import { Paper } from './Paper';
import { PAGE_H, PAGE_W, ScaledPaper } from './ScaledPaper';
import type { Resume } from './store';

// How far Fit to one page will go before asking for shorter content instead.
const MIN_MARGIN = 0.6;
const MIN_SCALE = 0.85;
const pct = (n: number) => `${Math.round(n * 100)}%`;

function PageTab({ resume, onLayout }: { resume: Resume; onLayout: (l: { scale: number; margin: number }) => void }) {
  const { toast } = useToast();
  const layout = { scale: resume.layout?.scale ?? 1, margin: resume.layout?.margin ?? 1 };
  const [height, setHeight] = useState(PAGE_H);
  const [showBreak, setShowBreak] = useState(true);
  const [fitting, setFitting] = useState(false);
  const pages = height / PAGE_H;
  const fits = height <= PAGE_H + 1;

  // Fit to one page: one step per measurement, margins first, then text size, until it fits or hits the floor.
  useEffect(() => {
    if (!fitting) return;
    if (fits) {
      setFitting(false);
      toast({ title: 'Fits on one page', description: `Text ${pct(layout.scale)}, margins ${pct(layout.margin)}`, icon: 'success' });
      return;
    }
    if (layout.margin > MIN_MARGIN + 0.001) onLayout({ ...layout, margin: Math.max(MIN_MARGIN, +(layout.margin - 0.1).toFixed(2)) });
    else if (layout.scale > MIN_SCALE + 0.001) onLayout({ ...layout, scale: Math.max(MIN_SCALE, +(layout.scale - 0.025).toFixed(3)) });
    else {
      setFitting(false);
      toast({ title: 'Still runs onto a second page', description: 'Smaller would be hard to read. Cut a line or two instead.', icon: 'warning' });
    }
    // Re-run when the new layout has been measured.
  }, [fitting, height]);

  return (
    <div className="f-form">
      <div className="f-fit-bar">
        {fits ? (
          <Badge tone="success" dot>
            Fits on one page
          </Badge>
        ) : (
          <Badge tone="warning" dot>
            Runs onto page 2 ({pages.toFixed(1)} pages)
          </Badge>
        )}
        <span className="f-fit-tools">
          {!fits && (
            <Button size="sm" onClick={() => setFitting(true)} loading={fitting}>
              Fit to one page
            </Button>
          )}
          <Popover
            title="Page settings"
            width={300}
            placement="bottom-end"
            trigger={
              <Button size="sm" variant="secondary" iconLeft={<Icon name="settings" />}>
                Adjust
              </Button>
            }
          >
            <div className="f-form">
              <Slider label="Text size" min={0.85} max={1.1} step={0.025} value={layout.scale} onChange={(v) => onLayout({ ...layout, scale: v })} format={pct} />
              <Slider label="Margins" min={MIN_MARGIN} max={1.2} step={0.05} value={layout.margin} onChange={(v) => onLayout({ ...layout, margin: v })} format={pct} />
              <Switch label="Show where page 1 ends" checked={showBreak} onChange={(e) => setShowBreak(e.target.checked)} />
              <Button size="sm" variant="ghost" onClick={() => onLayout({ scale: 1, margin: 1 })} disabled={layout.scale === 1 && layout.margin === 1}>
                Reset to the template’s defaults
              </Button>
            </div>
          </Popover>
        </span>
      </div>
      <div className="f-preview">
        <ScaledPaper resume={resume} showBreak={showBreak} onMeasure={setHeight} />
      </div>
    </div>
  );
}

/** The page's text in the order it's laid out, which is also the order a PDF reads in. */
function RobotTab({ resume }: { resume: Resume }) {
  const page = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const { toast } = useToast();
  useLayoutEffect(() => {
    setText((page.current?.innerText ?? '').replace(/\n{3,}/g, '\n\n').trim());
  }, [resume]);
  const p = resume.profile;
  const checks: { ok: boolean; text: string }[] = [
    { ok: !!p.email.trim(), text: p.email.trim() ? 'Email address is in the text' : 'Add an email address; it’s how they reply' },
    { ok: !!p.phone.trim(), text: p.phone.trim() ? 'Phone number is in the text' : 'Consider adding a phone number' },
    { ok: resume.experience.every((e) => e.start), text: resume.experience.every((e) => e.start) ? 'Every job has a start date' : 'Some jobs have no dates; systems often rank those lower' },
    { ok: resume.skills.length >= 3, text: resume.skills.length >= 3 ? 'Skills are listed as plain words' : 'List your skills; they’re what systems search for' }
  ];
  return (
    <div className="f-form">
      <p className="f-dialog-text">Applicant-tracking systems read your PDF as plain text before a person sees it. This is that text, in the order it comes out.</p>
      {resume.template === 'modern' && (
        <Alert tone="warning" title="Two-column layouts can come out of order">
          The sidebar is read first here, above your summary and experience. Most systems cope, but Classic and Compact read straight down.
        </Alert>
      )}
      <ul className="f-checks">
        {checks.map((c) => (
          <li key={c.text} className={c.ok ? 'f-check-ok' : 'f-check-todo'}>
            <Icon name={c.ok ? 'check' : 'info'} />
            {c.text}
          </li>
        ))}
      </ul>
      <div className="f-robot">
        <div className="f-robot-head">
          <span>Plain text</span>
          <Button
            size="sm"
            variant="ghost"
            iconLeft={<Icon name="copy" />}
            onClick={() =>
              navigator.clipboard?.writeText(text).then(
                () => toast({ title: 'Copied the plain text', icon: 'success' }),
                () => toast({ title: 'Couldn’t copy', description: 'Select the text and copy it instead.', icon: 'info' })
              )
            }
          >
            Copy
          </Button>
        </div>
        <pre tabIndex={0} aria-label="Plain text of your resume">
          {text}
        </pre>
      </div>
      {/* Laid out off screen at full size so innerText reflects the real reading order. */}
      <div ref={page} className="f-offscreen" aria-hidden="true" style={{ width: PAGE_W }}>
        <Paper resume={resume} />
      </div>
    </div>
  );
}

export function Preview({ resume, onLayout }: { resume: Resume; onLayout: (l: { scale: number; margin: number }) => void }) {
  return (
    <Tabs
      label="Preview"
      items={[
        { id: 'page', label: 'Page', content: <PageTab resume={resume} onLayout={onLayout} /> },
        { id: 'robot', label: 'What the robot sees', content: <RobotTab resume={resume} /> }
      ]}
    />
  );
}
