/**
 * DialectAdapter interface.
 *
 * Every dialect adapter (Flowise, Langflow, LangGraph topology, etc.)
 * implements this contract to provide bidirectional conversion between
 * the universal AIWorkflow schema and dialect-specific JSON formats.
 */

import type { AIWorkflow } from "../types.js";

export interface DialectAdapter {
  /**
   * Convert a dialect-specific JSON object to a universal AIWorkflow.
   */
  fromDialect(dialectJson: unknown): AIWorkflow;

  /**
   * Convert a universal AIWorkflow to a dialect-specific JSON object.
   */
  toDialect(workflow: AIWorkflow): unknown;

  /**
   * Heuristic check: does the given JSON look like this dialect?
   * Used by detectDialect() for auto-detection.
   */
  detect(json: unknown): boolean;
}
