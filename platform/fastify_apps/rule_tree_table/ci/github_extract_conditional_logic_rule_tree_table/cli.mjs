#!/usr/bin/env node

/**
 * Interactive CLI Entrypoint
 * Prompts for repo, branch, root folder, rule tree name, and file filters.
 * Uses @internal/github-api-sdk-cli for token resolution and SDK prompt helpers.
 *
 * Usage: node cli.mjs
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { resolveGithubEnv } from '@internal/env-resolver';
import {
  bail,
  promptToken,
  promptRepoSelect,
  promptBranchSelect,
} from '@internal/github-api-sdk-cli';
import { runExtraction, uploadFromFile } from './src/main.mjs';

const API_PATH = '/~/api/rule_tree_table';
const DEFAULT_HOST = 'http://localhost:51000';

async function runInteractive() {
  p.intro(chalk.bold(' GitHub Rule Tree Extractor'));

  const mode = bail(await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'extract', label: 'Extract conditional rules from a GitHub repo' },
      { value: 'extract-code-repo', label: 'Extract conditional rules from code repository' },
      { value: 'upload', label: 'Upload from a JSON file: <path>' },
    ],
  }));

  if (mode === 'upload') {
    const filePath = bail(await p.text({
      message: 'Path to the JSON file:',
      placeholder: './output/rules-my-app-main-2026-03-12.json',
      validate: (v) => (!v.trim() ? 'File path is required' : undefined),
    }));

    const apiHost = bail(await p.text({
      message: 'API host:',
      initialValue: DEFAULT_HOST,
    }));

    await uploadFromFile(filePath, { apiBase: `${apiHost}${API_PATH}` });
    p.outro(chalk.green('Done!'));
    return;
  }

  if (mode === 'extract-code-repo') {
    // Fetch repos from code-repositories API
    const apiHost = bail(await p.text({
      message: 'API host:',
      initialValue: DEFAULT_HOST,
    }));

    const s = p.spinner();
    s.start('Fetching code repositories...');

    let repos;
    try {
      const res = await fetch(`${apiHost}/api/code-repositories/repos?limit=100`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      repos = (data.repositories || []).filter(r => r.githubUrl);
    } catch (err) {
      s.stop(chalk.red(`Failed to fetch repositories: ${err.message}`));
      p.cancel('Cannot continue without repository list.');
      process.exit(1);
    }

    if (repos.length === 0) {
      s.stop(chalk.yellow('No repositories with a GitHub URL found.'));
      p.cancel('No repositories available.');
      process.exit(0);
    }
    s.stop(`Found ${chalk.yellow(repos.length)} repositories with GitHub URLs`);

    const selectedRepo = bail(await p.select({
      message: 'Select a code repository:',
      options: repos.map(r => ({
        value: r,
        label: r.name,
        hint: r.githubUrl,
      })),
    }));

    // Parse owner/repo from github_url
    const ghUrl = selectedRepo.githubUrl.replace(/\/+$/, '');
    const urlParts = ghUrl.replace(/^https?:\/\/[^/]+\//, '').split('/');
    const owner = urlParts[0];
    const repoName = urlParts[1];

    if (!owner || !repoName) {
      p.cancel(`Could not parse owner/repo from: ${selectedRepo.githubUrl}`);
      process.exit(1);
    }

    // Token for GitHub API access
    const token = await promptToken();

    // Branch selection via SDK
    const branch = await promptBranchSelect({ token, owner, repo: repoName });

    let resolvedBranch = branch;
    if (!resolvedBranch) {
      const bs = p.spinner();
      bs.start('Resolving default branch');
      try {
        const { Octokit } = await import('octokit');
        const baseUrl = resolveGithubEnv().baseApiUrl;
        const oc = new Octokit({ auth: token || undefined, baseUrl });
        const { data } = await oc.rest.repos.get({ owner, repo: repoName });
        resolvedBranch = data.default_branch;
        bs.stop(`Default branch: ${chalk.cyan(resolvedBranch)}`);
      } catch {
        resolvedBranch = 'main';
        bs.stop(`Could not resolve default branch, using ${chalk.yellow('main')}`);
      }
    }

    const rootFolder = bail(await p.text({
      message: 'Root search folder (leave empty for entire repo):',
      placeholder: 'src/services',
    }));

    const ruleTreeName = bail(await p.text({
      message: 'Rule Tree Name:',
      placeholder: selectedRepo.name,
      initialValue: selectedRepo.name,
      validate: (v) => (!v.trim() ? 'Rule tree name is required' : undefined),
    }));

    const searchPatterns = bail(await p.text({
      message: 'File patterns to search (comma-separated, leave empty for defaults):',
      placeholder: '*.mjs, *.py, *.ts, *.jsx, *.tsx',
    }));

    const ignorePatterns = bail(await p.text({
      message: 'File patterns to ignore (comma-separated):',
      placeholder: '*.test.mjs, *.spec.ts, migration*',
    }));

    const gitTag = bail(await p.text({
      message: 'Git tag / release version (optional):',
      placeholder: 'v1.0.4',
    }));

    const shouldUpload = bail(await p.confirm({
      message: 'Upload to rule-tree-table API after extraction?',
      initialValue: false,
    }));

    const apiBase = `${apiHost}${API_PATH}`;

    const verbose = bail(await p.confirm({
      message: 'Verbose output?',
      initialValue: false,
    }));

    const repo = `${owner}/${repoName}`;
    p.log.info(chalk.bold('\nConfiguration:'));
    p.log.info(`  Code Repo:   ${chalk.cyan(selectedRepo.name)}`);
    p.log.info(`  GitHub:      ${chalk.cyan(repo)}`);
    p.log.info(`  Branch:      ${chalk.cyan(resolvedBranch)}`);
    p.log.info(`  Root folder: ${chalk.cyan(rootFolder || '(entire repo)')}`);
    p.log.info(`  Rule Tree:   ${chalk.cyan(ruleTreeName)}`);
    p.log.info(`  Search:      ${chalk.cyan(searchPatterns || '(defaults: *.mjs, *.js, *.ts, *.jsx, *.tsx, *.py)')}`);
    p.log.info(`  Ignore:      ${chalk.cyan(ignorePatterns || '(none)')}`);
    if (gitTag) p.log.info(`  Git Tag:     ${chalk.cyan(gitTag)}`);
    p.log.info(`  Upload:      ${shouldUpload ? chalk.green('yes') : chalk.dim('no')}`);
    p.log.info(`  Verbose:     ${verbose ? chalk.green('yes') : chalk.dim('no')}`);

    const confirmed = bail(await p.confirm({
      message: 'Proceed?',
      initialValue: true,
    }));
    if (!confirmed) { p.cancel('Cancelled.'); process.exit(0); }

    function parseList(str) {
      if (!str || !str.trim()) return [];
      return str.split(',').map(s => s.trim()).filter(Boolean);
    }

    await runExtraction({
      repo,
      branch: resolvedBranch,
      ruleTreeName,
      rootFolder: rootFolder?.trim() || undefined,
      filesToSearch: parseList(searchPatterns),
      filesToIgnore: parseList(ignorePatterns),
      token,
      outputDir: './output',
      upload: shouldUpload,
      apiBase,
      gitTag: gitTag?.trim() || undefined,
      delay: 50,
      verbose,
    });

    p.outro(chalk.green('Done!'));
    return;
  }

  // ── Extract mode ──────────────────────────────────────────────────

  // Token first — needed for SDK prompts that fetch from GitHub API
  const token = await promptToken();

  const owner = bail(await p.text({
    message: 'GitHub owner (username or org):',
    placeholder: 'owner',
    validate: (v) => (!v.trim() ? 'Owner is required' : undefined),
  }));

  // SDK-powered repo selection (fetches repos from GitHub)
  const repoName = await promptRepoSelect({ token, owner });
  if (!repoName) {
    p.cancel('Repository is required.');
    process.exit(0);
  }

  // SDK-powered branch selection (fetches branches from GitHub)
  const branch = await promptBranchSelect({ token, owner, repo: repoName });

  // Resolve "Default branch" selection (empty string) to the actual default branch
  let resolvedBranch = branch;
  if (!resolvedBranch) {
    const s = p.spinner();
    s.start('Resolving default branch');
    try {
      const { Octokit } = await import('octokit');
      const baseUrl = resolveGithubEnv().baseApiUrl;
      const oc = new Octokit({ auth: token || undefined, baseUrl });
      const { data } = await oc.rest.repos.get({ owner, repo: repoName });
      resolvedBranch = data.default_branch;
      s.stop(`Default branch: ${chalk.cyan(resolvedBranch)}`);
    } catch {
      resolvedBranch = 'main';
      s.stop(`Could not resolve default branch, using ${chalk.yellow('main')}`);
    }
  }

  const rootFolder = bail(await p.text({
    message: 'Root search folder (leave empty for entire repo):',
    placeholder: 'src/services',
  }));

  const ruleTreeName = bail(await p.text({
    message: 'Rule Tree Name:',
    placeholder: 'Access Control Rules',
    validate: (v) => (!v.trim() ? 'Rule tree name is required' : undefined),
  }));

  const searchPatterns = bail(await p.text({
    message: 'File patterns to search (comma-separated, leave empty for defaults):',
    placeholder: '*.mjs, *.py, *.ts, *.jsx, *.tsx',
  }));

  const ignorePatterns = bail(await p.text({
    message: 'File patterns to ignore (comma-separated):',
    placeholder: '*.test.mjs, *.spec.ts, migration*',
  }));

  const gitTag = bail(await p.text({
    message: 'Git tag / release version (optional):',
    placeholder: 'v1.0.4',
  }));

  const shouldUpload = bail(await p.confirm({
    message: 'Upload to rule-tree-table API after extraction?',
    initialValue: false,
  }));

  let apiBase = `${DEFAULT_HOST}${API_PATH}`;
  if (shouldUpload) {
    const apiHost = bail(await p.text({
      message: 'API host:',
      initialValue: DEFAULT_HOST,
    }));
    apiBase = `${apiHost}${API_PATH}`;
  }

  const verbose = bail(await p.confirm({
    message: 'Verbose output?',
    initialValue: false,
  }));

  // Summary
  const repo = `${owner}/${repoName}`;
  p.log.info(chalk.bold('\nConfiguration:'));
  p.log.info(`  Repo:        ${chalk.cyan(repo)}`);
  p.log.info(`  Branch:      ${chalk.cyan(resolvedBranch)}`);
  p.log.info(`  Root folder: ${chalk.cyan(rootFolder || '(entire repo)')}`);
  p.log.info(`  Rule Tree:   ${chalk.cyan(ruleTreeName)}`);
  p.log.info(`  Search:      ${chalk.cyan(searchPatterns || '(defaults: *.mjs, *.js, *.ts, *.jsx, *.tsx, *.py)')}`);
  p.log.info(`  Ignore:      ${chalk.cyan(ignorePatterns || '(none)')}`);
  if (gitTag) p.log.info(`  Git Tag:     ${chalk.cyan(gitTag)}`);
  p.log.info(`  Upload:      ${shouldUpload ? chalk.green('yes') : chalk.dim('no')}`);
  p.log.info(`  Verbose:     ${verbose ? chalk.green('yes') : chalk.dim('no')}`);

  const confirmed = bail(await p.confirm({
    message: 'Proceed?',
    initialValue: true,
  }));
  if (!confirmed) { p.cancel('Cancelled.'); process.exit(0); }

  function parseList(str) {
    if (!str || !str.trim()) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  await runExtraction({
    repo,
    branch: resolvedBranch,
    ruleTreeName,
    rootFolder: rootFolder?.trim() || undefined,
    filesToSearch: parseList(searchPatterns),
    filesToIgnore: parseList(ignorePatterns),
    token,
    outputDir: './output',
    upload: shouldUpload,
    apiBase,
    gitTag: gitTag?.trim() || undefined,
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
