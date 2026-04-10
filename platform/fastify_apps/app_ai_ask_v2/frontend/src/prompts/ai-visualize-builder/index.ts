import type { PromptRegistryEntry } from "@/registry/types";
import { AgentExplorer } from "./AgentExplorer";
import { ConfigureVisualBuilder } from "./ConfigureVisualBuilder";
import { BuilderHealthOverview } from "./BuilderHealthOverview";

export const aiVisualizeBuilderEntry: PromptRegistryEntry = {
  id: "ai-visualize-builder",
  title: "AI Visualize Builder",
  sub: "Analyze visual AI agent flows & health",
  regions: {
    left: [{ id: "avb-agent-explorer", component: AgentExplorer, order: 1 }],
    main: [{ id: "avb-configure", component: ConfigureVisualBuilder, order: 1 }],
    right: [{ id: "avb-health-overview", component: BuilderHealthOverview, order: 1 }],
  },
};
