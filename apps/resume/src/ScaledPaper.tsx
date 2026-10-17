// A Paper scaled down to fit its container's width, keeping the page's proportions.
import { useLayoutEffect, useRef, useState } from 'react';
import { Paper } from './Paper';
import type { Resume } from './store';

const PAGE_W = 816; // 8.5in at 96dpi
const PAGE_H = 1056; // 11in

export function ScaledPaper({ resume }: { resume: Resume }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PAGE_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="f-scaled" style={{ height: PAGE_H * scale }}>
      <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <Paper resume={resume} />
      </div>
    </div>
  );
}
