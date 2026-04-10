import type { PromptRegistryEntry } from "@/registry/types";
import { Placeholder } from "@/prompts/Placeholder";

const LearningPlaceholder = () => Placeholder({ title: "Learning" });

export const learningEntry: PromptRegistryEntry = {
  id: "learning",
  title: "Learning",
  sub: "Skill development",
  regions: {
    left: [{ id: "ln-placeholder", component: LearningPlaceholder, order: 1 }],
    main: [{ id: "ln-main-placeholder", component: LearningPlaceholder, order: 1 }],
    right: [{ id: "ln-right-placeholder", component: LearningPlaceholder, order: 1 }],
  },
};
