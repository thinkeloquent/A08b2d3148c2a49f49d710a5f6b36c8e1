import type { PromptRegistryEntry } from "@/registry/types";
import { Placeholder } from "@/prompts/Placeholder";

const ProblemSolvingPlaceholder = () => Placeholder({ title: "Problem Solving" });

export const problemSolvingEntry: PromptRegistryEntry = {
  id: "problem-solving",
  title: "Problem Solving",
  sub: "Debug complex issues",
  regions: {
    left: [{ id: "ps-placeholder", component: ProblemSolvingPlaceholder, order: 1 }],
    main: [{ id: "ps-main-placeholder", component: ProblemSolvingPlaceholder, order: 1 }],
    right: [{ id: "ps-right-placeholder", component: ProblemSolvingPlaceholder, order: 1 }],
  },
};
