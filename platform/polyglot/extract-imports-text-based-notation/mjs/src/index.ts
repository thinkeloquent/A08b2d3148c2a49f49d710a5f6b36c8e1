export { ImportExtractor } from './extractor.js';
export type {
  ExtractedImport,
  ExtractionResult,
  ExtractorOptions,
  SpecifierKind,
} from './types.js';

import { ImportExtractor } from './extractor.js';
import type { ExtractedImport } from './types.js';

export function extractImports(code: string): ExtractedImport[] {
  return new ImportExtractor().extractImports(code);
}

export function extractExports(code: string): ExtractedImport[] {
  return new ImportExtractor().extractExports(code);
}

export default extractImports;
