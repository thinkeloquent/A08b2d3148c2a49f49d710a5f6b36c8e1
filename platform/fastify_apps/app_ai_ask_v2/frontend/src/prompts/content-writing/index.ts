import type { PromptRegistryEntry } from "@/registry/types";
import { Placeholder } from "@/prompts/Placeholder";

const ContentWritingPlaceholder = () => Placeholder({ title: "Content Writing" });

export const contentWritingEntry: PromptRegistryEntry = {
  id: "content-writing",
  title: "Content Writing",
  sub: "Create engaging content",
  regions: {
    left: [{ id: "cw-placeholder", component: ContentWritingPlaceholder, order: 1 }],
    main: [{ id: "cw-main-placeholder", component: ContentWritingPlaceholder, order: 1 }],
    right: [{ id: "cw-right-placeholder", component: ContentWritingPlaceholder, order: 1 }],
  },
};
