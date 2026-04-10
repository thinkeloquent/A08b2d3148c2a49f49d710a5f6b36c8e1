import type { PromptRegistryEntry } from "@/registry/types";
import { FigmaTeamsProjects } from "./FigmaTeamsProjects";
import { ConfigureFigmaAnalysis } from "./ConfigureFigmaAnalysis";
import { FigmaInsightsPreview } from "./FigmaInsightsPreview";

export const figmaAnalysisEntry: PromptRegistryEntry = {
  id: "figma-analysis",
  title: "Figma Analysis",
  sub: "Analyze design files & components",
  regions: {
    left: [{ id: "fa-teams-projects", component: FigmaTeamsProjects, order: 1 }],
    main: [{ id: "fa-configure", component: ConfigureFigmaAnalysis, order: 1 }],
    right: [{ id: "fa-insights-preview", component: FigmaInsightsPreview, order: 1 }],
  },
};
