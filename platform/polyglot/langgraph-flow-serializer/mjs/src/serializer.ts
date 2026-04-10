/**
 * Serializer: AIWorkflow → JSON string.
 *
 * Deep-clones the workflow before serialization so the caller's object is
 * never mutated. Credentials are stripped by default.
 */

import type { AIWorkflow, AINode, SerializerOptions } from "./types.js";

function stripCredentials(node: AINode): AINode {
  const { credentials: _stripped, ...dataWithoutCreds } = node.data;
  return { ...node, data: dataWithoutCreds };
}

/**
 * Serialize an AIWorkflow to a JSON string.
 *
 * @param workflow - The workflow object to serialize.
 * @param options  - Optional serialization options.
 * @returns A JSON string representation of the workflow.
 */
export function serialize(workflow: AIWorkflow, options: SerializerOptions = {}): string {
  const { prettyPrint = true, includeCredentials = false } = options;

  // Deep clone to avoid mutating caller's data
  const clone: AIWorkflow = JSON.parse(JSON.stringify(workflow));

  if (!includeCredentials) {
    clone.nodes = clone.nodes.map(stripCredentials);
  }

  return prettyPrint ? JSON.stringify(clone, null, 2) : JSON.stringify(clone);
}
