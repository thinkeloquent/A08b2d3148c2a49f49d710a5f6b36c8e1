export type SpecifierKind =
  | 'default'
  | 'named'
  | 'namespace'
  | 'side-effect'
  | 'export-default'
  | 'export-named'
  | 'export-all'
  | 'export-namespace';

export type ExtractedImport = [string, string[]];

export type ExtractionResult = ExtractedImport[];

export interface ExtractorOptions {
  logger?: import('./logger.js').LoggerInstance;
}
