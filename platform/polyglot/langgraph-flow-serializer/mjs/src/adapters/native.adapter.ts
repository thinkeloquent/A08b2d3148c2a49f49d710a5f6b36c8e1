/**
 * Native adapter — identity transform.
 *
 * For workflows already in the universal AIWorkflow schema format.
 * fromDialect / toDialect both pass through unchanged (after clone).
 */

import type { AIWorkflow } from "../types.js";
import type { DialectAdapter } from "./adapter.js";

export const nativeAdapter: DialectAdapter = {
  detect(json: unknown): boolean {
    if (typeof json !== "object" || json === null) return false;
    const obj = json as Record<string, unknown>;
    return (
      typeof obj.name === "string" &&
      Array.isArray(obj.nodes) &&
      Array.isArray(obj.edges)
    );
  },

  fromDialect(dialectJson: unknown): AIWorkflow {
    return JSON.parse(JSON.stringify(dialectJson)) as AIWorkflow;
  },

  toDialect(workflow: AIWorkflow): unknown {
    return JSON.parse(JSON.stringify(workflow));
  },
};
