// Fails when the gzipped build grows past its budget. Budgets live in package.json under "sizeBudgets" (bytes, gzipped).
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const budgets = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).sizeBudgets;
let failed = false;
for (const [file, budget] of Object.entries(budgets)) {
  const size = gzipSync(readFileSync(join(root, file))).length;
  const pct = Math.round((size / budget) * 100);
  const ok = size <= budget;
  failed ||= !ok;
  console.log(`${ok ? 'ok  ' : 'OVER'} ${file.padEnd(18)} ${(size / 1024).toFixed(1).padStart(5)} KB gzipped  (${pct}% of ${(budget / 1024).toFixed(0)} KB)`);
}
if (failed) {
  console.error('\nBundle over budget. Trim it, or raise the budget in packages/react/package.json with a reason in the PR.');
  process.exit(1);
}
