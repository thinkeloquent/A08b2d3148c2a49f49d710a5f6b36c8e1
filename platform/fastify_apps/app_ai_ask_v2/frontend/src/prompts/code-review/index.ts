import type { PromptRegistryEntry } from "@/registry/types";
import { ConnectedProjects } from "./ConnectedProjects";
import { ServicesPanel } from "./ServicesPanel";
import { ConfigureCodeReview } from "./ConfigureCodeReview";
import { AIAnalysis } from "./AIAnalysis";
import { KeyFindings } from "./KeyFindings";
import { PerformanceForecast } from "./PerformanceForecast";
import { RelatedContext } from "./RelatedContext";
import { TestHarness } from "./TestHarness";

export const codeReviewEntry: PromptRegistryEntry = {
  id: "code-review",
  title: "Code Review",
  sub: "Analyze & improve code",
  regions: {
    left: [
      { id: "cr-connected-projects", component: ConnectedProjects, order: 1 },
      { id: "cr-services-panel", component: ServicesPanel, order: 2 },
    ],
    main: [
      { id: "cr-configure", component: ConfigureCodeReview, order: 1 },
    ],
    right: [
      { id: "cr-ai-analysis", component: AIAnalysis, order: 1 },
      { id: "cr-key-findings", component: KeyFindings, order: 2 },
      { id: "cr-perf-forecast", component: PerformanceForecast, order: 3 },
      { id: "cr-related-context", component: RelatedContext, order: 4 },
      { id: "cr-test-harness", component: TestHarness, order: 5 },
    ],
  },
};
