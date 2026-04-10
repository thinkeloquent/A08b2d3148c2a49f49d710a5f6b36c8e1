import { useState } from "react";
import { Icon } from "@/shared/icons";

interface AgentNode {
  name: string;
  type: "llm" | "tool" | "human" | "router" | "output";
}

interface AgentFlow {
  name: string;
  status: "deployed" | "draft" | "testing" | "error";
  platform: string;
  nodes: AgentNode[];
  lastEdited: string;
  executions?: number;
}

interface FlowFolder {
  name: string;
  flows: AgentFlow[];
}

const statusColor: Record<string, string> = {
  deployed: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-500",
  testing: "bg-blue-100 text-blue-700",
  error: "bg-red-100 text-red-700"
};

const statusDot: Record<string, string> = {
  deployed: "bg-emerald-500 animate-pulse",
  draft: "bg-slate-400",
  testing: "bg-blue-500",
  error: "bg-red-500"
};

const nodeColor: Record<string, string> = {
  llm: "text-purple-500",
  tool: "text-emerald-500",
  human: "text-amber-500",
  router: "text-blue-500",
  output: "text-slate-500"
};

const mockFolders: FlowFolder[] = [
{
  name: "Customer Support",
  flows: [
  {
    name: "Ticket Triage Agent",
    status: "deployed",
    platform: "LangFlow",
    lastEdited: "1h ago",
    executions: 4280,
    nodes: [
    { name: "Ingest Ticket", type: "tool" },
    { name: "Classify Intent (GPT-4)", type: "llm" },
    { name: "Route by Category", type: "router" },
    { name: "Escalate to Human", type: "human" },
    { name: "Auto-Reply Draft", type: "llm" },
    { name: "Send Response", type: "output" }]

  },
  {
    name: "FAQ Retrieval Bot",
    status: "deployed",
    platform: "Flowise",
    lastEdited: "3d ago",
    executions: 12400,
    nodes: [
    { name: "User Query", type: "tool" },
    { name: "Vector Search", type: "tool" },
    { name: "Generate Answer (Claude)", type: "llm" },
    { name: "Return Response", type: "output" }]

  }]

},
{
  name: "Internal Ops",
  flows: [
  {
    name: "Document Summarizer",
    status: "testing",
    platform: "Dify",
    lastEdited: "2h ago",
    executions: 85,
    nodes: [
    { name: "Upload Document", type: "tool" },
    { name: "Chunk & Embed", type: "tool" },
    { name: "Summarize (Claude)", type: "llm" },
    { name: "Human Review Gate", type: "human" },
    { name: "Save to Notion", type: "output" }]

  },
  {
    name: "Meeting Action Items",
    status: "draft",
    platform: "n8n + AI",
    lastEdited: "1d ago",
    nodes: [
    { name: "Transcribe Recording", type: "tool" },
    { name: "Extract Actions (GPT-4)", type: "llm" },
    { name: "Assign Owners", type: "human" },
    { name: "Create Jira Tasks", type: "output" }]

  }]

},
{
  name: "Data & Analytics",
  flows: [
  {
    name: "Chart Generator Agent",
    status: "deployed",
    platform: "CrewAI Studio",
    lastEdited: "5h ago",
    executions: 620,
    nodes: [
    { name: "Natural Language Query", type: "tool" },
    { name: "SQL Generator (LLM)", type: "llm" },
    { name: "Execute Query", type: "tool" },
    { name: "Visualize Results", type: "output" }]

  },
  {
    name: "Anomaly Alert Pipeline",
    status: "error",
    platform: "Flowise",
    lastEdited: "6h ago",
    executions: 190,
    nodes: [
    { name: "Scheduled Data Pull", type: "tool" },
    { name: "Anomaly Detection (LLM)", type: "llm" },
    { name: "Severity Router", type: "router" },
    { name: "Notify Team", type: "output" }]

  }]

}];


const AgentExplorer = () => {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("Customer Support");
  const [expandedFlow, setExpandedFlow] = useState<string | null>("Ticket Triage Agent");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "deployed" | "draft" | "testing">("all");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent Flows</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search flows..." />

        </div>
        <div className="flex gap-1">
          {(["all", "deployed", "draft", "testing"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-1.5 py-1 rounded-md text-xs font-medium transition-all ${
            filter === f ?
            "bg-violet-600 text-white" :
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
          folder.flows :
          folder.flows.filter((f) => f.status === filter);
          if (filtered.length === 0) return null;

          return (
            <div key={folder.name} className="mb-1">
              <button
                onClick={() => setExpandedFolder(expandedFolder === folder.name ? null : folder.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                <span className={`text-slate-400 transition-transform ${expandedFolder === folder.name ? "rotate-90" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-a4e3fa93">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
                <span className="text-slate-400">{Icon.grid}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{folder.name}</p>
                  <p className="text-xs text-slate-400">{filtered.length} flows</p>
                </div>
              </button>

              {expandedFolder === folder.name &&
              <div className="ml-4">
                  {filtered.map((flow) =>
                <div key={flow.name} className="mb-0.5">
                      <button
                    onClick={() => setExpandedFlow(expandedFlow === flow.name ? null : flow.name)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    selectedItem === flow.name ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50"}`
                    }>

                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[flow.status]}`} />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">{flow.name}</p>
                          <p className="text-xs text-slate-400">
                            {flow.platform} &middot; {flow.executions?.toLocaleString() || "0"} runs
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${statusColor[flow.status]}`}>
                          {flow.status}
                        </span>
                      </button>

                      {expandedFlow === flow.name &&
                  <div className="ml-5 mt-0.5 mb-1">
                          {flow.nodes.map((node, i) =>
                    <button
                      key={i}
                      onClick={() => setSelectedItem(selectedItem === `${flow.name}::${node.name}` ? null : `${flow.name}::${node.name}`)}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors mb-0.5 ${
                      selectedItem === `${flow.name}::${node.name}` ?
                      "bg-violet-50 border border-violet-200" :
                      "hover:bg-slate-50"}`
                      }>

                              <span className={`flex-shrink-0 ${nodeColor[node.type]}`}>
                                {node.type === "llm" &&
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" data-test-id="svg-034b26fc">
                                    <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zM6 21v-2a6 6 0 0 1 12 0v2" />
                                  </svg>
                        }
                                {node.type === "tool" && Icon.settings}
                                {node.type === "human" && Icon.users}
                                {node.type === "router" && Icon.help}
                                {node.type === "output" && Icon.check}
                              </span>
                              <span className="text-xs text-slate-600 flex-1 text-left truncate">{node.name}</span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{node.type}</span>
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
      <div className="px-3 py-2.5 border-t border-slate-100 bg-violet-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-violet-700 font-medium flex-1 truncate">
              {selectedItem.includes("::") ? selectedItem.split("::")[1] : selectedItem}
            </span>
            <span className="text-xs text-violet-600 bg-white border border-violet-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { AgentExplorer };