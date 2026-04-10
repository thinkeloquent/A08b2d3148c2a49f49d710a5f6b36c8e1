import type { PromptRegistryEntry } from "@/registry/types";
import { StatsigExperimentExplorer } from "./StatsigExperimentExplorer";
import { ConfigureStatsigCampaign } from "./ConfigureStatsigCampaign";
import { StatsigCampaignPreview } from "./StatsigCampaignPreview";

export const statsigCampaignEntry: PromptRegistryEntry = {
  id: "statsig-campaign",
  title: "Statsig Campaign",
  sub: "Create & preview A/B test experiments",
  regions: {
    left: [{ id: "sc-experiment-explorer", component: StatsigExperimentExplorer, order: 1 }],
    main: [{ id: "sc-configure", component: ConfigureStatsigCampaign, order: 1 }],
    right: [{ id: "sc-campaign-preview", component: StatsigCampaignPreview, order: 1 }],
  },
};
