/**
 * Adapter registry.
 *
 * Supported formats: 'native', 'flowise', 'langflow', 'langgraph-topology'
 *
 * Usage:
 *   const adapter = getAdapter('flowise');
 *   const workflow = adapter.fromDialect(flowiseJson);
 *
 *   const format = detectDialect(unknownJson);
 */

import type { DialectAdapter } from "./adapter.js";
import { nativeAdapter } from "./native.adapter.js";
import { flowiseAdapter } from "./flowise.adapter.js";
import { langflowAdapter } from "./langflow.adapter.js";
import { langgraphTopologyAdapter } from "./langgraph-topology.adapter.js";

export type SupportedFormat = "native" | "flowise" | "langflow" | "langgraph-topology";

const registry: Record<SupportedFormat, DialectAdapter> = {
  native: nativeAdapter,
  flowise: flowiseAdapter,
  langflow: langflowAdapter,
  "langgraph-topology": langgraphTopologyAdapter,
};

/**
 * Get the adapter for a specific format.
 *
 * @throws Error if the format is not recognized.
 */
export function getAdapter(format: string): DialectAdapter {
  const adapter = registry[format as SupportedFormat];
  if (!adapter) {
    const supported = Object.keys(registry).join(", ");
    throw new Error(
      `Unknown dialect format: "${format}". Supported formats: ${supported}`
    );
  }
  return adapter;
}

/**
 * Auto-detect the dialect of a JSON object by running each adapter's
 * detect() heuristic in priority order.
 *
 * Detection order:
 *   1. langgraph-topology (most specific structure)
 *   2. langflow (data.node.template signature)
 *   3. flowise (data.name camelCase signature)
 *   4. native (fallback: has name + nodes + edges)
 *
 * Returns 'native' if no specific dialect is detected.
 */
export function detectDialect(json: unknown): SupportedFormat {
  const checks: SupportedFormat[] = ["langgraph-topology", "langflow", "flowise", "native"];
  for (const format of checks) {
    if (registry[format].detect(json)) {
      return format;
    }
  }
  return "native";
}

// Re-export individual adapters for direct use
export { nativeAdapter } from "./native.adapter.js";
export { flowiseAdapter } from "./flowise.adapter.js";
export { langflowAdapter } from "./langflow.adapter.js";
export { langgraphTopologyAdapter } from "./langgraph-topology.adapter.js";
export type { DialectAdapter } from "./adapter.js";
