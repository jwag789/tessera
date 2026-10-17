// A Paper scaled down to fit its container's width. It grows past one page when the content does, with a
// line where page 1 ends, and reports the page's real height so callers can tell whether it fits.
import { useLayoutEffect, useRef, useState } from 'react';
import { Paper } from './Paper';
import type { Resume } from './store';

export const PAGE_W = 816; // 8.5in at 96dpi
export const PAGE_H = 1056; // 11in

export function ScaledPaper({ resume, showBreak = false, onMeasure }: { resume: Resume; showBreak?: boolean; onMeasure?: (height: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [height, setHeight] = useState(PAGE_H);
  const measure = useRef(onMeasure);
  measure.current = onMeasure;
  useLayoutEffect(() => {
    const el = box.current;
    const inner = page.current;
    if (!el || !inner) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / PAGE_W));
      const h = (inner.firstElementChild as HTMLElement | null)?.offsetHeight ?? PAGE_H;
      setHeight(h);
      measure.current?.(h);
    });
    ro.observe(el);
    ro.observe(inner);
    if (inner.firstElementChild) ro.observe(inner.firstElementChild);
    return () => ro.disconnect();
  }, []);
  const over = height > PAGE_H + 1;
  return (
    <div ref={box} className="f-scaled" style={{ height: Math.max(height, PAGE_H) * scale }}>
      <div ref={page} style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: '0 0', position: 'relative' }}>
        <Paper resume={resume} />
        {showBreak && over && (
          <div className="f-break" style={{ top: PAGE_H }} aria-hidden="true">
            <span>Page 1 ends here</span>
          </div>
        )}
      </div>
    </div>
  );
}
