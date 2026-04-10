/**
 * LangGraph Flow Serializer
 *
 * Bidirectional JSON ↔ Object serialization for LangChain/LangGraph workflow
 * graphs using a universal Node-Edge schema compatible with React Flow,
 * Flowise, and Langflow.
 *
 * @example Basic serialize / deserialize
 * ```typescript
 * import { serialize, deserialize } from "@internal/langgraph-flow-serializer";
 *
 * const json = serialize(myWorkflow);
 * const workflow = deserialize(json);
 * ```
 *
 * @example Cross-dialect conversion
 * ```typescript
 * import { deserializeFrom, serializeAs } from "@internal/langgraph-flow-serializer";
 *
 * const workflow = deserializeFrom(flowiseJson, "flowise");
 * const langflowJson = serializeAs(workflow, "langflow");
 * ```
 *
 * @example Mermaid export
 * ```typescript
 * import { toMermaid, deserialize } from "@internal/langgraph-flow-serializer";
 *
 * const workflow = deserialize(json);
 * console.log(toMermaid(workflow));
 * ```
 */

// Core types
export type {
  AIWorkflow,
  AINode,
  AIEdge,
  AIViewport,
  AINodeData,
  SerializerOptions,
} from "./types.js";
export { ValidationError } from "./types.js";

// Schema
export {
  AIWorkflowSchema,
  AINodeSchema,
  AIEdgeSchema,
  AIViewportSchema,
  AINodeDataSchema,
  type AIWorkflowInput,
  type AIWorkflowOutput,
} from "./schema.js";

// Serializer / deserializer
export { serialize } from "./serializer.js";
export { deserialize } from "./deserializer.js";

// Adapters
export {
  getAdapter,
  detectDialect,
  nativeAdapter,
  flowiseAdapter,
  langflowAdapter,
  langgraphTopologyAdapter,
  type DialectAdapter,
  type SupportedFormat,
} from "./adapters/index.js";

// Mermaid exporter
export { toMermaid } from "./exporters/mermaid.exporter.js";

// ──────────────────────────────────────────────────────────────────────────────
// Convenience functions
// ──────────────────────────────────────────────────────────────────────────────
// NOTE: The imports below are for use within this file only. The public re-exports
// further above expose the same symbols to consumers of this barrel module.

import type { AIWorkflow, SerializerOptions } from "./types.js";
import { serialize as _serialize } from "./serializer.js";
import { deserialize as _deserialize } from "./deserializer.js";
import {
  getAdapter as _getAdapter,
  detectDialect as _detectDialect,
} from "./adapters/index.js";
import type { SupportedFormat } from "./adapters/index.js";

/**
 * Serialize an AIWorkflow to a specific dialect JSON string.
 *
 * @param workflow - The universal workflow to serialize.
 * @param format   - Target dialect (default: 'native').
 * @param options  - Serializer options (prettyPrint, includeCredentials).
 */
export function serializeAs(
  workflow: AIWorkflow,
  format: string = "native",
  options: SerializerOptions = {}
): string {
  if (format === "native") {
    return _serialize(workflow, options);
  }
  const adapter = _getAdapter(format);
  const dialectObj = adapter.toDialect(workflow);
  const { prettyPrint = true } = options;
  return prettyPrint ? JSON.stringify(dialectObj, null, 2) : JSON.stringify(dialectObj);
}

/**
 * Deserialize a JSON string from a specific dialect (or auto-detect).
 *
 * @param json   - The JSON string to deserialize.
 * @param format - Source dialect. If omitted, dialect is auto-detected.
 */
export function deserializeFrom(json: string, format?: string): AIWorkflow {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (_err) {
    // Let _deserialize() handle the parse error with a ValidationError
    return _deserialize(json);
  }

  const resolvedFormat: SupportedFormat =
    (format as SupportedFormat | undefined) ?? _detectDialect(raw);

  if (resolvedFormat === "native") {
    return _deserialize(json);
  }

  const adapter = _getAdapter(resolvedFormat);
  return adapter.fromDialect(raw);
}
