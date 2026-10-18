import { Fragment, useEffect, useState } from 'react';
import { Avatar, Badge, Button, Card, Icon, Mosaic, Progress, Skeleton, Toast } from '@tessera-design/react';

function Words({ text, start }: { text: string; start: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          <span className={'sc-w' + (w === 'tiles.' ? ' sc-tile' : '')} style={{ animationDelay: `${start + i * 70}ms` }}>
            {w}
          </span>{' '}
        </Fragment>
      ))}
    </>
  );
}

function Count({ to, delay }: { to: number; delay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let t0: number | null = null;
    const wait = setTimeout(() => {
      const step = (t: number) => {
        t0 ??= t;
        const k = Math.min(1, (t - t0) / 1200);
        setN(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(wait);
      cancelAnimationFrame(raf);
    };
  }, [to, delay]);
  return <span className="sc-big">{n}</span>;
}

/** The landing hero, built only from Tessera parts. Laid out at 1200×640. */
export function Showcase({ componentCount }: { componentCount: number }) {
  return (
    <div className="sc">
      <div className="sc-copy">
        <Badge tone="brand" live>
          Tessera 0.1 · {componentCount} components
        </Badge>
        <h1 className="sc-h">
          <Words text="Build in tiles." start={100} />
          <br />
          <Words text="Ship the whole picture." start={330} />
        </h1>
        <p className="sc-lead">A bold design system for product teams: tokens, type and {componentCount} React components that move like they mean it. Light and dark, accessible by default.</p>
        <div className="sc-ctas">
          <Button variant="tile" size="lg" iconRight={<Icon name="arrow" />} onClick={() => (location.hash = 'start')}>
            Start building
          </Button>
          <Button variant="ghost" size="lg" onClick={() => (location.hash = 'c-Button')}>
            Browse components
          </Button>
        </div>
        <span className="sc-install">
          $ npm i <b>@tessera-design/react</b>
        </span>
      </div>
      <div className="sc-art">
        <Mosaic columns={12} rows={11} seed={23} gap={7} />
        <div className="sc-float sc-resume">
          <Card>
            <div className="sc-row">
              <Avatar name="Ada Lovelace" size={44} />
              <div>
                <div className="sc-name">Ada Lovelace</div>
                <div className="sc-role">Staff Engineer · London</div>
              </div>
            </div>
            <div className="sc-type">Led the analytical engine rewrite, 4× faster.</div>
            <Skeleton lines={2} height={9} />
            <Progress label="Resume complete" value={4} max={5} steps />
          </Card>
        </div>
        <div className="sc-float sc-chip">
          <Card>
            <span className="ts-card-eyebrow">Template</span>
            <div className="sc-name">Grid</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Badge tone="accent">New</Badge>
              <Badge tone="brand">2 col</Badge>
            </div>
          </Card>
        </div>
        <div className="sc-float sc-score">
          <Card>
            <span className="ts-card-eyebrow">ATS match</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <Count to={94} delay={2000} />
              <span className="sc-role">/ 100</span>
            </div>
          </Card>
        </div>
        <div className="sc-float sc-toast">
          <Toast icon="success" title="Exported" duration={5000} style={{ animation: 'none' }}>
            ada-lovelace-resume.pdf
          </Toast>
        </div>
      </div>
    </div>
  );
}
