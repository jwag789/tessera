import { describe, expect, it } from 'vitest';
import { computePosition } from '../src/positioning';
import { paginationRange } from '../src/components/Navigation';
import { fuzzyScore } from '../src/components/CommandPalette';
import { addMonths, monthGrid } from '../src/components/DatePicker';
import { nextEnabled } from '../src/components/Select';
import { cx, rng } from '../src/utils';

const viewport = { width: 1000, height: 800 };
const size = { width: 200, height: 100 };

describe('computePosition', () => {
  it('places below and aligned to the start', () => {
    const p = computePosition({ top: 100, left: 100, width: 80, height: 40 }, size, 'bottom-start', { viewport, offset: 8 });
    expect(p).toMatchObject({ x: 100, y: 148, side: 'bottom' });
  });

  it('flips to the top when there is no room below', () => {
    const p = computePosition({ top: 740, left: 100, width: 80, height: 40 }, size, 'bottom', { viewport });
    expect(p.side).toBe('top');
    expect(p.y).toBe(740 - 100 - 8);
  });

  it('keeps the preferred side when neither side fits better', () => {
    const p = computePosition({ top: 20, left: 100, width: 80, height: 760 }, size, 'bottom', { viewport });
    expect(p.side).toBe('bottom');
  });

  it('shifts along the cross axis to stay inside the viewport', () => {
    const p = computePosition({ top: 100, left: 960, width: 30, height: 30 }, size, 'bottom-start', { viewport, pad: 8 });
    expect(p.x).toBe(1000 - 200 - 8);
  });

  it('centers on left and right placements', () => {
    const p = computePosition({ top: 300, left: 400, width: 40, height: 40 }, { width: 100, height: 20 }, 'right', { viewport, offset: 10 });
    expect(p).toMatchObject({ x: 450, y: 310, side: 'right' });
  });
});

describe('paginationRange', () => {
  it('lists every page when there are few', () => {
    expect(paginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it('collapses the end near the start', () => {
    expect(paginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'gap', 20]);
  });
  it('collapses both sides in the middle', () => {
    expect(paginationRange(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
  });
  it('collapses the start near the end', () => {
    expect(paginationRange(20, 20)).toEqual([1, 'gap', 16, 17, 18, 19, 20]);
  });
  it('never hides a single page behind a gap', () => {
    for (let page = 1; page <= 30; page++) {
      const r = paginationRange(page, 30);
      r.forEach((t, i) => {
        if (t === 'gap') expect((r[i + 1] as number) - (r[i - 1] as number)).toBeGreaterThan(2);
      });
      expect(r).toContain(page);
    }
  });
});

describe('fuzzyScore', () => {
  it('rejects text missing a character', () => {
    expect(fuzzyScore('Export PDF', 'xz')).toBe(-1);
  });
  it('ranks prefix and word-start matches above scattered ones', () => {
    expect(fuzzyScore('Export PDF', 'exp')).toBeGreaterThan(fuzzyScore('Open settings and export', 'exp'));
    expect(fuzzyScore('New resume', 'nr')).toBeGreaterThan(fuzzyScore('Inner work', 'nr'));
  });
});

describe('dates', () => {
  it('builds a 6-week grid starting on Sunday', () => {
    const g = monthGrid(new Date(2026, 9, 1));
    expect(g).toHaveLength(42);
    expect(g[0].getDay()).toBe(0);
    expect(g.find((d) => d.getMonth() === 9)?.getDate()).toBe(1);
  });
  it('starts on Monday when asked', () => {
    expect(monthGrid(new Date(2026, 9, 1), 1)[0].getDay()).toBe(1);
  });
  it('clamps the day when adding months', () => {
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
  });
});

describe('utils', () => {
  it('cx drops falsy values', () => {
    expect(cx('a', false, null, undefined, 0, '', 'b')).toBe('a b');
  });
  it('rng is deterministic', () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('nextEnabled skips disabled options and wraps', () => {
    const opts = [{}, { disabled: true }, {}];
    expect(nextEnabled(opts, 1, 1)).toBe(2);
    expect(nextEnabled(opts, 3, 1)).toBe(0);
    expect(nextEnabled(opts, 1, -1)).toBe(0);
  });
});
