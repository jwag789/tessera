// Writes dist/styles.css (tokens + component styles, one import for consumers) and dist/fonts.css.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const tokensCss = readFileSync(require.resolve('@tessera-design/tokens/tokens.css'), 'utf8');
const componentsCss = readFileSync(join(root, 'src/styles.css'), 'utf8');
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/styles.css'), tokensCss + '\n' + componentsCss);
writeFileSync(join(root, 'dist/fonts.css'), readFileSync(join(root, 'src/fonts.css'), 'utf8'));
// Theme packs: the tokens' theme CSS plus this package's component treatments, one file per theme.
import { existsSync, readdirSync, rmSync } from 'node:fs';
const tokenThemes = join(dirname(require.resolve('@tessera-design/tokens/tokens.css')), 'themes');
rmSync(join(root, 'dist/themes'), { recursive: true, force: true });
mkdirSync(join(root, 'dist/themes'), { recursive: true });
const built = [];
for (const f of readdirSync(tokenThemes)) {
  const src = readFileSync(join(tokenThemes, f), 'utf8');
  const extra = join(root, 'src/themes', f);
  writeFileSync(join(root, 'dist/themes', f), existsSync(extra) && !f.endsWith('-fonts.css') ? src + '\n' + readFileSync(extra, 'utf8') : src);
  built.push(f);
}
console.log(`css: dist/styles.css, dist/fonts.css, themes: ${built.join(', ')}`);
