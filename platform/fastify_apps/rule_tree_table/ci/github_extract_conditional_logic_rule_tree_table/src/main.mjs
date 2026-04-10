/**
 * Main Orchestration
 * Stage 1: Extract conditional rules from GitHub repo → JSON
 * Stage 2: Upload JSON to rule-tree-table API
 */

import chalk from 'chalk';
import { createGitHubApiClient, parseRepoInput } from './github-client.mjs';
import { extractRules, countItems } from './rule-extractor.mjs';
import { buildOutputPayload, writeOutputFile } from './output-writer.mjs';
import { createApiUploader } from './api-uploader.mjs';

/**
 * Run the extraction pipeline.
 * @param {object} config
 * @param {string} config.repo - GitHub repo URL or owner/repo
 * @param {string} config.branch - Branch name
 * @param {string} config.ruleTreeName - Name for the created rule tree
 * @param {string} [config.rootFolder] - Root folder to scope search
 * @param {string[]} [config.filesToSearch] - File patterns to include (e.g., ["*.mjs", "*.py"])
 * @param {string[]} [config.filesToIgnore] - File patterns to exclude
 * @param {string} [config.token] - GitHub token (env GITHUB_TOKEN fallback)
 * @param {string} [config.outputDir] - Output directory
 * @param {boolean} [config.upload] - Whether to upload after extraction
 * @param {string} [config.apiBase] - API base URL
 * @param {string} [config.gitTag] - Git tag / release version (e.g. v1.0.4)
 * @param {number} [config.delay] - Delay between API fetches (ms)
 * @param {boolean} [config.verbose] - Verbose logging
 */
export async function runExtraction(config) {
  const {
    repo,
    branch,
    ruleTreeName,
    rootFolder,
    filesToSearch = [],
    filesToIgnore = [],
    token,
    outputDir = './output',
    upload = false,
    apiBase,
    gitTag,
    delay = 50,
    verbose = false,
  } = config;

  const { owner, repo: repoName } = parseRepoInput(repo);

  // SDK client: delay is in seconds for the SDK rate limiter
  const github = createGitHubApiClient({
    token,
    delay: delay / 1000,
    verbose,
  });

  const log = (msg) => process.stderr.write(`${msg}\n`);
  const vlog = (msg) => { if (verbose) log(chalk.dim(msg)); };

  // ── Stage 1: Extract ──────────────────────────────────────────────

  log(chalk.bold('\n Stage 1: Extract Conditional Rules\n'));
  log(`  Repo:       ${chalk.cyan(`${owner}/${repoName}`)}`);
  log(`  Branch:     ${chalk.cyan(branch)}`);
  log(`  Rule Tree:  ${chalk.cyan(ruleTreeName)}`);
  if (rootFolder) log(`  Root:       ${chalk.cyan(rootFolder)}`);
  if (filesToSearch.length) log(`  Search:     ${chalk.cyan(filesToSearch.join(', '))}`);
  if (filesToIgnore.length) log(`  Ignore:     ${chalk.cyan(filesToIgnore.join(', '))}`);

  // 1a. Fetch file tree
  log(chalk.dim('\n  Fetching file tree...'));
  const files = await github.getFiles(owner, repoName, branch, {
    rootFolder,
    filesToSearch,
    filesToIgnore,
  });
  log(`  Found ${chalk.yellow(files.length)} files to scan\n`);

  if (files.length === 0) {
    log(chalk.red('  No matching files found. Exiting.'));
    return { fileResults: [], outputPath: null };
  }

  // 1b. Scan each file for conditional rules
  const fileResults = [];
  let scanned = 0;
  let errors = 0;
  let totalRuleItems = 0;

  for (const filePath of files) {
    scanned++;
    const progress = `[${scanned}/${files.length}]`;

    try {
      vlog(`  ${progress} ${filePath}`);
      const content = await github.getRawContent(owner, repoName, filePath, branch);

      const extraction = extractRules(content, filePath);
      const itemCount = countItems(extraction);

      if (itemCount > 0) {
        fileResults.push({
          filePath,
          rules: extraction.rules,
          functionRules: extraction.functionRules,
        });
        totalRuleItems += itemCount;
        vlog(chalk.green(`    → ${itemCount} rule items (${extraction.functionRules.length} functions)`));
      }
    } catch (err) {
      errors++;
      vlog(chalk.red(`  ${progress} Error: ${err.message}`));

      if (err.message.includes('403') || err.message.includes('rate limit')) {
        const rateInfo = await github.getRateLimit().catch(() => null);
        if (rateInfo && rateInfo.remaining === 0) {
          const resetAt = new Date(rateInfo.reset * 1000).toLocaleTimeString();
          log(chalk.red(`\n  Rate limit exhausted. Resets at ${resetAt}`));
          log(chalk.yellow(`  Saving ${totalRuleItems} rule items found so far...\n`));
          break;
        }
      }
    }

    if (!verbose && scanned % 50 === 0) {
      log(chalk.dim(`  Scanned ${scanned}/${files.length} files (${totalRuleItems} rule items)...`));
    }
  }

  log(`\n  Scanned:     ${chalk.yellow(scanned)} files`);
  log(`  Errors:      ${chalk.red(errors)}`);
  log(`  Files w/rules: ${chalk.green(fileResults.length)}`);
  log(`  Rule items:  ${chalk.green(totalRuleItems)}`);
  log(`  API calls:   ${chalk.dim(github.apiCalls.length)}\n`);

  if (fileResults.length === 0) {
    log(chalk.yellow('  No conditional rules found in scanned files.\n'));
    return { fileResults: [], outputPath: null };
  }

  // 1c. Resolve commit SHA for immutability
  log(chalk.dim('  Resolving commit SHA...'));
  const commitSha = await github.getCommitSha(owner, repoName, branch);
  if (commitSha) {
    log(`  Commit:    ${chalk.cyan(commitSha.substring(0, 7))} (${commitSha})`);
  } else {
    log(chalk.yellow('  Could not resolve commit SHA'));
  }

  // 1d. Build and write output
  const payload = buildOutputPayload({
    owner,
    repo: repoName,
    branch,
    ruleTreeName,
    fileResults,
    commitSha,
    gitTag,
  });

  const date = new Date().toISOString().split('T')[0];
  const safeRepo = repoName.replace(/[^a-zA-Z0-9-]/g, '_');
  const safeBranch = branch.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `rules-${safeRepo}-${safeBranch}-${date}.json`;

  const outputPath = writeOutputFile(payload, outputDir, filename);
  log(chalk.green(`  Saved to: ${outputPath}`));
  log(chalk.dim(`  Stats: ${payload.metadata.stats.groups} groups, ${payload.metadata.stats.folders} folders, ${payload.metadata.stats.conditions} conditions\n`));

  // ── Stage 2: Upload (optional) ────────────────────────────────────

  if (upload) {
    log(chalk.bold(' Stage 2: Upload to API\n'));

    const uploader = createApiUploader({ apiBase });

    const healthy = await uploader.checkHealth();
    if (!healthy) {
      log(chalk.red(`  API not reachable at ${apiBase || 'http://localhost:51000/~/api/rule_tree_table'}`));
      log(chalk.yellow('  Skipping upload. Use the saved JSON file to upload later.\n'));
      return { fileResults, outputPath, uploaded: false };
    }

    log(chalk.dim('  Validating rules...'));
    const validation = await uploader.validateRules(payload.ruleTree.rules);
    if (!validation.valid) {
      log(chalk.red('  Validation failed:'));
      for (const err of validation.errors || []) {
        log(chalk.red(`    - ${typeof err === 'string' ? err : err.message}`));
      }
      log(chalk.yellow('  Skipping upload due to validation errors.\n'));
      return { fileResults, outputPath, uploaded: false };
    }
    log(chalk.green('  Validation passed'));

    log(chalk.dim('  Creating rule tree...\n'));
    const result = await uploader.uploadTree(payload.ruleTree);

    if (result.success) {
      log(chalk.green(`  Created: ${result.name} (${result.id})\n`));
    } else {
      log(chalk.red(`  Failed: ${result.error}\n`));
    }

    return { fileResults, outputPath, uploaded: result.success, uploadResult: result };
  }

  return { fileResults, outputPath, uploaded: false };
}

/**
 * Upload from a previously saved JSON file.
 * @param {string} jsonPath
 * @param {{ apiBase?: string }} options
 */
export async function uploadFromFile(jsonPath, { apiBase } = {}) {
  const { readFileSync } = await import('node:fs');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  const log = (msg) => process.stderr.write(`${msg}\n`);

  log(chalk.bold('\n Upload from File\n'));
  log(`  File:      ${chalk.cyan(jsonPath)}`);
  log(`  Tree:      ${chalk.yellow(payload.ruleTree?.name || 'unknown')}`);
  log(`  Source:    ${chalk.dim(payload.metadata?.source?.repo || 'unknown')}`);
  log(`  Stats:     ${chalk.dim(JSON.stringify(payload.metadata?.stats || {}))}\n`);

  const uploader = createApiUploader({ apiBase });

  const healthy = await uploader.checkHealth();
  if (!healthy) {
    log(chalk.red(`  API not reachable at ${apiBase || 'http://localhost:51000/~/api/rule_tree_table'}`));
    return;
  }

  const result = await uploader.uploadTree(payload.ruleTree);
  if (result.success) {
    log(chalk.green(`  Created: ${result.name} (${result.id})\n`));
  } else {
    log(chalk.red(`  Failed: ${result.error}\n`));
  }
}
