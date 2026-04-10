import type { PromptRegistryEntry } from "@/registry/types";
import { JiraProjectExplorer } from "./JiraProjectExplorer";
import { ConfigureJiraAnalysis } from "./ConfigureJiraAnalysis";
import { JiraHealthOverview } from "./JiraHealthOverview";

export const jiraAnalysisEntry: PromptRegistryEntry = {
  id: "jira-analysis",
  title: "Jira Analysis",
  sub: "Analyze project health & sprint metrics",
  regions: {
    left: [{ id: "ja-project-explorer", component: JiraProjectExplorer, order: 1 }],
    main: [{ id: "ja-configure", component: ConfigureJiraAnalysis, order: 1 }],
    right: [{ id: "ja-health-overview", component: JiraHealthOverview, order: 1 }],
  },
};
