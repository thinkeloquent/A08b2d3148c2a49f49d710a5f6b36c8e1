#!/usr/bin/env node

/**
 * Non-Interactive CLI Entrypoint
 *
 * Usage:
 *   node bin/extract.mjs --repo owner/repo --branch main --root-folder src --rule-tree-name "My Rules"
 *   node bin/extract.mjs --repo owner/repo --branch main --rule-tree-name "Rules" --search "*.mjs,*.py" --ignore "*.test.mjs"
 *   node bin/extract.mjs --repo owner/repo --branch main --rule-tree-name "Rules" --upload
 *   node bin/extract.mjs --upload-file ./output/rules-repo-main-2026-03-12.json
 */

import { Command } from 'commander';
import { runExtraction, uploadFromFile } from '../src/main.mjs';

const program = new Command();

program
  .name('github_extract_conditional_logic_rule_tree_table')
  .description('Extract conditional logic from a GitHub repo and convert to rule tree structures')
  .version('0.1.0');

program
  .option('--repo <repo>', 'GitHub repo URL or owner/repo (e.g., owner/my-app)')
  .option('--branch <branch>', 'Branch to scan (e.g., main)')
  .option('--root-folder <path>', 'Root folder to scope the search (e.g., src/services)')
  .option('--rule-tree-name <name>', 'Name for the rule tree (e.g., "Access Control Rules")')
  .option('--search <patterns>', 'Comma-separated file patterns to search (e.g., "*.mjs,*.py,*.jsx,*.tsx")')
  .option('--ignore <patterns>', 'Comma-separated file patterns to ignore (e.g., "*.test.mjs,*.spec.ts")')
  .option('--token <token>', 'GitHub token (falls back to GITHUB_TOKEN env)')
  .option('--output-dir <dir>', 'Output directory for JSON', './output')
  .option('--upload', 'Upload to rule-tree-table API after extraction', false)
  .option('--api-base <url>', 'API base URL', 'http://localhost:51000/~/api/rule_tree_table')
  .option('--git-tag <tag>', 'Git tag or release version (e.g., v1.0.4)')
  .option('--delay <ms>', 'Delay between GitHub API requests (ms)', '50')
  .option('--verbose', 'Verbose logging', false)
  .option('--upload-file <path>', 'Upload from a previously saved JSON file (skips extraction)');

program.parse();

const opts = program.opts();

function parseList(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

async function main() {
  // Mode: upload from file
  if (opts.uploadFile) {
    await uploadFromFile(opts.uploadFile, { apiBase: opts.apiBase });
    return;
  }

  // Mode: extract (+ optional upload)
  if (!opts.repo || !opts.branch || !opts.ruleTreeName) {
    console.error('Error: --repo, --branch, and --rule-tree-name are required for extraction.');
    console.error('Usage: node bin/extract.mjs --repo owner/repo --branch main --rule-tree-name "My Rules"');
    process.exit(1);
  }

  await runExtraction({
    repo: opts.repo,
    branch: opts.branch,
    ruleTreeName: opts.ruleTreeName,
    rootFolder: opts.rootFolder,
    filesToSearch: parseList(opts.search),
    filesToIgnore: parseList(opts.ignore),
    token: opts.token,
    outputDir: opts.outputDir,
    upload: opts.upload,
    apiBase: opts.apiBase,
    gitTag: opts.gitTag,
    delay: parseInt(opts.delay, 10),
    verbose: opts.verbose,
  });
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
