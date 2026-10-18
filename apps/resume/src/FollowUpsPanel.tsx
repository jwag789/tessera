// Above the applications table: jobs that have gone quiet, and what's coming up on a calendar.
import { useState } from 'react';
import { Avatar, Button, Calendar } from '@tessera-design/react';
import { addDays, nudges, upcoming } from './followups';
import { formatDay, fromIsoDay, toIsoDay, useStore } from './store';
import type { Application } from './store';

export function FollowUps({ onOpen }: { onOpen: (a: Application) => void }) {
  const { applications, saveApplication } = useStore();
  const today = toIsoDay(new Date());
  const quiet = nudges(applications, today);
  const soon = upcoming(applications, today);
  const [day, setDay] = useState<string | null>(null);
  const onDay = day ? soon.filter((a) => a.nextStep!.date === day) : soon;
  const byDate = new Map<string, Application[]>();
  for (const a of soon) byDate.set(a.nextStep!.date, [...(byDate.get(a.nextStep!.date) ?? []), a]);

  if (!quiet.length && !soon.length) return null;
  const remind = (a: Application, days: number) => saveApplication({ ...a, followUpOn: addDays(today, days) });

  return (
    <div className="f-follow">
      {quiet.length > 0 && (
        <section className="f-panel" data-surface="label" aria-labelledby="nudge-head">
          <div className="f-panel-head">
            <h2 id="nudge-head">Needs a nudge</h2>
          </div>
          <ul className="f-nudges">
            {quiet.map(({ app, reason }) => (
              <li key={app.id} className="f-nudge">
                <span aria-hidden="true">
                  <Avatar name={app.company} size={32} />
                </span>
                <div className="f-nudge-text">
                  <button type="button" className="f-link ts-focus" onClick={() => onOpen(app)}>
                    <b>{app.company}</b>
                  </button>
                  <span>{reason}</span>
                </div>
                <div className="f-nudge-actions">
                  <Button size="sm" variant="secondary" onClick={() => remind(app, 7)}>
                    I followed up
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remind(app, 3)}>
                    In 3 days
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {soon.length > 0 && (
        <section className="f-panel" data-surface="label" aria-labelledby="soon-head">
          <div className="f-panel-head">
            <h2 id="soon-head">Coming up</h2>
            {day && (
              <Button size="sm" variant="ghost" onClick={() => setDay(null)}>
                Show the next 30 days
              </Button>
            )}
          </div>
          <div className="f-soon">
            <Calendar
              className="f-soon-cal"
              value={fromIsoDay(day)}
              onChange={(d) => setDay(toIsoDay(d))}
              isMarked={(d) => {
                const items = byDate.get(toIsoDay(d));
                return items ? items.map((a) => `${a.nextStep!.label}, ${a.company}`).join('; ') : false;
              }}
            />
            <ul className="f-soon-list">
              {onDay.map((a) => (
                <li key={a.id}>
                  <time>{formatDay(a.nextStep!.date)}</time>
                  <button type="button" className="f-link ts-focus" onClick={() => onOpen(a)}>
                    <b>{a.nextStep!.label}</b>
                    <span>{a.company}</span>
                  </button>
                </li>
              ))}
              {!onDay.length && <li className="f-meta">Nothing on {day ? formatDay(day) : 'the calendar'}.</li>}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
