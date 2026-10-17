// WCAG AA for every theme pack: text pairs at 4.5:1 and control edges at 3:1, in light and dark.
// A theme that re-declares its palette on surfaces (label-* tokens) is checked in both contexts:
// on the page ground and inside a surface.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

type Value = string | Record<string, string>;
interface TokenFile {
  name: string;
  color?: { tokens: { name: string; value: Value }[] };
}

const tokensDir = join(__dirname, '../../tokens');
const base = JSON.parse(readFileSync(join(tokensDir, 'tokens.json'), 'utf8')) as TokenFile;
const themes = readdirSync(join(tokensDir, 'themes'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(tokensDir, 'themes', f), 'utf8')) as TokenFile);

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function resolver(theme: TokenFile | null, mode: 'light' | 'dark', context: 'ground' | 'surface') {
  const tables = [theme?.color?.tokens ?? [], base.color!.tokens];
  const find = (name: string) => {
    for (const table of tables) {
      const hit = table.find((t) => t.name === name);
      if (hit) return hit.value;
    }
    return undefined;
  };
  const get = (name: string): string | undefined => {
    const v = (context === 'surface' && find(`label-${name}`)) || find(name);
    if (v === undefined) return undefined;
    const s = typeof v === 'string' ? v : v[mode];
    const alias = /^\{(.+)\}$/.exec(s);
    return alias ? get(alias[1]) : s;
  };
  return get;
}

const TEXT_ON_GROUND = [['ink', 'bg'], ['ink-muted', 'bg'], ['lapis', 'bg'], ['link', 'bg'], ['on-lapis', 'lapis'], ['on-saffron', 'saffron'], ['on-lapis-deep', 'lapis-deep'], ['on-danger', 'danger'], ['success', 'success-soft'], ['warning', 'saffron-soft'], ['danger', 'danger-soft'], ['lapis', 'lapis-soft'], ['inverse-accent', 'ink'], ['ink', 'surface-sunken']];
const TEXT_ON_SURFACE = [['ink', 'surface'], ['ink-muted', 'surface'], ['lapis', 'surface'], ['link', 'surface'], ['danger', 'surface'], ['on-lapis', 'lapis'], ['on-danger', 'danger'], ['ink', 'surface-sunken'], ['ink', 'bg']];
const TEXT_ON_SHELL = [['ink', 'shell-raised'], ['ink-muted', 'shell-raised'], ['lapis', 'shell-raised']];
const EDGES = [['line-strong', 'surface', 'surface'], ['line-strong', 'bg', 'ground'], ['focus', 'bg', 'ground']] as const;

describe.each([{ name: 'tessera', theme: null as TokenFile | null }, ...themes.map((t) => ({ name: t.name, theme: t }))])('$name contrast', ({ theme }) => {
  it.each(['light', 'dark'] as const)('%s mode meets AA', (mode) => {
    const failures: string[] = [];
    const check = (pairs: string[][], context: 'ground' | 'surface', min: number) => {
      const get = resolver(theme, mode, context);
      for (const [fg, bg] of pairs) {
        const a = get(fg);
        const b = get(bg);
        if (!a || !b || !a.startsWith('#') || !b.startsWith('#')) continue;
        const r = ratio(a, b);
        if (r < min) failures.push(`${fg} on ${bg} (${context}): ${r.toFixed(2)}`);
      }
    };
    check(TEXT_ON_GROUND, 'ground', 4.5);
    check(TEXT_ON_SURFACE, 'surface', 4.5);
    check(TEXT_ON_SHELL, 'ground', 4.5);
    for (const [fg, bg, context] of EDGES) check([[fg, bg]], context, 3);
    expect(failures).toEqual([]);
  });
});

describe('theme packs', () => {
  const tokensDist = join(tokensDir, 'dist/themes');

  it.each(themes.map((t) => t.name))('%s has scoped component treatments and is listed', async (name) => {
    const css = readFileSync(join(__dirname, '../src/themes', `${name}.css`), 'utf8');
    expect(css).toContain(`@scope ([data-brand="${name}"]) to ([data-brand]:not([data-brand="${name}"]))`);
    const { themes: listed } = await import('@tessera/tokens');
    expect(listed.map((t) => t.name)).toContain(name);
  });

  it.each(themes.map((t) => t.name))('%s CSS stands alone when nested in another theme', (name) => {
    const css = readFileSync(join(tokensDist, `${name}.css`), 'utf8');
    // The full base set comes first, so nothing is inherited from an outer theme…
    for (const token of ['--font-display', '--tile-1', '--focus', '--radius-full']) expect(css).toContain(`${token}:`);
    // …and tokens only other themes define are reset.
    const own = new Set((themes.find((t) => t.name === name)!.color?.tokens ?? []).map((t) => t.name));
    const foreign = themes.flatMap((t) => (t.color?.tokens ?? []).map((x) => x.name)).filter((n) => !own.has(n) && !base.color!.tokens.some((b) => b.name === n));
    for (const n of new Set(foreign)) expect(css).toContain(`--${n}: initial;`);
  });
});
