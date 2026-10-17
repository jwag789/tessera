// The achievement lines under one job: each with coach hints, linked to the bank or written just here.
import { useLayoutEffect, useRef, useState } from 'react';
import { Badge, Button, DropdownMenu, Icon, Popover, TextField, Tooltip } from '@tessera/react';
import type { MenuItem } from '@tessera/react';
import { coach } from './coach';
import { uid, useStore } from './store';
import type { Point } from './store';

/** A textarea that grows with its line, styled like the library's inputs. */
function LineInput({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) {
  const el = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const t = el.current;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = `${t.scrollHeight + 2}px`;
  }, [value]);
  return <textarea ref={el} className="ts-input ts-textarea f-point-input" rows={1} aria-label={label} placeholder="e.g. Cut page load from 3.1s to 1.2s" value={value} onChange={(e) => onChange(e.target.value)} />;
}

function BankPicker({ taken, onPick }: { taken: Set<string>; onPick: (id: string) => void }) {
  const { achievements, resumes } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const uses = (id: string) => resumes.filter((r) => r.experience.some((e) => e.points.some((p) => p.ref === id))).length;
  const shown = achievements.filter((a) => !taken.has(a.id) && a.text.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title="Add from your achievement bank"
      width={380}
      placement="bottom-start"
      trigger={
        <Button size="sm" variant="ghost" iconLeft={<Icon name="copy" />} disabled={!achievements.length}>
          Add from bank
        </Button>
      }
    >
      <div className="f-bank">
        <TextField label="Search" icon="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an achievement" />
        <ul className="f-bank-list">
          {shown.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className="f-bank-item ts-focus"
                onClick={() => {
                  onPick(a.id);
                  setOpen(false);
                  setQ('');
                }}
              >
                <span>{a.text}</span>
                <small>{uses(a.id) ? `In ${uses(a.id)} ${uses(a.id) === 1 ? 'resume' : 'resumes'}` : 'Not used yet'}</small>
              </button>
            </li>
          ))}
          {!shown.length && <li className="f-meta">{achievements.length ? 'Nothing else matches.' : 'Save a line to the bank to reuse it here.'}</li>}
        </ul>
      </div>
    </Popover>
  );
}

export function Points({ jobTitle, points, onChange }: { jobTitle: string; points: Point[]; onChange: (p: Point[]) => void }) {
  const { achievements, resumes, addAchievement, updateAchievement } = useStore();
  const usedIn = (ref: string) => resumes.filter((r) => r.experience.some((e) => e.points.some((p) => p.ref === ref))).length;
  const setAt = (i: number, patch: Partial<Point>) => onChange(points.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const moveTo = (i: number, to: number) => {
    const next = [...points];
    const [p] = next.splice(i, 1);
    next.splice(to, 0, p);
    onChange(next);
  };

  return (
    <div className="f-points">
      <span className="ts-field-label">What you did</span>
      {points.map((p, i) => {
        const linked = p.ref && achievements.some((a) => a.id === p.ref) ? p.ref : null;
        const hints = coach(p.text);
        const items: MenuItem[] = [
          linked
            ? { label: 'Unlink from bank', icon: 'x', onSelect: () => setAt(i, { ref: null }) }
            : { label: 'Save to bank', icon: 'copy', disabled: !p.text.trim(), onSelect: () => setAt(i, { ref: addAchievement(p.text.trim()).id, text: p.text.trim() }) },
          { label: 'Move up', icon: 'chevron-left', disabled: i === 0, onSelect: () => moveTo(i, i - 1) },
          { label: 'Move down', icon: 'chevron-right', disabled: i === points.length - 1, onSelect: () => moveTo(i, i + 1) },
          { type: 'separator' },
          { label: 'Remove from this job', icon: 'trash', danger: true, onSelect: () => onChange(points.filter((_, j) => j !== i)) }
        ];
        return (
          <div key={p.id} className={'f-point' + (linked ? ' f-point-linked' : '')}>
            <div className="f-point-row">
              <LineInput
                value={p.text}
                label={`Achievement ${i + 1} for ${jobTitle}`}
                // A linked line edits the bank entry, which rewrites it in every resume that uses it.
                onChange={(v) => (linked ? updateAchievement(linked, v) : setAt(i, { text: v }))}
              />
              <DropdownMenu
                label={`Options for achievement ${i + 1}`}
                trigger={
                  <Button size="sm" variant="ghost" aria-label={`Options for achievement ${i + 1}`}>
                    <Icon name="more" />
                  </Button>
                }
                items={items}
              />
            </div>
            {(linked || hints.length > 0) && (
              <div className="f-point-meta">
                {linked && (
                  <Tooltip content="Edits here update every resume that uses it">
                    <span tabIndex={0} className="ts-focus f-point-badge">
                      <Badge tone="brand">In bank · {usedIn(linked) === 1 ? '1 resume' : `${usedIn(linked)} resumes`}</Badge>
                    </span>
                  </Tooltip>
                )}
                {hints.map((h) => (
                  <span key={h.id} className="f-hint">
                    <Icon name="info" />
                    {h.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="f-points-add">
        <Button size="sm" variant="secondary" iconLeft={<Icon name="plus" />} onClick={() => onChange([...points, { id: uid(), text: '' }])}>
          Add a line
        </Button>
        <BankPicker
          taken={new Set(points.map((p) => p.ref).filter((x): x is string => !!x))}
          onPick={(id) => onChange([...points, { id: uid(), text: achievements.find((a) => a.id === id)?.text ?? '', ref: id }])}
        />
      </div>
    </div>
  );
}
