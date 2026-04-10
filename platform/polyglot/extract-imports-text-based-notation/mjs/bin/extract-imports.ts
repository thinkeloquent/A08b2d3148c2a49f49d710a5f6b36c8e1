#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { ImportExtractor } from '../src/extractor.js';

interface CLIOptions {
  file?: string;
  mode: 'imports' | 'exports' | 'both';
  pretty: boolean;
}

function parseCLI(): CLIOptions {
  const { values } = parseArgs({
    options: {
      file: {
        type: 'string',
        short: 'f',
        description: 'Path to the source file to analyze',
      },
      mode: {
        type: 'string',
        short: 'm',
        default: 'imports',
        description: 'Extraction mode: imports, exports, or both',
      },
      pretty: {
        type: 'boolean',
        short: 'p',
        default: false,
        description: 'Pretty-print JSON output',
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
        description: 'Show help message',
      },
    },
    strict: true,
  });

  if (values.help) {
    console.log(`
Usage: extract-imports [options]

Options:
  -f, --file <path>    Path to the source file (reads from stdin if omitted)
  -m, --mode <mode>    Extraction mode: imports | exports | both (default: imports)
  -p, --pretty         Pretty-print JSON output
  -h, --help           Show this help message
`);
    process.exit(0);
  }

  const mode = values.mode as CLIOptions['mode'];
  if (!['imports', 'exports', 'both'].includes(mode)) {
    console.error(`Error: Invalid mode "${mode}". Use imports, exports, or both.`);
    process.exit(1);
  }

  return {
    file: values.file,
    mode,
    pretty: values.pretty ?? false,
  };
}

function readSource(filePath?: string): string {
  if (filePath) {
    return readFileSync(filePath, 'utf-8');
  }

  // Read from stdin
  return readFileSync(0, 'utf-8');
}

function main(): void {
  const options = parseCLI();
  const code = readSource(options.file);
  const extractor = new ImportExtractor();

  const output: Record<string, unknown> = {};

  if (options.mode === 'imports' || options.mode === 'both') {
    output.imports = extractor.extractImports(code);
  }

  if (options.mode === 'exports' || options.mode === 'both') {
    output.exports = extractor.extractExports(code);
  }

  const indent = options.pretty ? 2 : undefined;
  console.log(JSON.stringify(output, null, indent));
}

main();
