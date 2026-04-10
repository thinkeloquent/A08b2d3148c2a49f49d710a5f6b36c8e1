#!/usr/bin/env node

/**
 * Non-Interactive CLI Entrypoint
 *
 * Usage:
 *   node bin/extract.mjs --repo mui/material-ui --branch main --prepend "MUI latest"
 *   node bin/extract.mjs --repo mui/material-ui --branch v6.x --prepend "MUI v6.x" --upload
 *   node bin/extract.mjs --upload-file ./output/components-material-ui-main-2026-03-12.json
 */

import { Command } from 'commander';
import { runExtraction, uploadFromFile } from '../src/main.mjs';

const program = new Command();

program
  .name('github_component_extract')
  .description('Extract JSX component definitions from a GitHub repo and upload to ui-component-metadata API')
  .version('0.1.0');

program
  .option('--repo <repo>', 'GitHub repo URL or owner/repo (e.g., mui/material-ui)')
  .option('--branch <branch>', 'Branch to scan (e.g., main, v6.x)')
  .option('--prepend <name>', 'Prepend name for component entries (e.g., "MUI latest")')
  .option('--token <token>', 'GitHub token (falls back to GITHUB_TOKEN env)')
  .option('--output-dir <dir>', 'Output directory for JSON', './output')
  .option('--upload', 'Upload to ui-component-metadata API after extraction', false)
  .option('--api-base <url>', 'API base URL', 'http://localhost:51000/api/ui-component-metadata')
  .option('--delay <ms>', 'Delay between GitHub API requests (ms)', '50')
  .option('--verbose', 'Verbose logging', false)
  .option('--upload-file <path>', 'Upload from a previously saved JSON file (skips extraction)');

program.parse();

const opts = program.opts();

async function main() {
  // Mode: upload from file
  if (opts.uploadFile) {
    await uploadFromFile(opts.uploadFile, { apiBase: opts.apiBase });
    return;
  }

  // Mode: extract (+ optional upload)
  if (!opts.repo || !opts.branch || !opts.prepend) {
    console.error('Error: --repo, --branch, and --prepend are required for extraction.');
    console.error('Usage: node bin/extract.mjs --repo mui/material-ui --branch main --prepend "MUI latest"');
    process.exit(1);
  }

  await runExtraction({
    repo: opts.repo,
    branch: opts.branch,
    prependName: opts.prepend,
    token: opts.token,
    outputDir: opts.outputDir,
    upload: opts.upload,
    apiBase: opts.apiBase,
    delay: parseInt(opts.delay, 10),
    verbose: opts.verbose,
  });
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
