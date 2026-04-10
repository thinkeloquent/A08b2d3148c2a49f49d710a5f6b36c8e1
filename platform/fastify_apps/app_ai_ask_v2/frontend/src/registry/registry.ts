import type { PromptRegistryEntry } from "./types";
import { codeReviewEntry } from "@/prompts/code-review";

import { figmaAnalysisEntry } from "@/prompts/figma-analysis";
import { githubRepoAnalysisEntry } from "@/prompts/github-repo-analysis";
import { jiraAnalysisEntry } from "@/prompts/jira-analysis";
import { confluenceAnalysisEntry } from "@/prompts/confluence-analysis";
import { saucelabsAnalysisEntry } from "@/prompts/saucelabs-analysis";
import { statsigCampaignEntry } from "@/prompts/statsig-campaign";
import { workflowAutomateEntry } from "@/prompts/workflow-automate";
import { aiVisualizeBuilderEntry } from "@/prompts/ai-visualize-builder";
import { dataStructuresReviewEntry } from "@/prompts/data-structures-review";

export const PROMPT_REGISTRY: PromptRegistryEntry[] = [
  codeReviewEntry,
  figmaAnalysisEntry,
  githubRepoAnalysisEntry,
  jiraAnalysisEntry,
  confluenceAnalysisEntry,
  saucelabsAnalysisEntry,
  statsigCampaignEntry,
  workflowAutomateEntry,
  aiVisualizeBuilderEntry,
  dataStructuresReviewEntry,
];

export function getPromptEntry(id: string): PromptRegistryEntry | undefined {
  return PROMPT_REGISTRY.find((e) => e.id === id);
}
