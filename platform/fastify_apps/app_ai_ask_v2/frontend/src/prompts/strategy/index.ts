import type { PromptRegistryEntry } from "@/registry/types";
import { Placeholder } from "@/prompts/Placeholder";

const StrategyPlaceholder = () => Placeholder({ title: "Strategy" });

export const strategyEntry: PromptRegistryEntry = {
  id: "strategy",
  title: "Strategy",
  sub: "Business insights",
  regions: {
    left: [{ id: "st-placeholder", component: StrategyPlaceholder, order: 1 }],
    main: [{ id: "st-main-placeholder", component: StrategyPlaceholder, order: 1 }],
    right: [{ id: "st-right-placeholder", component: StrategyPlaceholder, order: 1 }],
  },
};
