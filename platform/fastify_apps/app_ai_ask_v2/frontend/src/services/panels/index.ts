import { FigmaPanel } from "./FigmaPanel";
import { GitHubPanel } from "./GitHubPanel";
import { JiraPanel } from "./JiraPanel";
import { ConfluencePanel } from "./ConfluencePanel";
import { SaucePanel } from "./SaucePanel";
import { StatsigPanel } from "./StatsigPanel";

export { FigmaPanel, GitHubPanel, JiraPanel, ConfluencePanel, SaucePanel, StatsigPanel };

export const PANELS: Record<string, React.FC> = {
  figma: FigmaPanel,
  github: GitHubPanel,
  jira: JiraPanel,
  confluence: ConfluencePanel,
  saucelabs: SaucePanel,
  statsig: StatsigPanel,
};
