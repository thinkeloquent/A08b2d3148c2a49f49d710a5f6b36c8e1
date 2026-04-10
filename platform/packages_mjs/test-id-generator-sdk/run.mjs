import fs from 'node:fs/promises';
import path from 'node:path';
import { processJsx, processHtml } from './dist/index.js';

const root = process.argv[2] || '/Users/Shared/autoload/mta-v800/platform';
const dryRun = process.argv.includes('--dry-run');

const SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', '__pycache__',
  'data', 'dataset',
]);

const EXT_MAP = { '.jsx': 'jsx', '.tsx': 'tsx', '.html': 'html' };

const config = { attribute: 'data-test-id' };
const result = { modified: [], skipped: 0, injected: 0, errors: [] };

async function walk(dir) {
  let entries;
  try { entries = await fs.readdir(dir); } catch { return; }

  for (const entry of entries) {
    const full = path.join(dir, entry);
    let stat;
    try { stat = await fs.stat(full); } catch { continue; }

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry) && !entry.startsWith('.')) await walk(full);
      continue;
    }
    if (!stat.isFile()) continue;

    const ext = path.extname(full).toLowerCase();
    const fileType = EXT_MAP[ext];
    if (!fileType) continue;

    try {
      const content = await fs.readFile(full, 'utf-8');
      const processed = fileType === 'html'
        ? processHtml(content, config)
        : processJsx(content, config);

      if (processed.modified) {
        if (!dryRun) await fs.writeFile(full, processed.code, 'utf-8');
        result.modified.push(full);
        result.injected += processed.count;
      } else {
        result.skipped++;
      }
    } catch (err) {
      result.errors.push({ file: full, error: err.message });
    }
  }
}

console.log(`Scanning: ${root}`);
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
console.log(`Attribute: ${config.attribute}`);
console.log(`Skipping: ${[...SKIP_DIRS].join(', ')}\n`);

await walk(root);

console.log(`\n--- Results ---`);
console.log(`Modified files: ${result.modified.length}`);
console.log(`IDs injected:   ${result.injected}`);
console.log(`Skipped files:  ${result.skipped}`);
console.log(`Errors:         ${result.errors.length}`);

if (result.modified.length > 0) {
  console.log(`\nModified:`);
  for (const f of result.modified) console.log(`  + ${f.replace(root + '/', '')}`);
}
if (result.errors.length > 0) {
  console.log(`\nErrors:`);
  for (const e of result.errors) console.log(`  ! ${e.file.replace(root + '/', '')}: ${e.error}`);
}
