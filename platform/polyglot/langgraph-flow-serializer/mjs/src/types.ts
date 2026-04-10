/**
 * Core types for the LangGraph Flow Serializer.
 * Universal Node-Edge Graph schema compatible with React Flow, Flowise, and Langflow.
 */

export interface AIViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface AINodeData {
  /** LangChain class name (e.g., "ChatOpenAI") */
  nodeType: string;
  /** Grouping category (e.g., "Chat Models", "Agents") */
  category: string;
  /** Display label */
  name?: string;
  /** Input parameters for the node */
  inputs: Record<string, unknown>;
  /** Credentials — stripped unless includeCredentials is true */
  credentials?: Record<string, string>;
}

export interface AINode {
  id: string;
  /** React Flow component type (e.g., "customNode") */
  type: string;
  position: { x: number; y: number };
  data: AINodeData;
}

export interface AIEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  /** React Flow edge type (e.g., "smoothstep") */
  type?: string;
}

export interface AIWorkflow {
  id?: string;
  name: string;
  description?: string;
  viewport?: AIViewport;
  nodes: AINode[];
  edges: AIEdge[];
}

export interface SerializerOptions {
  /** Whether to pretty-print the JSON output. Defaults to true. */
  prettyPrint?: boolean;
  /** Whether to include credential fields in serialized output. Defaults to false. */
  includeCredentials?: boolean;
}

/**
 * Thrown when a workflow JSON fails schema validation.
 */
export class ValidationError extends Error {
  public readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
    // Maintain proper prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
