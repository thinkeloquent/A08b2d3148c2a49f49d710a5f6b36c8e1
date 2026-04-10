#!/usr/bin/env node

/**
 * Interactive CLI Entrypoint
 * Prompts for repo, branch, prepend name, and options.
 *
 * Usage: node cli.mjs
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolveGithubEnv } from '@internal/env-resolver';
import { runExtraction, uploadFromFile } from './src/main.mjs';

async function runInteractive() {
  p.intro(chalk.bold(' GitHub Component Extract'));

  const mode = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'extract', label: 'Extract components from a GitHub repo' },
      { value: 'upload', label: 'Upload from a previously saved JSON file' },
    ],
  });

  if (p.isCancel(mode)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  if (mode === 'upload') {
    const filePath = await p.text({
      message: 'Path to the JSON file:',
      placeholder: './output/components-material-ui-main-2026-03-12.json',
      validate: (v) => (!v.trim() ? 'File path is required' : undefined),
    });
    if (p.isCancel(filePath)) { p.cancel('Cancelled.'); process.exit(0); }

    const apiBase = await p.text({
      message: 'API base URL:',
      initialValue: 'http://localhost:51000/api/ui-component-metadata',
    });
    if (p.isCancel(apiBase)) { p.cancel('Cancelled.'); process.exit(0); }

    await uploadFromFile(filePath, { apiBase });
    p.outro(chalk.green('Done!'));
    return;
  }

  // ── Extract mode ──────────────────────────────────────────────────

  const repo = await p.text({
    message: 'GitHub repo (URL or owner/repo):',
    placeholder: 'https://github.com/mui/material-ui',
    validate: (v) => (!v.trim() ? 'Repo is required' : undefined),
  });
  if (p.isCancel(repo)) { p.cancel('Cancelled.'); process.exit(0); }

  const branch = await p.text({
    message: 'Branch:',
    initialValue: 'main',
    validate: (v) => (!v.trim() ? 'Branch is required' : undefined),
  });
  if (p.isCancel(branch)) { p.cancel('Cancelled.'); process.exit(0); }

  const prependName = await p.text({
    message: 'Prepend name (prefix for component names):',
    placeholder: 'MUI latest',
    validate: (v) => (!v.trim() ? 'Prepend name is required' : undefined),
  });
  if (p.isCancel(prependName)) { p.cancel('Cancelled.'); process.exit(0); }

  const token = await p.text({
    message: 'GitHub token (leave empty for GITHUB_TOKEN env):',
    initialValue: resolveGithubEnv().token || '',
  });
  if (p.isCancel(token)) { p.cancel('Cancelled.'); process.exit(0); }

  const shouldUpload = await p.confirm({
    message: 'Upload to API after extraction?',
    initialValue: false,
  });
  if (p.isCancel(shouldUpload)) { p.cancel('Cancelled.'); process.exit(0); }

  let apiBase = 'http://localhost:51000/api/ui-component-metadata';
  if (shouldUpload) {
    const apiInput = await p.text({
      message: 'API base URL:',
      initialValue: apiBase,
    });
    if (p.isCancel(apiInput)) { p.cancel('Cancelled.'); process.exit(0); }
    apiBase = apiInput;
  }

  const verbose = await p.confirm({
    message: 'Verbose output?',
    initialValue: false,
  });
  if (p.isCancel(verbose)) { p.cancel('Cancelled.'); process.exit(0); }

  // Summary
  p.log.info(chalk.bold('\nConfiguration:'));
  p.log.info(`  Repo:     ${chalk.cyan(repo)}`);
  p.log.info(`  Branch:   ${chalk.cyan(branch)}`);
  p.log.info(`  Prepend:  ${chalk.cyan(prependName)}`);
  p.log.info(`  Upload:   ${shouldUpload ? chalk.green('yes') : chalk.dim('no')}`);
  p.log.info(`  Verbose:  ${verbose ? chalk.green('yes') : chalk.dim('no')}`);

  const confirmed = await p.confirm({
    message: 'Proceed?',
    initialValue: true,
  });
  if (p.isCancel(confirmed) || !confirmed) { p.cancel('Cancelled.'); process.exit(0); }

  await runExtraction({
    repo,
    branch,
    prependName,
    token: token || undefined,
    outputDir: './output',
    upload: shouldUpload,
    apiBase,
    delay: 50,
    verbose,
  });

  p.outro(chalk.green('Done!'));
}

// If called with CLI args, delegate to non-interactive mode
if (process.argv.includes('--repo') || process.argv.includes('--upload-file')) {
  await import('./bin/extract.mjs');
} else {
  runInteractive().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
