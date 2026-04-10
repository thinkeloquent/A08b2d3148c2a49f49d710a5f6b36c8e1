import type { PromptRegistryEntry } from "@/registry/types";
import { RepoExplorer } from "./RepoExplorer";
import { ConfigureRepoAnalysis } from "./ConfigureRepoAnalysis";
import { RepoHealthOverview } from "./RepoHealthOverview";

export const githubRepoAnalysisEntry: PromptRegistryEntry = {
  id: "github-repo-analysis",
  title: "GitHub Repo Analysis",
  sub: "Analyze repo health & security",
  regions: {
    left: [{ id: "gra-repo-explorer", component: RepoExplorer, order: 1 }],
    main: [{ id: "gra-configure", component: ConfigureRepoAnalysis, order: 1 }],
    right: [{ id: "gra-health-overview", component: RepoHealthOverview, order: 1 }],
  },
};
