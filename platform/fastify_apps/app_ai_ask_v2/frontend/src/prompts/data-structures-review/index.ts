import type { PromptRegistryEntry } from "@/registry/types";
import { RepoSchemaExplorer } from "./RepoSchemaExplorer";
import { ConfigureStructureReview } from "./ConfigureStructureReview";
import { StructureHealthOverview } from "./StructureHealthOverview";

export const dataStructuresReviewEntry: PromptRegistryEntry = {
  id: "data-structures-review",
  title: "Data Structures Review",
  sub: "Review & optimize schemas from GitHub repos",
  regions: {
    left: [{ id: "dsr-repo-explorer", component: RepoSchemaExplorer, order: 1 }],
    main: [{ id: "dsr-configure", component: ConfigureStructureReview, order: 1 }],
    right: [{ id: "dsr-health-overview", component: StructureHealthOverview, order: 1 }],
  },
};
