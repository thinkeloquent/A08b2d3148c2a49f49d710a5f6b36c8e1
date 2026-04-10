/**
 * Main Orchestration
 * Stage 1: Extract component definitions from GitHub repo → JSON
 * Stage 2: Upload JSON to ui-component-metadata API
 */

import chalk from 'chalk';
import { createGitHubClient, parseRepoInput } from './github-client.mjs';
import { extractComponentDefinitions, extractDescription, inferTaxonomyLevel } from './component-extractor.mjs';
import { buildOutputPayload, writeOutputFile } from './output-writer.mjs';
import { createApiUploader } from './api-uploader.mjs';

/**
 * Run the extraction pipeline.
 * @param {object} config
 * @param {string} config.repo - GitHub repo URL or owner/repo
 * @param {string} config.branch - Branch name
 * @param {string} config.prependName - Prefix for component names
 * @param {string} [config.token] - GitHub token (env GITHUB_TOKEN fallback)
 * @param {string} [config.outputDir] - Output directory
 * @param {boolean} [config.upload] - Whether to upload after extraction
 * @param {string} [config.apiBase] - API base URL
 * @param {number} [config.delay] - Delay between API fetches (ms)
 * @param {boolean} [config.verbose] - Verbose logging
 */
export async function runExtraction(config) {
  const {
    repo,
    branch,
    prependName,
    token,
    outputDir = './output',
    upload = false,
    apiBase,
    delay = 50,
    verbose = false,
  } = config;

  const { owner, repo: repoName } = parseRepoInput(repo);
  const github = createGitHubClient({ token });

  const log = (msg) => process.stderr.write(`${msg}\n`);
  const vlog = (msg) => { if (verbose) log(chalk.dim(msg)); };

  // ── Stage 1: Extract ──────────────────────────────────────────────

  log(chalk.bold('\n Stage 1: Extract Components\n'));
  log(`  Repo:    ${chalk.cyan(`${owner}/${repoName}`)}`);
  log(`  Branch:  ${chalk.cyan(branch)}`);
  log(`  Prepend: ${chalk.cyan(prependName)}`);

  // 1a. Fetch file tree
  log(chalk.dim('\n  Fetching file tree...'));
  const files = await github.getComponentFiles(owner, repoName, branch);
  log(`  Found ${chalk.yellow(files.length)} JSX/TSX files to scan\n`);

  if (files.length === 0) {
    log(chalk.red('  No JSX/TSX files found. Exiting.'));
    return { components: [], outputPath: null };
  }

  // 1b. Scan each file for component definitions
  const allComponents = [];
  let scanned = 0;
  let errors = 0;

  for (const filePath of files) {
    scanned++;
    const progress = `[${scanned}/${files.length}]`;

    try {
      vlog(`  ${progress} ${filePath}`);
      const content = await github.getRawContent(owner, repoName, filePath, branch);

      const defs = extractComponentDefinitions(content, filePath);
      for (const def of defs) {
        def.description = extractDescription(content, def.name);
        def.taxonomyLevel = inferTaxonomyLevel(filePath);
        allComponents.push(def);
      }

      if (defs.length > 0) {
        vlog(chalk.green(`    → ${defs.map(d => d.name).join(', ')}`));
      }
    } catch (err) {
      errors++;
      vlog(chalk.red(`  ${progress} Error: ${err.message}`));

      // Rate limit hit — check and warn
      if (err.message.includes('403') || err.message.includes('rate limit')) {
        const rateInfo = await github.getRateLimit().catch(() => null);
        if (rateInfo && rateInfo.remaining === 0) {
          const resetAt = new Date(rateInfo.reset * 1000).toLocaleTimeString();
          log(chalk.red(`\n  Rate limit exhausted. Resets at ${resetAt}`));
          log(chalk.yellow(`  Saving ${allComponents.length} components found so far...\n`));
          break;
        }
      }
    }

    // Delay between requests
    if (delay > 0 && scanned < files.length) {
      await new Promise(r => setTimeout(r, delay));
    }

    // Progress log every 50 files
    if (!verbose && scanned % 50 === 0) {
      log(chalk.dim(`  Scanned ${scanned}/${files.length} files (${allComponents.length} components found)...`));
    }
  }

  // Deduplicate by component name (keep first occurrence)
  const uniqueMap = new Map();
  for (const comp of allComponents) {
    if (!uniqueMap.has(comp.name)) {
      uniqueMap.set(comp.name, comp);
    }
  }
  const uniqueComponents = Array.from(uniqueMap.values());

  log(`\n  Scanned:    ${chalk.yellow(scanned)} files`);
  log(`  Errors:     ${chalk.red(errors)}`);
  log(`  Components: ${chalk.green(uniqueComponents.length)} unique\n`);

  // 1c. Build and write output
  const payload = buildOutputPayload({
    owner,
    repo: repoName,
    branch,
    prependName,
    components: uniqueComponents,
  });

  const date = new Date().toISOString().split('T')[0];
  const safeRepo = repoName.replace(/[^a-zA-Z0-9-]/g, '_');
  const safeBranch = branch.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `components-${safeRepo}-${safeBranch}-${date}.json`;

  const outputPath = writeOutputFile(payload, outputDir, filename);
  log(chalk.green(`  Saved to: ${outputPath}\n`));

  // ── Stage 2: Upload (optional) ────────────────────────────────────

  if (upload) {
    log(chalk.bold(' Stage 2: Upload to API\n'));

    const uploader = createApiUploader({ apiBase });

    // Health check first
    const healthy = await uploader.checkHealth();
    if (!healthy) {
      log(chalk.red(`  API not reachable at ${apiBase || 'http://localhost:51000/api/ui-component-metadata'}`));
      log(chalk.yellow('  Skipping upload. Use the saved JSON file to upload later.\n'));
      return { components: uniqueComponents, outputPath, uploaded: false };
    }

    log(chalk.dim(`  Uploading ${payload.components.length} components...\n`));

    const { uploaded, failed, results } = await uploader.uploadAll(
      payload.components,
      {
        delay: 100,
        onProgress: (current, total, result) => {
          const icon = result.success ? chalk.green('✓') : chalk.red('✗');
          const id = result.id ? chalk.dim(` (${result.id})`) : '';
          const err = result.error ? chalk.red(` — ${result.error}`) : '';
          log(`  ${icon} [${current}/${total}] ${result.name}${id}${err}`);
        },
      },
    );

    log(`\n  Uploaded: ${chalk.green(uploaded)}`);
    log(`  Failed:   ${chalk.red(failed)}\n`);

    return { components: uniqueComponents, outputPath, uploaded: true, uploadResults: { uploaded, failed, results } };
  }

  return { components: uniqueComponents, outputPath, uploaded: false };
}

/**
 * Upload from a previously saved JSON file.
 * @param {string} jsonPath - Path to the JSON file
 * @param {{ apiBase?: string }} options
 */
export async function uploadFromFile(jsonPath, { apiBase } = {}) {
  const { readFileSync } = await import('node:fs');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  const log = (msg) => process.stderr.write(`${msg}\n`);

  log(chalk.bold('\n Upload from File\n'));
  log(`  File:       ${chalk.cyan(jsonPath)}`);
  log(`  Components: ${chalk.yellow(payload.components.length)}`);
  log(`  Source:     ${chalk.dim(payload.metadata?.source?.repo || 'unknown')}\n`);

  const uploader = createApiUploader({ apiBase });

  const healthy = await uploader.checkHealth();
  if (!healthy) {
    log(chalk.red(`  API not reachable at ${apiBase || 'http://localhost:51000/api/ui-component-metadata'}`));
    return;
  }

  const { uploaded, failed } = await uploader.uploadAll(
    payload.components,
    {
      delay: 100,
      onProgress: (current, total, result) => {
        const icon = result.success ? chalk.green('✓') : chalk.red('✗');
        log(`  ${icon} [${current}/${total}] ${result.name}`);
      },
    },
  );

  log(`\n  Uploaded: ${chalk.green(uploaded)}`);
  log(`  Failed:   ${chalk.red(failed)}\n`);
}
