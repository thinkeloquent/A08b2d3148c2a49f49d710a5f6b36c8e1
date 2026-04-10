import { FigmaIcon, GitHubIcon, JiraIcon, ConfluenceIcon, SauceIcon, StatsigIcon } from "@/shared/brand-icons";
import type { ServiceDef } from "./types";

export const SERVICES: ServiceDef[] = [
  { id: "figma", label: "Figma", Icon: FigmaIcon, borderAccent: "#F24E1E", bgClass: "bg-orange-50", textClass: "text-orange-700", desc: "Browse design files & frames" },
  { id: "github", label: "GitHub", Icon: GitHubIcon, borderAccent: "#24292e", bgClass: "bg-slate-50", textClass: "text-slate-700", desc: "Link repos, branches & PRs" },
  { id: "jira", label: "Jira", Icon: JiraIcon, borderAccent: "#2684FF", bgClass: "bg-blue-50", textClass: "text-blue-700", desc: "Reference tickets & sprints" },
  { id: "confluence", label: "Confluence", Icon: ConfluenceIcon, borderAccent: "#2684FF", bgClass: "bg-sky-50", textClass: "text-sky-700", desc: "Search docs & pages" },
  { id: "saucelabs", label: "SauceLabs", Icon: SauceIcon, borderAccent: "#E2231A", bgClass: "bg-red-50", textClass: "text-red-700", desc: "Run cross-browser test suites" },
  { id: "statsig", label: "Statsig", Icon: StatsigIcon, borderAccent: "#4ADE80", bgClass: "bg-emerald-50", textClass: "text-emerald-700", desc: "Feature flags & experiments" },
];
