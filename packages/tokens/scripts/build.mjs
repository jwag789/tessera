// Builds dist/ from tokens.json: tokens.css (CSS variables for both themes plus type classes),
// index.js (the tokens as data) and index.d.ts (token names as string unions).
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
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

// Theme packs (read here so the base can reset tokens that only some themes define).
const themeDir = join(root, 'themes');
const themeFiles = readdirSync(themeDir).filter((f) => f.endsWith('.json'));
const themeDefs = themeFiles.map((f) => JSON.parse(readFileSync(join(themeDir, f), 'utf8')));
const baseNames = new Set([...tokens.color.tokens, ...(tokens.shadow?.tokens ?? [])].map((t) => t.name));
const ownNames = (t) => [...(t.color?.tokens ?? []), ...(t.shadow?.tokens ?? [])].map((x) => x.name);
// Tokens only some themes define (e.g. Cartridge's label-*) are reset elsewhere, so a nested theme doesn't inherit them.
const extraNames = [...new Set(themeDefs.flatMap(ownNames).filter((n) => !baseNames.has(n)))];
const resetsFor = (own) => extraNames.filter((n) => !own.has(n)).map((n) => `--${n}: initial;`);

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
:root,
[data-brand="tessera"] {
${indent([...scalars, ...families, ...resetsFor(new Set())], 2)}
}

:root,
[data-theme="${first}"],
[data-brand="tessera"],
[data-brand="tessera"][data-theme="${first}"] {
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

// ---------- Theme packs: themes/*.json → dist/themes/<name>.css ----------
// A theme overrides any subset of tokens. It applies wherever data-brand="<name>" is set, in both modes,
// and its selectors are specific enough to win over the base tokens regardless of mode.
// Each theme starts from the full base set, so a theme nested inside another doesn't inherit the outer one's values.
const themeMeta = [];
mkdirSync(join(out, 'themes'), { recursive: true });
for (const [i, file] of themeFiles.entries()) {
  const t = themeDefs[i];
  const sel = `[data-brand="${t.name}"]`;
  const tLight = [...light];
  const tDark = [...dark];
  for (const tok of [...(t.color?.tokens ?? []), ...(t.shadow?.tokens ?? [])]) {
    if (typeof tok.value === 'string') {
      tLight.push(`--${tok.name}: ${alias(tok.value)};`);
      if (/^\{.+\}$/.test(tok.value)) tDark.push(`--${tok.name}: ${alias(tok.value)};`);
      continue;
    }
    tLight.push(`--${tok.name}: ${alias(tok.value[first])};`);
    if (tok.value[second] !== undefined) tDark.push(`--${tok.name}: ${alias(tok.value[second])};`);
  }
  const tScalars = Object.keys(t)
    .filter((k) => !['name', 'label', 'description', 'fonts', 'color', 'type', 'shadow'].includes(k) && Array.isArray(t[k]?.tokens))
    .flatMap((k) => t[k].tokens.map((x) => `--${x.name}: ${x.value};`));
  const tFamilies = Object.entries(t.type?.families ?? {}).map(([k, v]) => `--font-${k}: ${v};`);
  const tResets = resetsFor(new Set(ownNames(t)));
  const tcss = `/* ${tokens.name} theme: ${t.label ?? t.name}. Generated from themes/${file}. Load after the base tokens and set data-brand="${t.name}". */
${sel} {
${indent([...scalars, ...families, ...tScalars, ...tFamilies, ...tResets], 2)}
}

${sel},
${sel}[data-theme="${first}"] {
${indent([...tLight, 'color-scheme: light;'], 2)}
}

@media (prefers-color-scheme: dark) {
  ${sel}:not([data-theme="${first}"]) {
${indent([...tDark, 'color-scheme: dark;'], 4)}
  }
}

${sel}[data-theme="${second}"] {
${indent([...tDark, 'color-scheme: dark;'], 2)}
}
`;
  writeFileSync(join(out, 'themes', `${t.name}.css`), tcss);
  if (t.fonts) writeFileSync(join(out, 'themes', `${t.name}-fonts.css`), `/* Fonts for the ${t.label ?? t.name} theme. */\n@import url('${t.fonts}');\n`);
  themeMeta.push({ name: t.name, label: t.label ?? t.name, description: t.description ?? '', fonts: t.fonts ?? null });
}
writeFileSync(
  join(out, 'index.js'),
  readFileSync(join(out, 'index.js'), 'utf8') +
    `\n/** Theme packs: import '@tessera/tokens/themes/<name>.css' and set data-brand="<name>". */\nexport const themes = ${JSON.stringify([{ name: 'tessera', label: tokens.name, description: 'The default: bold lapis with one saffron tile out of place.', fonts: null }, ...themeMeta], null, 2)};\n`
);
writeFileSync(
  join(out, 'index.d.ts'),
  readFileSync(join(out, 'index.d.ts'), 'utf8') +
    `export type ThemeName = ${['tessera', ...themeMeta.map((m) => m.name)].map((n) => JSON.stringify(n)).join(' | ')};\nexport declare const themes: { name: ThemeName; label: string; description: string; fonts: string | null }[];\n`
);

console.log(`tokens: ${colorNames.length} colors, ${otherNames.length} scale tokens, ${styleNames.length} type styles, themes: ${themeMeta.map((m) => m.name).join(', ')} → dist/`);
