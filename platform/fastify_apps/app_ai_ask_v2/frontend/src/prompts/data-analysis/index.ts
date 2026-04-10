import type { PromptRegistryEntry } from "@/registry/types";
import { Placeholder } from "@/prompts/Placeholder";

const DataAnalysisPlaceholder = () => Placeholder({ title: "Data Analysis" });

export const dataAnalysisEntry: PromptRegistryEntry = {
  id: "data-analysis",
  title: "Data Analysis",
  sub: "Extract data insights",
  regions: {
    left: [{ id: "da-placeholder", component: DataAnalysisPlaceholder, order: 1 }],
    main: [{ id: "da-main-placeholder", component: DataAnalysisPlaceholder, order: 1 }],
    right: [{ id: "da-right-placeholder", component: DataAnalysisPlaceholder, order: 1 }],
  },
};
