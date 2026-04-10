import { useState } from "react";
import { FigmaIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface FigmaTeam {
  name: string;
  projects: FigmaProject[];
}
interface FigmaProject {
  name: string;
  files: FigmaFile[];
}
interface FigmaFile {
  name: string;
  updated: string;
}

const mockTeams: FigmaTeam[] = [
{
  name: "Product Design",
  projects: [
  {
    name: "Main App",
    files: [
    { name: "Main App UI v2.3", updated: "2h ago" },
    { name: "Main App UI v2.2", updated: "3d ago" }]

  },
  {
    name: "Design System",
    files: [
    { name: "Design System v1.5", updated: "1d ago" },
    { name: "Design System v1.4", updated: "1w ago" }]

  }]

},
{
  name: "Mobile Team",
  projects: [
  {
    name: "iOS App",
    files: [
    { name: "Onboarding Flow", updated: "Yesterday" },
    { name: "Mobile Prototype", updated: "1w ago" }]

  }]

}];


const FigmaTeamsProjects = () => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>("Product Design");
  const [expandedProject, setExpandedProject] = useState<string | null>("Main App");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <FigmaIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Figma Files</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search files..." />

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {mockTeams.map((team) =>
        <div key={team.name} className="mb-1">
            <button
            onClick={() => setExpandedTeam(expandedTeam === team.name ? null : team.name)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

              <span className={`text-slate-400 transition-transform ${expandedTeam === team.name ? "rotate-90" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-891a239f">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
              <span className="text-slate-500">{Icon.users}</span>
              <span className="text-xs font-semibold text-slate-700">{team.name}</span>
              <span className="text-xs text-slate-400 ml-auto">{team.projects.length}</span>
            </button>

            {expandedTeam === team.name &&
          <div className="ml-4">
                {team.projects.map((project) =>
            <div key={project.name} className="mb-0.5">
                    <button
                onClick={() => setExpandedProject(expandedProject === project.name ? null : project.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                      <span className={`text-slate-400 transition-transform ${expandedProject === project.name ? "rotate-90" : ""}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-6644294c">
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </span>
                      <span className="text-slate-400">{Icon.grid}</span>
                      <span className="text-xs font-medium text-slate-600">{project.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{project.files.length}</span>
                    </button>

                    {expandedProject === project.name &&
              <div className="ml-5">
                        {project.files.map((file) =>
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(selectedFile === file.name ? null : file.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                  selectedFile === file.name ?
                  "bg-purple-50 border border-purple-200" :
                  "hover:bg-slate-50"}`
                  }>

                            <FigmaIcon s={14} />
                            <div className="text-left flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${
                    selectedFile === file.name ? "text-purple-700" : "text-slate-700"}`
                    }>
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-400">{file.updated}</p>
                            </div>
                            {selectedFile === file.name &&
                  <span className="text-purple-500">{Icon.check}</span>
                  }
                          </button>
                )}
                      </div>
              }
                  </div>
            )}
              </div>
          }
          </div>
        )}
      </div>

      {selectedFile &&
      <div className="px-3 py-2.5 border-t border-slate-100 bg-purple-50/50">
          <div className="flex items-center gap-2">
            <FigmaIcon s={16} />
            <span className="text-xs text-purple-700 font-medium flex-1 truncate">{selectedFile}</span>
            <span className="text-xs text-purple-600 bg-white border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { FigmaTeamsProjects };