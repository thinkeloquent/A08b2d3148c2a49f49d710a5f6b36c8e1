import { useState } from "react";
import { Icon } from "@/shared/icons";

interface WorkflowStep {
  name: string;
  type: "trigger" | "action" | "condition" | "agent";
  connector?: string;
}

interface Workflow {
  name: string;
  status: "active" | "draft" | "paused" | "error";
  runs: number;
  lastRun?: string;
  steps: WorkflowStep[];
}

interface WorkflowFolder {
  name: string;
  category: "operations" | "marketing" | "revenue" | "agents";
  workflows: Workflow[];
}

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-500",
  paused: "bg-amber-100 text-amber-600",
  error: "bg-red-100 text-red-700"
};

const statusDot: Record<string, string> = {
  active: "bg-emerald-500 animate-pulse",
  draft: "bg-slate-400",
  paused: "bg-amber-500",
  error: "bg-red-500"
};

const stepIcon: Record<string, string> = {
  trigger: "text-blue-500",
  action: "text-emerald-500",
  condition: "text-amber-500",
  agent: "text-purple-500"
};

const mockFolders: WorkflowFolder[] = [
{
  name: "Operations",
  category: "operations",
  workflows: [
  {
    name: "Jira → Slack Notifier",
    status: "active",
    runs: 1842,
    lastRun: "2m ago",
    steps: [
    { name: "Jira Issue Created", type: "trigger", connector: "Jira" },
    { name: "Filter by Priority", type: "condition" },
    { name: "Post to Slack", type: "action", connector: "Slack" }]

  },
  {
    name: "Incident Escalation",
    status: "active",
    runs: 267,
    lastRun: "1h ago",
    steps: [
    { name: "PagerDuty Alert", type: "trigger", connector: "PagerDuty" },
    { name: "AI Triage Agent", type: "agent" },
    { name: "Create Confluence Page", type: "action", connector: "Confluence" },
    { name: "Notify On-Call", type: "action", connector: "Slack" }]

  }]

},
{
  name: "Marketing",
  category: "marketing",
  workflows: [
  {
    name: "Lead Enrichment Pipeline",
    status: "active",
    runs: 5430,
    lastRun: "5m ago",
    steps: [
    { name: "New HubSpot Contact", type: "trigger", connector: "HubSpot" },
    { name: "Clearbit Enrichment", type: "action", connector: "Clearbit" },
    { name: "AI Scoring Agent", type: "agent" },
    { name: "Update Salesforce", type: "action", connector: "Salesforce" }]

  },
  {
    name: "Campaign Sync",
    status: "paused",
    runs: 890,
    lastRun: "3d ago",
    steps: [
    { name: "Scheduled (daily)", type: "trigger" },
    { name: "Fetch Mailchimp Stats", type: "action", connector: "Mailchimp" },
    { name: "Write to BigQuery", type: "action", connector: "BigQuery" }]

  }]

},
{
  name: "AI Agents",
  category: "agents",
  workflows: [
  {
    name: "Support Ticket Auto-Reply",
    status: "active",
    runs: 3120,
    lastRun: "30s ago",
    steps: [
    { name: "Zendesk Ticket Created", type: "trigger", connector: "Zendesk" },
    { name: "AI Classification Agent", type: "agent" },
    { name: "Knowledge Base Lookup", type: "action", connector: "Confluence" },
    { name: "AI Response Agent", type: "agent" },
    { name: "Route or Reply", type: "condition" }]

  },
  {
    name: "Data Quality Monitor",
    status: "error",
    runs: 412,
    lastRun: "15m ago",
    steps: [
    { name: "Scheduled (hourly)", type: "trigger" },
    { name: "AI Anomaly Agent", type: "agent" },
    { name: "Alert if threshold", type: "condition" },
    { name: "Post to Slack", type: "action", connector: "Slack" }]

  }]

}];


const WorkflowExplorer = () => {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("AI Agents");
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>("Support Ticket Auto-Reply");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "error">("all");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workflows</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search workflows..." />

        </div>
        <div className="flex gap-1">
          {(["all", "active", "draft", "error"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-1.5 py-1 rounded-md text-xs font-medium transition-all ${
            filter === f ?
            "bg-indigo-600 text-white" :
            "bg-slate-50 text-slate-500 hover:bg-slate-100"}`
            }>

              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockFolders.map((folder) => {
          const filtered = filter === "all" ?
          folder.workflows :
          folder.workflows.filter((w) => w.status === filter);
          if (filtered.length === 0) return null;

          return (
            <div key={folder.name} className="mb-1">
              <button
                onClick={() => setExpandedFolder(expandedFolder === folder.name ? null : folder.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                <span className={`text-slate-400 transition-transform ${expandedFolder === folder.name ? "rotate-90" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-ad455f8b">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
                <span className="text-slate-400">{Icon.grid}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{folder.name}</p>
                  <p className="text-xs text-slate-400">{filtered.length} workflows</p>
                </div>
              </button>

              {expandedFolder === folder.name &&
              <div className="ml-4">
                  {filtered.map((wf) =>
                <div key={wf.name} className="mb-0.5">
                      <button
                    onClick={() => setExpandedWorkflow(expandedWorkflow === wf.name ? null : wf.name)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    selectedItem === wf.name ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50"}`
                    }>

                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[wf.status]}`} />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{wf.name}</p>
                          <p className="text-xs text-slate-400">{wf.runs.toLocaleString()} runs &middot; {wf.lastRun || "never"}</p>
                        </div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${statusColor[wf.status]}`}>
                          {wf.status}
                        </span>
                      </button>

                      {expandedWorkflow === wf.name &&
                  <div className="ml-5 mt-0.5 mb-1">
                          {wf.steps.map((step, i) =>
                    <button
                      key={i}
                      onClick={() => setSelectedItem(selectedItem === `${wf.name}::${step.name}` ? null : `${wf.name}::${step.name}`)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors mb-0.5 ${
                      selectedItem === `${wf.name}::${step.name}` ?
                      "bg-indigo-50 border border-indigo-200" :
                      "hover:bg-slate-50"}`
                      }>

                              <span className={`flex-shrink-0 ${stepIcon[step.type]}`}>
                                {step.type === "trigger" && Icon.play}
                                {step.type === "action" && Icon.settings}
                                {step.type === "condition" && Icon.help}
                                {step.type === "agent" &&
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" data-test-id="svg-c1062d3a">
                                    <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM6 21v-2a6 6 0 0 1 12 0v2" />
                                  </svg>
                        }
                              </span>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-xs text-slate-600 truncate">{step.name}</p>
                              </div>
                              {step.connector &&
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{step.connector}</span>
                      }
                            </button>
                    )}
                        </div>
                  }
                    </div>
                )}
                </div>
              }
            </div>);

        })}
      </div>

      {selectedItem &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-700 font-medium flex-1 truncate">
              {selectedItem.includes("::") ? selectedItem.split("::")[1] : selectedItem}
            </span>
            <span className="text-xs text-indigo-600 bg-white border border-indigo-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { WorkflowExplorer };