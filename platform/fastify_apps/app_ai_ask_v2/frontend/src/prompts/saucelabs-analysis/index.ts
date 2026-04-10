import type { PromptRegistryEntry } from "@/registry/types";
import { SauceTestExplorer } from "./SauceTestExplorer";
import { ConfigureSauceAnalysis } from "./ConfigureSauceAnalysis";
import { SauceHealthOverview } from "./SauceHealthOverview";

export const saucelabsAnalysisEntry: PromptRegistryEntry = {
  id: "saucelabs-analysis",
  title: "Sauce Labs Analysis",
  sub: "Analyze test health & cross-browser coverage",
  regions: {
    left: [{ id: "sl-test-explorer", component: SauceTestExplorer, order: 1 }],
    main: [{ id: "sl-configure", component: ConfigureSauceAnalysis, order: 1 }],
    right: [{ id: "sl-health-overview", component: SauceHealthOverview, order: 1 }],
  },
};
