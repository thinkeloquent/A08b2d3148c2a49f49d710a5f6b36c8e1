/**
 * Zod v3 schema definitions for the universal AIWorkflow graph schema.
 * Validates structure, required fields, node ID uniqueness, and edge references.
 */

import { z } from "zod";

export const AIViewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
});

export const AINodeDataSchema = z.object({
  nodeType: z.string().min(1, "nodeType is required"),
  category: z.string().min(1, "category is required"),
  name: z.string().optional(),
  inputs: z.record(z.unknown()).default({}),
  credentials: z.record(z.string()).optional(),
});

export const AINodeSchema = z.object({
  id: z.string().min(1, "node id is required"),
  type: z.string().min(1, "node type is required"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: AINodeDataSchema,
});

export const AIEdgeSchema = z.object({
  id: z.string().min(1, "edge id is required"),
  source: z.string().min(1, "edge source is required"),
  sourceHandle: z.string().min(1, "edge sourceHandle is required"),
  target: z.string().min(1, "edge target is required"),
  targetHandle: z.string().min(1, "edge targetHandle is required"),
  type: z.string().optional(),
});

export const AIWorkflowSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "workflow name is required"),
    description: z.string().optional(),
    viewport: AIViewportSchema.optional(),
    nodes: z.array(AINodeSchema),
    edges: z.array(AIEdgeSchema),
  })
  .superRefine((workflow, ctx) => {
    // Validate node ID uniqueness
    const nodeIds = workflow.nodes.map((n) => n.id);
    const seen = new Set<string>();
    for (const id of nodeIds) {
      if (seen.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate node id: "${id}"`,
          path: ["nodes"],
        });
      }
      seen.add(id);
    }

    // Validate edge source/target reference existing node IDs
    const nodeIdSet = new Set(nodeIds);
    for (let i = 0; i < workflow.edges.length; i++) {
      const edge = workflow.edges[i];
      if (!nodeIdSet.has(edge.source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edge.id}" references unknown source node: "${edge.source}"`,
          path: ["edges", i, "source"],
        });
      }
      if (!nodeIdSet.has(edge.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edge.id}" references unknown target node: "${edge.target}"`,
          path: ["edges", i, "target"],
        });
      }
    }
  });

export type AIWorkflowInput = z.input<typeof AIWorkflowSchema>;
export type AIWorkflowOutput = z.output<typeof AIWorkflowSchema>;
