import type { PromptRegistryEntry } from "@/registry/types";
import { WorkflowExplorer } from "./WorkflowExplorer";
import { ConfigureWorkflowAnalysis } from "./ConfigureWorkflowAnalysis";
import { WorkflowHealthOverview } from "./WorkflowHealthOverview";

export const workflowAutomateEntry: PromptRegistryEntry = {
  id: "workflow-automate",
  title: "Workflow Automate",
  sub: "Analyze iPaaS & AI agent workflows",
  regions: {
    left: [{ id: "wa-workflow-explorer", component: WorkflowExplorer, order: 1 }],
    main: [{ id: "wa-configure", component: ConfigureWorkflowAnalysis, order: 1 }],
    right: [{ id: "wa-health-overview", component: WorkflowHealthOverview, order: 1 }],
  },
};
