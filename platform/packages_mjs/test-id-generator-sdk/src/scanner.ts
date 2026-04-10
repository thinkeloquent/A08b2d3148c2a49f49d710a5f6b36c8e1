import fs from 'node:fs/promises';
import path from 'node:path';
import { processJsx } from './processor-jsx.js';
import { processHtml } from './processor-html.js';
import type { TestIdGeneratorConfig, ScanResult, FileType } from './types.js';

const EXT_MAP: Record<string, FileType> = {
  '.jsx': 'jsx',
  '.tsx': 'tsx',
  '.html': 'html',
};

/** Default directories to skip during recursive scanning. */
const DEFAULT_SKIP_DIRS = [
  'node_modules', 'dist', 'build', '.git', '.next', '__pycache__',
  'data', 'dataset', 'coverage', 'output', 'logs',
];

/**
 * Recursively scan a directory and inject test IDs into JSX/TSX/HTML files.
 *
 * @param dir - Directory path to scan
 * @param config - ID generator configuration
 * @param dryRun - If true, do not write files (default false)
 */
export async function scanDirectory(
  dir: string,
  config?: TestIdGeneratorConfig,
  dryRun = false,
): Promise<ScanResult> {
  const skipDirs = new Set([...DEFAULT_SKIP_DIRS, ...(config?.skipDirs ?? [])]);
  const result: ScanResult = {
    modifiedFiles: [],
    totalInjected: 0,
    skippedFiles: [],
    errorFiles: [],
  };

  await walk(dir, config, dryRun, skipDirs, result);
  return result;
}

async function walk(
  dir: string,
  config: TestIdGeneratorConfig | undefined,
  dryRun: boolean,
  skipDirs: Set<string>,
  result: ScanResult,
): Promise<void> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err: any) {
    result.errorFiles.push({ file: dir, error: err.message });
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    let stat;
    try {
      stat = await fs.stat(fullPath);
    } catch (err: any) {
      result.errorFiles.push({ file: fullPath, error: err.message });
      continue;
    }

    if (stat.isDirectory()) {
      if (!skipDirs.has(entry) && !entry.startsWith('.')) {
        await walk(fullPath, config, dryRun, skipDirs, result);
      }
      continue;
    }

    if (!stat.isFile()) continue;

    const ext = path.extname(fullPath).toLowerCase();
    const fileType = EXT_MAP[ext];
    if (!fileType) continue;

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const processed = fileType === 'html'
        ? processHtml(content, config)
        : processJsx(content, config);

      if (processed.modified) {
        if (!dryRun) {
          await fs.writeFile(fullPath, processed.code, 'utf-8');
        }
        result.modifiedFiles.push(fullPath);
        result.totalInjected += processed.count;
      } else {
        result.skippedFiles.push(fullPath);
      }
    } catch (err: any) {
      result.errorFiles.push({ file: fullPath, error: err.message });
    }
  }
}
