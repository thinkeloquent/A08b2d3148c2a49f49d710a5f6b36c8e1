/**
 * Deserializer: JSON string → AIWorkflow.
 *
 * Parses the JSON, validates it against the Zod schema, normalizes optional
 * fields to sensible defaults, and throws a ValidationError on any failure.
 */

import type { AIWorkflow } from "./types.js";
import { ValidationError } from "./types.js";
import { AIWorkflowSchema } from "./schema.js";
import { ZodError } from "zod";

function normalizeDefaults(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;

  const obj = raw as Record<string, unknown>;

  // Normalize top-level optional fields
  const normalized: Record<string, unknown> = {
    ...obj,
    nodes: Array.isArray(obj.nodes) ? obj.nodes : [],
    edges: Array.isArray(obj.edges) ? obj.edges : [],
  };

  // Normalize each node's data.inputs default
  normalized.nodes = (normalized.nodes as unknown[]).map((n) => {
    if (typeof n !== "object" || n === null) return n;
    const node = n as Record<string, unknown>;
    const data = (typeof node.data === "object" && node.data !== null
      ? node.data
      : {}) as Record<string, unknown>;
    return {
      ...node,
      data: {
        inputs: {},
        ...data,
      },
    };
  });

  return normalized;
}

/**
 * Deserialize a JSON string to an AIWorkflow.
 *
 * @param json - The JSON string to deserialize.
 * @returns A validated AIWorkflow object with defaults applied.
 * @throws ValidationError if parsing or validation fails.
 */
export function deserialize(json: string): AIWorkflow {
  let raw: unknown;

  try {
    raw = JSON.parse(json);
  } catch (err) {
    throw new ValidationError(
      `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const withDefaults = normalizeDefaults(raw);

  try {
    return AIWorkflowSchema.parse(withDefaults) as AIWorkflow;
  } catch (err) {
    if (err instanceof ZodError) {
      const issues = err.issues.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`
      );
      throw new ValidationError(
        `Workflow validation failed:\n  ${issues.join("\n  ")}`,
        issues
      );
    }
    throw new ValidationError(
      `Workflow validation failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
