import { Component, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Avatar, Badge, Button, Card, Icon, Mosaic, Progress, SegmentedControl, Switch, Checkbox, Table, TextField, ThemeProvider, Toast, iconNames, useTheme, useToast } from '@tessera-design/react';
import { themes } from '@tessera-design/tokens';
import { tokens } from '@tessera-design/tokens';
import { Cover } from './Cover';
import { Showcase } from './Showcase';
import { DEMOS } from './demos';
import type { Demo } from './demos';
import { brandIntro, brandSections, componentDocs, logosDoc, md, mdInline } from './content';
import propsData from './generated/props.json';

/* ---------- shared bits ---------- */

export function useCopy() {
  const { toast } = useToast();
  return (text: string, label = 'Copied to clipboard') => {
    navigator.clipboard?.writeText(text).then(
      () => toast({ title: label, icon: 'success', duration: 2200 }),
      () => toast({ title: 'Select the text and copy it', icon: 'info', duration: 3000 })
    );
  };
}

function Head({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="d-head">
      {eyebrow && <div className="d-eyebrow">{eyebrow}</div>}
      <h1 className="d-title" tabIndex={-1} id="page-title">
        {title}
      </h1>
      {lead && <p className="d-lead" dangerouslySetInnerHTML={mdInline(lead)} />}
    </header>
  );
}

const Md = ({ src }: { src: string }) => <div className="d-md" dangerouslySetInnerHTML={md(src)} />;
const H2 = ({ children, note }: { children: ReactNode; note?: string }) => (
  <h2 className="d-h2">
    {children}
    {note && <small>{note}</small>}
  </h2>
);

function Code({ src, label }: { src: string; label?: string }) {
  const copy = useCopy();
  return (
    <div className="d-code">
      {label && <span className="d-code-label">{label}</span>}
      <pre>
        <code>{src}</code>
      </pre>
      <Button size="sm" variant="ghost" onClick={() => copy(src, 'Code copied')}>
        Copy
      </Button>
    </div>
  );
}

function TileLink({ to, kicker, title, text }: { to: string; kicker?: string; title: string; text?: string }) {
  return (
    <a className="d-tilelink" href={`#${to}`}>
      {kicker && <em>{kicker}</em>}
      <b>{title}</b>
      {text && <span>{text}</span>}
      <Icon name="arrow" />
    </a>
  );
}

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <Alert tone="danger" title="This example failed to render">
        {this.state.error.message}
      </Alert>
    ) : (
      this.props.children
    );
  }
}

function Stage({ label = 'Live example', layout = 'row', minHeight, children }: { label?: string; layout?: Demo['layout']; minHeight?: number; children: ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <div className={`d-stage d-stage-${layout}`} data-surface="label">
      <div className="d-stage-bar">
        <span>{label}</span>
        <Button size="sm" variant="ghost" onClick={() => setKey(key + 1)}>
          Replay
        </Button>
      </div>
      <div className="d-stage-body" style={{ minHeight }}>
        <Boundary key={key}>
          <div className="d-stage-content">{children}</div>
        </Boundary>
      </div>
    </div>
  );
}

/** Lays a fixed-size composition out at `w`×`h` and scales it to the available width. */
function Scaled({ w, h, children }: { w: number; h: number; children: (replayKey: number) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const fit = () => box.current && setScale(Math.min(1, box.current.clientWidth / w));
    fit();
    const ro = new ResizeObserver(fit);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div className="d-frame" ref={box} style={{ height: Math.round(h * scale) }}>
      <div className="d-frame-inner" style={{ width: w, height: h, transform: `scale(${scale})` }} key={key}>
        {children(key)}
      </div>
      <div className="d-frame-tools">
        <Button size="sm" variant="secondary" onClick={() => setKey(key + 1)}>
          Replay
        </Button>
      </div>
    </div>
  );
}

/* ---------- overview ---------- */

/** Folio ships with the docs at <base>/folio/; the dev server only serves the docs, so point at the live copy there. */
export const FOLIO_URL = import.meta.env.DEV ? 'https://jwag789.github.io/tessera/folio/' : `${import.meta.env.BASE_URL}folio/`;

function FolioBanner() {
  return (
    <section className="ts-card d-folio" aria-labelledby="folio-title">
      <div className="d-folio-text">
        <div className="d-eyebrow">Built with Tessera</div>
        <h2 id="folio-title" className="ts-card-title d-folio-title">
          Folio: a resume builder and job tracker
        </h2>
        <p className="ts-card-body d-folio-lead">A real app made only from these components and themes. Tailor your resume to each job, keep the exact version you sent, and get reminded when to follow up. Nothing to sign up for.</p>
        <div className="d-folio-actions">
          <a className="ts-btn ts-btn-tile ts-btn-lg" href={FOLIO_URL}>
            Open Folio
            <span className="ts-icon-end">
              <Icon name="arrow" />
            </span>
          </a>
          <a className="ts-btn ts-btn-ghost ts-btn-lg" href="https://github.com/jwag789/tessera/tree/main/apps/resume" target="_blank" rel="noreferrer">
            Read the source
            <Icon name="external" />
          </a>
        </div>
      </div>
      <a className="d-folio-shot" href={FOLIO_URL} tabIndex={-1} aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}folio-preview.jpg`} alt="" width={960} height={600} loading="lazy" />
      </a>
    </section>
  );
}

export function ShowcasePage() {
  return (
    <div className="d-page d-page-wide">
      <Scaled w={1200} h={640}>
        {() => <Showcase componentCount={DEMOS.length} />}
      </Scaled>
      <div className="d-grid d-grid-3">
        <TileLink to="start" kicker="Start here" title="Getting started" text="Install the packages and render your first component." />
        <TileLink to="motion" kicker="Foundations" title="Motion playground" text="Race the four easing curves side by side." />
        <TileLink to="c-CommandPalette" kicker="New" title="Command palette" text="Press ⌘K anywhere in these docs." />
      </div>
      <FolioBanner />
      <H2 note={`${DEMOS.length} components, each with a live example`}>Components</H2>
      <div className="d-grid">
        {DEMOS.map((d) => (
          <TileLink key={d.name} to={`c-${d.name}`} kicker={d.isNew ? `${d.group} · new` : d.group} title={d.name} />
        ))}
      </div>
    </div>
  );
}

export function StartPage() {
  return (
    <div className="d-page">
      <Head eyebrow="Overview" title="Getting started" lead={brandIntro} />
      <H2>Install</H2>
      <Code label="Terminal" src="npm install @tessera-design/react" />
      <Md
        src={
          'The React package brings [`@tessera-design/tokens`](https://www.npmjs.com/package/@tessera-design/tokens) with it. Install the tokens on their own to use the CSS variables without React. Both are on npm ([`@tessera-design/react`](https://www.npmjs.com/package/@tessera-design/react)) and published from GitHub Actions with provenance.'
        }
      />
      <H2>Use it</H2>
      <Code
        label="main.tsx"
        src={`import '@tessera-design/react/styles.css'; // tokens + component styles
import '@tessera-design/react/fonts.css';  // optional: the three Google Fonts
import { Button, Card, ToastProvider } from '@tessera-design/react';

export function App() {
  return (
    <ToastProvider>
      <Card variant="tile" eyebrow="Most picked" title="Grid"
        actions={<Button>Use template</Button>}>
        A two-column layout with a skills sidebar.
      </Card>
    </ToastProvider>
  );
}`}
      />
      <H2>Tokens without React</H2>
      <Md src={'Every color, size and duration is a CSS variable from `@tessera-design/tokens/tokens.css`, and the same values are importable as data: `import { tokens, cssVar } from "@tessera-design/tokens"`. Style your own UI with `var(--surface)`, `var(--ink)`, `var(--lapis)` and it follows the theme with everything else.'} />
      <H2>Themes</H2>
      <Md src={'Light is the default. Dark follows the reader’s system setting, and `data-theme="dark"` or `data-theme="light"` on `<html>` forces either one.'} />
      <H2>Principles</H2>
      <Md src={brandSections['Principles'] ?? ''} />
    </div>
  );
}

export function BrandPage() {
  return (
    <div className="d-page">
      <Head eyebrow="Overview" title="Brand" lead="The cover, the mark and how to set them. Press Replay to watch the cover assemble." />
      <Scaled w={960} h={288}>
        {() => <Cover />}
      </Scaled>
      <H2>The mark</H2>
      <div className="d-logos">
        {[
          ['tessera-mark.svg', '#f4f5f9', 'on light'],
          ['tessera-mark-mono.svg', '#ffb020', 'on saffron'],
          ['tessera-mark.svg', '#121a8f', 'on tile-ground']
        ].map(([file, bg, cap]) => (
          <div key={cap}>
            <div className="d-logo" style={{ background: bg }}>
              <img src={`${import.meta.env.BASE_URL}${file}`} alt={`Tessera mark ${cap}`} />
            </div>
            <div className="d-logo-cap">
              {file} {cap}
            </div>
          </div>
        ))}
      </div>
      <Md src={logosDoc} />
      <H2>The Mosaic</H2>
      <Md src={brandSections['The Mosaic'] ?? ''} />
    </div>
  );
}

/* ---------- themes ---------- */

const THEME_ORDER = ['tessera', 'cartridge', 'polygon', 'gloop', 'shonen', 'jelly'];
const THEME_NOTES: Record<string, string[]> = {
  tessera: ['Saturated lapis with one saffron tile', 'Tight corners, hard offset shadow', 'Bricolage Grotesque headings'],
  cartridge: ['Charcoal shell with light labels, in both modes', 'Green, red, blue and yellow keys that press down', 'Big Lilita One headings over Nunito'],
  polygon: ['Matte grey plastic with dark recessed panels', 'Hard 1-2px bevels, a menu cursor on the selection', 'Silkscreen pixel headings, Space Mono labels'],
  gloop: ['Slime green and orange, with a splash of blue and purple', 'Thick outlines, clashing shadows, everything a bit tilted', 'Luckiest Guy lettering over Fredoka'],
  shonen: ['A manga page: black ink, newsprint and one red, inverted after dark', 'Comic panels, screentone, speech bubbles, focus lines, ゴゴゴ and ドン!', 'Bangers lettering over Zen Kaku Gothic New'],
  jelly: ['Y2K candy plastic in iMac flavors, smoked after dark', 'See-through glossy surfaces, gel keys that squash, Tamagotchi LCD fields and toasts', 'Comfortaa over Quicksand, DotGothic16 on the LCD']
};

function ThemeSample({ name }: { name: string }) {
  return (
    <div className="d-sample">
      <Mosaic columns={10} rows={3} seed={name.length * 7} gap={5} interactive={false} />
      <Card eyebrow="Template" title="Grid" variant="tile" actions={<Button size="sm">Use template</Button>}>
        Two columns with a skills sidebar.
      </Card>
      <div className="d-sample-row">
        <Button size="sm">Export PDF</Button>
        <Button size="sm" variant="secondary">
          Preview
        </Button>
        <Button size="sm" variant="tile">
          Start
        </Button>
      </div>
      <div className="d-sample-row">
        <Badge tone="brand">Template</Badge>
        <Badge tone="success" dot>
          Offer
        </Badge>
        <Badge tone="danger" dot>
          Rejected
        </Badge>
        <Badge tone="accent">New</Badge>
      </div>
      <TextField label="Email" icon="mail" defaultValue="ada@lovelace.dev" />
      <div className="d-sample-row" style={{ justifyContent: 'space-between' }}>
        <Switch label="Public link" defaultChecked />
        <Avatar name="Ada Lovelace" />
      </div>
      <Progress label="Profile complete" value={3} max={5} steps />
      <Toast icon="success" title="Exported" style={{ animation: 'none', maxWidth: 'none' }}>
        resume.pdf
      </Toast>
    </div>
  );
}

export function ThemesPage() {
  const { brand, setBrand, resolvedTheme, theme, setTheme } = useTheme();
  const ordered = [...themes].sort((a, b) => THEME_ORDER.indexOf(a.name) - THEME_ORDER.indexOf(b.name));
  return (
    <div className="d-page d-page-wide">
      <Head
        eyebrow="Overview"
        title="Themes"
        lead="One set of components, six looks. Each theme is a token pack plus a few component treatments, in light and dark. Compare them here, then switch the whole site with Use this theme."
      />
      <div className="d-theme-bar">
        <SegmentedControl label="Mode for the comparison" size="sm" options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} value={theme} onChange={(v) => setTheme(v as typeof theme)} />
        <span className="demo-note">Showing {resolvedTheme} mode. The samples are live components, so hover and click them.</span>
      </div>
      <div className="d-themes">
        {ordered.map((t) => (
          <section key={t.name} className={'d-theme-col' + (brand === t.name ? ' d-theme-current' : '')} aria-labelledby={`theme-${t.name}`}>
            <ThemeProvider scope="local" theme={resolvedTheme} brand={t.name} className="d-theme-frame">
              <div className="d-theme-head">
                <h2 id={`theme-${t.name}`}>{t.label}</h2>
                {brand === t.name ? (
                  <Badge tone="success" dot>
                    In use
                  </Badge>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setBrand(t.name)}>
                    Use this theme
                  </Button>
                )}
              </div>
              <p className="d-theme-desc">{t.description}</p>
              <ul className="d-theme-notes">
                {(THEME_NOTES[t.name] ?? []).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <ThemeSample name={t.name} />
            </ThemeProvider>
          </section>
        ))}
      </div>
      <H2>Use a theme in your app</H2>
      <Code
        label="main.tsx"
        src={`import '@tessera-design/react/styles.css';
import '@tessera-design/react/themes/cartridge.css';       // the theme's tokens and treatments
import '@tessera-design/react/themes/cartridge-fonts.css'; // its fonts (every theme but Tessera)

<ThemeProvider defaultBrand="cartridge" storageKey="theme">
  <App />
</ThemeProvider>`}
      />
      <H2>Make your own</H2>
      <Md
        src={
          'A theme is a JSON file in `packages/tokens/themes/` that overrides any subset of tokens (colors for light and dark, radii, shadows, font families) and, optionally, a stylesheet in `packages/react/src/themes/` for what tokens can’t express. The build turns it into one CSS file scoped to `[data-brand="name"]`, so themes can sit side by side on one page, as they do above. A theme can also give surfaces their own palette with `label-*` tokens, the way Cartridge puts light labels on a charcoal shell and Polygon sets dark panels into grey plastic. The shipped themes meet 4.5:1 for text in both modes, on the page and inside surfaces, and `packages/react/test/themes.test.ts` checks it.'
        }
      />
    </div>
  );
}

/* ---------- foundations ---------- */

type ColorToken = (typeof tokens.color.tokens)[number];
const byName: Record<string, ColorToken> = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t]));
function resolve(name: string, theme: 'light' | 'dark', depth = 0): string | null {
  const t = byName[name];
  if (!t || depth > 8) return null;
  const v = typeof t.value === 'string' ? t.value : (t.value[theme] ?? t.value.light);
  const m = /^\{(.+)\}$/.exec(v);
  return m ? resolve(m[1], theme, depth + 1) : v;
}
function lum(hex: string | null) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  const c = [1, 3, 5].map((i) => {
    const x = parseInt(hex.substr(i, 2), 16) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a: string | null, b: string | null) {
  const x = lum(a);
  const y = lum(b);
  if (x == null || y == null) return null;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const COLOR_GROUPS: Array<[string, string[]]> = [
  ['Surfaces', ['bg', 'surface', 'surface-sunken', 'line', 'line-strong']],
  ['Text', ['ink', 'ink-muted']],
  ['Brand', ['lapis', 'lapis-hover', 'lapis-soft', 'lapis-deep', 'lapis-glow', 'on-lapis', 'on-lapis-deep']],
  ['Accent', ['saffron', 'saffron-deep', 'saffron-soft', 'on-saffron', 'inverse-accent']],
  ['Status', ['success', 'success-soft', 'warning', 'danger', 'danger-soft', 'on-danger']],
  ['Mosaic', ['tile-ground', 'tile-1', 'tile-2', 'tile-3', 'tile-4']],
  ['Utility', ['focus', 'link', 'overlay']]
];
const PAIRS = [['ink', 'bg'], ['ink-muted', 'bg'], ['ink-muted', 'surface'], ['lapis', 'surface'], ['on-lapis', 'lapis'], ['on-saffron', 'saffron'], ['on-lapis-deep', 'lapis-deep'], ['success', 'success-soft'], ['warning', 'saffron-soft'], ['danger', 'danger-soft'], ['on-danger', 'danger'], ['inverse-accent', 'ink']];

function Swatch({ name }: { name: string }) {
  const copy = useCopy();
  const t = byName[name];
  if (!t) return null;
  const same = typeof t.value === 'string' || t.value.light === t.value.dark;
  const lv = resolve(name, 'light');
  const dv = resolve(name, 'dark');
  const alias = typeof t.value === 'string' && /^\{/.test(t.value) ? t.value.slice(1, -1) : null;
  return (
    <button type="button" className="d-swatch" onClick={() => copy(`var(--${name})`, `Copied var(--${name})`)} aria-label={`Copy var(--${name})`}>
      <div className={'d-chip' + (same ? ' d-chip-one' : '')}>
        {same ? (
          <i style={{ background: `var(--${name})` }} data-l="Both themes" />
        ) : (
          <>
            <i style={{ background: lv ?? undefined }} data-l="Light" />
            <i style={{ background: dv ?? undefined }} data-l="Dark" />
          </>
        )}
      </div>
      <div className="d-sw-body">
        <span className="d-sw-name">{name}</span>
        <span className="d-sw-vals">{alias ? `alias of ${alias}` : same ? lv : `${lv} · ${dv}`}</span>
        <span className="d-sw-use">{t.usage}</span>
      </div>
    </button>
  );
}

const grade = (r: number | null) => (r == null ? '—' : r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fails');
function RatioCell({ r }: { r: number | null }) {
  return (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{r == null ? '—' : `${r.toFixed(1)}:1`}</b>
      <Badge tone={r != null && r >= 4.5 ? 'success' : r != null && r >= 3 ? 'warning' : 'danger'}>{grade(r)}</Badge>
    </span>
  );
}

export function ColorPage() {
  const rows = PAIRS.map(([fg, bg], i) => ({ id: i, fg, bg, l: ratio(resolve(fg, 'light'), resolve(bg, 'light')), d: ratio(resolve(fg, 'dark'), resolve(bg, 'dark')) }));
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Color" lead="Every color is a token with a light and a dark value. Each swatch shows both; click one to copy its CSS variable." />
      <Md src={brandSections['Color'] ?? ''} />
      {COLOR_GROUPS.map(([group, names]) => (
        <section key={group}>
          <H2>{group}</H2>
          <div className="d-swatches">
            {names.map((n) => (
              <Swatch key={n} name={n} />
            ))}
          </div>
        </section>
      ))}
      <H2 note="Computed from the token values, WCAG 2">Contrast</H2>
      <Table
        caption="Contrast of text tokens on their grounds"
        rows={rows}
        columns={[
          { key: 'sample', header: 'Sample', render: (r) => <span className="d-aa" style={{ color: `var(--${r.fg})`, background: `var(--${r.bg})` }}>Aa</span> },
          { key: 'pair', header: 'Text on ground', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{`${r.fg} on ${r.bg}`}</span> },
          { key: 'l', header: 'Light', render: (r) => <RatioCell r={r.l} /> },
          { key: 'd', header: 'Dark', render: (r) => <RatioCell r={r.d} /> }
        ]}
      />
    </div>
  );
}

const FAMILY: Record<string, [string, string]> = {
  display: ['Bricolage Grotesque', 'Display and headings, 17px and up. Optical size follows the font size.'],
  sans: ['Instrument Sans', 'Everything people read and click: body, labels, controls.'],
  mono: ['JetBrains Mono', 'Code, eyebrows, table headers and token names.']
};

export function TypePage() {
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Typography" lead="Three families from Google Fonts and thirteen styles. Each style is also a CSS class of the same name." />
      <div className="d-families">
        {Object.keys(tokens.type.families).map((k) => (
          <div className="d-family" key={k}>
            <div className="d-family-aa" style={{ fontFamily: `var(--font-${k})`, fontWeight: k === 'display' ? 800 : 500 }}>
              Aa
            </div>
            <div className="d-family-name">
              {FAMILY[k]?.[0] ?? k}
              <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}> · --font-{k}</span>
            </div>
            <div className="d-family-role">{FAMILY[k]?.[1]}</div>
            <div className="d-family-abc" style={{ fontFamily: `var(--font-${k})` }}>
              ABCDEFGHIJKLM nopqrstuvwxyz 0123456789
            </div>
          </div>
        ))}
      </div>
      {tokens.type.groups.map((g) => (
        <section key={g.name}>
          <H2>{g.name}</H2>
          <div className="d-scale">
            {g.styles.map((s) => (
              <div className="d-scale-row" key={s.name}>
                <div className={`d-scale-sample ${s.name}`} style={s.name === 'eyebrow' ? { textTransform: 'uppercase' } : undefined}>
                  {s.sample}
                </div>
                <div className="d-scale-meta">
                  <b>.{s.name}</b>
                  <span>
                    {s.fontSize} / {s.lineHeight} · {s.fontWeight}
                    {s.letterSpacing ? ` · ${s.letterSpacing}` : ''}
                  </span>
                  <span>{s.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <H2>Rules</H2>
      <Md src={brandSections['Type'] ?? ''} />
    </div>
  );
}

type Scalar = { name: string; value: string; usage?: string };
const scalars = (family: string): Scalar[] => (tokens as unknown as Record<string, { tokens: Scalar[] }>)[family]?.tokens ?? [];

export function SpacePage() {
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Space and shape" lead="A 4px grid for every gap and padding, and tight corners so shapes read as tiles." />
      <H2 note="space-*">Spacing</H2>
      <div className="d-bars">
        {scalars('spacing').map((t, i) => (
          <div className="d-bar" key={t.name} title={t.usage}>
            <span>{t.name}</span>
            <span>{t.value}</span>
            <i style={{ width: `${(parseFloat(t.value) / 96) * 100}%`, animationDelay: `${i * 40}ms` }} />
          </div>
        ))}
      </div>
      <Md src={brandSections['Space and layout'] ?? ''} />
      <H2 note="radius-*">Radius</H2>
      <div className="d-radii">
        {scalars('radius').map((t) => (
          <div className="d-radius" key={t.name}>
            <i style={{ borderRadius: t.value }} />
            <b>{t.name}</b>
            <span>
              {t.value} · {t.usage}
            </span>
          </div>
        ))}
      </div>
      <Md src={brandSections['Shape and depth'] ?? ''} />
    </div>
  );
}

export function ElevationPage() {
  const shadows = tokens.shadow.tokens as Scalar[];
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Elevation" lead="Soft shadows separate layers. The hard tile shadow is the brand gesture: one per view." />
      <div className="d-stage" data-surface="label">
        <div className="d-stage-body">
          <div className="d-shadows" style={{ width: '100%' }}>
            {shadows.map((t) => (
              <div key={t.name} className={'d-shadow' + (/tile/.test(t.name) ? ' d-shadow-tile' : '')} style={{ boxShadow: `var(--${t.name})` }}>
                <b>{t.name}</b>
                <span>{t.usage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <H2 note="z-*">Layers</H2>
      <TokenTable rows={scalars('zIndex')} caption="Z-index tokens" />
    </div>
  );
}

function TokenTable({ rows, caption }: { rows: Scalar[]; caption: string }) {
  return (
    <Table
      caption={caption}
      rowKey={(r) => r.name}
      rows={rows}
      columns={[
        { key: 'name', header: 'Token', render: (r) => <code style={{ fontFamily: 'var(--font-mono)' }}>{r.name}</code> },
        { key: 'value', header: 'Value', align: 'right' },
        { key: 'usage', header: 'Use for' }
      ]}
    />
  );
}

export function MotionPage() {
  const [on, setOn] = useState(false);
  const [dur, setDur] = useState('900');
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Motion" lead="Tiles drop into place, land with a small bounce, and lift when you touch them. Race the curves below." />
      <div className={'d-play' + (on ? ' on' : '')}>
        <div className="d-play-bar">
          <Button variant="tile" iconRight={<Icon name="arrow" />} onClick={() => setOn(!on)}>
            {on ? 'Send them back' : 'Race'}
          </Button>
          <div className="d-seg" role="group" aria-label="Duration">
            {['360', '900', '1800'].map((d) => (
              <button key={d} type="button" aria-pressed={dur === d} onClick={() => setDur(d)}>
                {d}ms
              </button>
            ))}
          </div>
        </div>
        {scalars('easing').map((e) => (
          <div className="d-lane" key={e.name}>
            <div className="d-lane-name">
              {e.name}
              <span>{e.value}</span>
            </div>
            <div className="d-track">
              <span className={'d-puck' + (e.name === 'ease-spring' ? ' d-puck-spring' : '')} style={{ transition: `left ${dur}ms ${e.value}` }} />
            </div>
          </div>
        ))}
      </div>
      <H2 note="duration-*">Durations</H2>
      <TokenTable rows={scalars('duration')} caption="Duration tokens" />
      <H2>Rules</H2>
      <Md src={brandSections['Motion'] ?? ''} />
    </div>
  );
}

const DODONT = [
  ['Export PDF', 'Click here to export', 'Buttons start with the verb and name the thing.'],
  ['Enter a complete email address.', 'Oops! Invalid input.', 'Errors say how to fix the problem. No apologies, no exclamation marks.'],
  ['3 roles · last edited today', 'Three (3) Roles Last Edited Today', 'Numerals and sentence case everywhere.'],
  ['Delete this resume?', 'Are you sure?', 'Confirmations name what will happen.']
];

export function VoicePage() {
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Voice and copy" lead="Write like a sharp colleague: plain, direct and specific." />
      <div className="d-dodont">
        {DODONT.map(([d, dont, why]) => (
          <div className="d-dd" key={d}>
            <div className="d-dd-row">
              <Badge tone="success" dot>
                Do
              </Badge>
              <q>{d}</q>
            </div>
            <div className="d-dd-row">
              <Badge tone="danger" dot>
                Don’t
              </Badge>
              <q className="d-dd-bad">{dont}</q>
            </div>
            <p>{why}</p>
          </div>
        ))}
      </div>
      <H2>Rules</H2>
      <Md src={brandSections['Voice and copy'] ?? ''} />
    </div>
  );
}

export function A11yPage() {
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Accessibility" lead="Focus is always visible, text meets 4.5:1 in both themes, and every component follows its WAI-ARIA pattern." />
      <Stage label="Click inside, then press Tab">
        <div className="demo-row">
          <Button>Export PDF</Button>
          <Button variant="secondary">Preview</Button>
          <Switch label="Public link" defaultChecked />
          <Checkbox label="Cover letter" />
        </div>
      </Stage>
      <Md src={brandSections['Focus and accessibility'] ?? ''} />
      <p className="d-md">
        Every text pair’s ratio is on the <a href="#color">Color</a> page. The component tests in <code>packages/react/test</code> check roles, names and keyboard behavior.
      </p>
    </div>
  );
}

export function IconsPage() {
  const copy = useCopy();
  return (
    <div className="d-page">
      <Head eyebrow="Foundations" title="Iconography" lead={`Line icons on a 24px grid with a 2px stroke, drawn in currentColor. ${iconNames.length} ship as <Icon name="…" />.`} />
      <div className="d-icons">
        {iconNames.map((n) => (
          <button key={n} type="button" className="d-icon ts-focus" onClick={() => copy(`<Icon name="${n}" />`, `Copied <Icon name="${n}" />`)}>
            <Icon name={n} />
            {n}
          </button>
        ))}
      </div>
      <Md src={brandSections['Iconography'] ?? ''} />
    </div>
  );
}

/* ---------- components ---------- */

export function ComponentPage({ demo }: { demo: Demo }) {
  const doc = componentDocs[demo.name] ?? { lead: '', body: '' };
  return (
    <div className="d-page">
      <Head eyebrow={`Components · ${demo.group}`} title={demo.name} lead={doc.lead} />
      <Stage layout={demo.layout} minHeight={demo.minHeight}>
        {demo.render()}
      </Stage>
      <Code label="Usage" src={demo.snippet} />
      <H2>Guidelines</H2>
      <Md src={doc.body} />
      {(demo.props ?? [demo.name]).map((name) => (
        <PropsTable key={name} name={name} showName={(demo.props ?? [demo.name]).length > 1 || name !== demo.name} />
      ))}
    </div>
  );
}

type PropRow = { name: string; type: string; required: boolean; description: string; default?: string };
const PROPS = propsData as Record<string, { props: PropRow[]; inherits: string[] }>;

function PropsTable({ name, showName }: { name: string; showName?: boolean }) {
  const entry = PROPS[name];
  if (!entry) return null;
  return (
    <section className="d-props">
      <H2 note="Generated from the TypeScript types">{showName ? `${name} props` : 'Props'}</H2>
      <Table
        caption={`${name} props`}
        rowKey={(r) => r.name}
        rows={entry.props}
        columns={[
          {
            key: 'name',
            header: 'Prop',
            render: (r) => (
              <span className="d-prop-name">
                <code>{r.name}</code>
                {r.required && <Badge tone="brand">required</Badge>}
              </span>
            )
          },
          { key: 'type', header: 'Type', render: (r) => <code className="d-prop-type">{r.type}</code> },
          { key: 'default', header: 'Default', render: (r) => (r.default ? <code className="d-prop-type d-prop-default">{r.default}</code> : <span className="d-prop-none">—</span>) },
          { key: 'description', header: 'Description', render: (r) => (r.description ? <span dangerouslySetInnerHTML={mdInline(r.description)} /> : <span className="d-prop-none">—</span>) }
        ]}
      />
      {entry.inherits.length > 0 && <p className="d-prop-inherits">Also accepts every native {entry.inherits.join(' and ')} attribute, passed straight through.</p>}
    </section>
  );
}
