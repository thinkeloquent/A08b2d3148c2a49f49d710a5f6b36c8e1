import type { PromptRegistryEntry } from "@/registry/types";
import { ConfluenceSpaceExplorer } from "./ConfluenceSpaceExplorer";
import { ConfigureConfluenceAnalysis } from "./ConfigureConfluenceAnalysis";
import { ConfluenceHealthOverview } from "./ConfluenceHealthOverview";

export const confluenceAnalysisEntry: PromptRegistryEntry = {
  id: "confluence-analysis",
  title: "Confluence Analysis",
  sub: "Analyze content health & engagement",
  regions: {
    left: [{ id: "ca-space-explorer", component: ConfluenceSpaceExplorer, order: 1 }],
    main: [{ id: "ca-configure", component: ConfigureConfluenceAnalysis, order: 1 }],
    right: [{ id: "ca-health-overview", component: ConfluenceHealthOverview, order: 1 }],
  },
};
