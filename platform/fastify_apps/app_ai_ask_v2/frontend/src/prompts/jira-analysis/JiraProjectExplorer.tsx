import { useState } from "react";
import { JiraIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface JiraBoard {
  name: string;
  type: "Scrum" | "Kanban";
  sprints?: JiraSprint[];
}
interface JiraSprint {
  name: string;
  state: "active" | "closed" | "future";
  issues: number;
}
interface JiraProject {
  key: string;
  name: string;
  lead: string;
  boards: JiraBoard[];
}

const mockProjects: JiraProject[] = [
{
  key: "PLAT",
  name: "Platform Engineering",
  lead: "Alex R.",
  boards: [
  {
    name: "Platform Sprint Board",
    type: "Scrum",
    sprints: [
    { name: "Sprint 24", state: "active", issues: 18 },
    { name: "Sprint 23", state: "closed", issues: 22 },
    { name: "Sprint 25", state: "future", issues: 8 }]

  },
  { name: "Platform Kanban", type: "Kanban" }]

},
{
  key: "MOBILE",
  name: "Mobile App",
  lead: "Sasha K.",
  boards: [
  {
    name: "Mobile Sprint Board",
    type: "Scrum",
    sprints: [
    { name: "Sprint 12", state: "active", issues: 14 },
    { name: "Sprint 11", state: "closed", issues: 19 }]

  }]

},
{
  key: "INFRA",
  name: "Infrastructure",
  lead: "Jordan L.",
  boards: [
  { name: "Infra Kanban", type: "Kanban" }]

}];


const sprintStateColor: Record<string, string> = {
  active: "bg-blue-100 text-blue-700",
  closed: "bg-slate-100 text-slate-500",
  future: "bg-amber-100 text-amber-600"
};

const JiraProjectExplorer = () => {
  const [expandedProject, setExpandedProject] = useState<string | null>("PLAT");
  const [expandedBoard, setExpandedBoard] = useState<string | null>("Platform Sprint Board");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <JiraIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jira Projects</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search projects..." />

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockProjects.map((project) =>
        <div key={project.key} className="mb-1">
            <button
            onClick={() => setExpandedProject(expandedProject === project.key ? null : project.key)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

              <span className={`text-slate-400 transition-transform ${expandedProject === project.key ? "rotate-90" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-2e735a73">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
              <JiraIcon s={14} />
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{project.name}</p>
                <p className="text-xs text-slate-400">{project.key}</p>
              </div>
            </button>

            {expandedProject === project.key &&
          <div className="ml-4">
                {project.boards.map((board) =>
            <div key={board.name} className="mb-0.5">
                    <button
                onClick={() => setExpandedBoard(expandedBoard === board.name ? null : board.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                      <span className={`text-slate-400 transition-transform ${expandedBoard === board.name ? "rotate-90" : ""}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-a3d169ff">
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </span>
                      <span className="text-slate-400">{Icon.grid}</span>
                      <span className="text-xs font-medium text-slate-600 flex-1 text-left truncate">{board.name}</span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{board.type}</span>
                    </button>

                    {expandedBoard === board.name && board.sprints &&
              <div className="ml-5">
                        {board.sprints.map((sprint) =>
                <button
                  key={sprint.name}
                  onClick={() => setSelectedItem(selectedItem === sprint.name ? null : sprint.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                  selectedItem === sprint.name ?
                  "bg-blue-50 border border-blue-200" :
                  "hover:bg-slate-50"}`
                  }>

                            <span className="text-slate-400">{Icon.flag}</span>
                            <div className="text-left flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${
                    selectedItem === sprint.name ? "text-blue-700" : "text-slate-700"}`
                    }>
                                {sprint.name}
                              </p>
                              <p className="text-xs text-slate-400">{sprint.issues} issues</p>
                            </div>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${sprintStateColor[sprint.state]}`}>
                              {sprint.state}
                            </span>
                          </button>
                )}
                      </div>
              }

                    {expandedBoard === board.name && !board.sprints &&
              <div className="ml-5">
                        <button
                  onClick={() => setSelectedItem(selectedItem === board.name ? null : board.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                  selectedItem === board.name ?
                  "bg-blue-50 border border-blue-200" :
                  "hover:bg-slate-50"}`
                  }>

                          <span className="text-slate-400">{Icon.list}</span>
                          <p className={`text-xs font-medium flex-1 text-left ${
                  selectedItem === board.name ? "text-blue-700" : "text-slate-600"}`
                  }>
                            View Board
                          </p>
                        </button>
                      </div>
              }
                  </div>
            )}
              </div>
          }
          </div>
        )}
      </div>

      {selectedItem &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <JiraIcon s={16} />
            <span className="text-xs text-blue-700 font-medium flex-1 truncate">{selectedItem}</span>
            <span className="text-xs text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { JiraProjectExplorer };