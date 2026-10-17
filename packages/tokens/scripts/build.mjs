// Builds dist/ from tokens.json: tokens.css (CSS variables for both themes plus type classes),
// index.js (the tokens as data) and index.d.ts (token names as string unions).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const out = join(root, 'dist');
mkdirSync(out, { recursive: true });

const [first, second] = tokens.color.themes.map((t) => t.id);
const alias = (v) => {
  const m = /^\{(.+)\}$/.exec(v);
  return m ? `var(--${m[1]})` : v;
};

const light = [];
const dark = [];
for (const t of [...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])]) {
  if (typeof t.value === 'string') {
    light.push(`--${t.name}: ${alias(t.value)};`);
    // Aliases resolve where they are declared, so a [data-theme] subtree needs its own copy.
    if (/^\{.+\}$/.test(t.value)) dark.push(`--${t.name}: ${alias(t.value)};`);
    continue;
  }
  light.push(`--${t.name}: ${alias(t.value[first])};`);
  if (second && t.value[second] !== undefined) dark.push(`--${t.name}: ${alias(t.value[second])};`);
}

const scalarFamilies = Object.keys(tokens).filter(
  (k) => !['name', 'version', 'color', 'type', 'shadow'].includes(k) && Array.isArray(tokens[k]?.tokens)
);
const scalars = scalarFamilies.flatMap((k) => tokens[k].tokens.map((t) => `--${t.name}: ${t.value};`));
const families = Object.entries(tokens.type.families).map(([k, v]) => `--font-${k}: ${v};`);

const indent = (lines, n) => lines.map((l) => ' '.repeat(n) + l).join('\n');
const typeClasses = tokens.type.groups.flatMap((g) =>
  g.styles.map((s) => {
    const decl = [
      `font-family: var(--font-${s.family ?? g.family});`,
      `font-size: ${s.fontSize};`,
      `line-height: ${s.lineHeight};`,
      `font-weight: ${s.fontWeight};`,
      s.letterSpacing && `letter-spacing: ${s.letterSpacing};`,
      s.opticalSize && `font-variation-settings: 'opsz' ${s.opticalSize};`
    ].filter(Boolean);
    return `.${s.name} {\n${indent(decl, 2)}\n}`;
  })
);

// Theme colors are declared on :root and on any [data-theme] element, so a subtree can switch theme.
const css = `/* ${tokens.name} tokens, generated from tokens.json. Do not edit by hand. */
:root {
${indent([...scalars, ...families], 2)}
}

:root,
[data-theme="${first}"] {
${indent([...light, 'color-scheme: light;'], 2)}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="${first}"]) {
${indent([...dark, 'color-scheme: dark;'], 4)}
  }
}

[data-theme="${second}"] {
${indent([...dark, 'color-scheme: dark;'], 2)}
}

${typeClasses.join('\n\n')}
`;
writeFileSync(join(out, 'tokens.css'), css);

writeFileSync(
  join(out, 'index.js'),
  `// Generated from tokens.json.\nexport const tokens = ${JSON.stringify(tokens, null, 2)};\n\n` +
    `/** \`var(--name)\` for any token, for use in inline styles and CSS-in-JS. */\nexport const cssVar = (name) => \`var(--\${name})\`;\n`
);

const union = (names) => names.map((n) => JSON.stringify(n)).join(' | ') || 'never';
const colorNames = tokens.color.tokens.map((t) => t.name);
const otherNames = [...(tokens.shadow?.tokens ?? []), ...scalarFamilies.flatMap((k) => tokens[k].tokens)].map((t) => t.name);
const styleNames = tokens.type.groups.flatMap((g) => g.styles.map((s) => s.name));
writeFileSync(
  join(out, 'index.d.ts'),
  `// Generated from tokens.json.
export type ColorToken = ${union(colorNames)};
export type ScaleToken = ${union(otherNames)};
export type FontToken = ${union(Object.keys(tokens.type.families).map((k) => 'font-' + k))};
export type TokenName = ColorToken | ScaleToken | FontToken;
export type TypeStyle = ${union(styleNames)};
export declare const tokens: {
  name: string;
  version: number;
  color: { themes: { id: string; name: string }[]; tokens: { name: ColorToken; value: string | Record<string, string>; usage: string }[] };
  type: { fonts: unknown[]; families: Record<string, string>; groups: { name: string; family: string; styles: { name: TypeStyle; fontSize: string; lineHeight: string; fontWeight: number; letterSpacing?: string; opticalSize?: number; sample?: string; usage?: string }[] }[] };
  [family: string]: any;
};
export declare function cssVar(name: TokenName): string;
`
);

console.log(`tokens: ${colorNames.length} colors, ${otherNames.length} scale tokens, ${styleNames.length} type styles → dist/`);
