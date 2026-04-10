/**
 * @module schemas
 * @description Zod v3 schemas for the Polyglot Formatter SDK.
 *
 * Enum values are identical lowercase strings for cross-language JSON parity.
 */

import { z } from 'zod';

/** Language enum — identical values: go, python, node, rust, shell, sql, markup */
export const LanguageSchema = z.enum([
  'go',
  'python',
  'node',
  'rust',
  'shell',
  'sql',
  'markup',
]);

/** Severity enum — identical values: error, warning, info, hint */
export const SeveritySchema = z.enum(['error', 'warning', 'info', 'hint']);

/** FormatRequest schema */
export const FormatRequestSchema = z.object({
  source: z.string(),
  language: LanguageSchema,
  options: z.record(z.unknown()).optional(),
  context: z.record(z.unknown()).optional(),
});

/** Diagnostic schema */
export const DiagnosticSchema = z.object({
  file: z.string().optional(),
  line: z.number().int().optional(),
  column: z.number().int().optional(),
  severity: SeveritySchema,
  message: z.string(),
  rule: z.string().optional(),
});

/** FormatResult schema */
export const FormatResultSchema = z.object({
  success: z.boolean(),
  formatted: z.string().optional(),
  diff: z.string().optional(),
  diagnostics: z.array(DiagnosticSchema).default([]),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Strip undefined keys for JSON parity (optional fields absent when null/undefined).
 * @param {unknown} data
 * @returns {unknown}
 */
export function toJSON(data) {
  return JSON.parse(JSON.stringify(data));
}
