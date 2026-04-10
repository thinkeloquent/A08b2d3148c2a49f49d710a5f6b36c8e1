import { useState } from "react";
import { ConfluenceIcon } from "@/shared/brand-icons";
import { Icon } from "@/shared/icons";

interface ConfluencePage {
  title: string;
  updated: string;
  comments: number;
  children?: ConfluencePage[];
}

interface ConfluenceSpace {
  key: string;
  name: string;
  type: "team" | "personal";
  pages: ConfluencePage[];
}

const mockSpaces: ConfluenceSpace[] = [
{
  key: "ENG",
  name: "Engineering",
  type: "team",
  pages: [
  {
    title: "Architecture Overview",
    updated: "2h ago",
    comments: 5,
    children: [
    { title: "Backend Services", updated: "1d ago", comments: 3 },
    { title: "Frontend Stack", updated: "3d ago", comments: 1 },
    { title: "Data Pipeline", updated: "1w ago", comments: 0 }]

  },
  {
    title: "Runbooks",
    updated: "4h ago",
    comments: 2,
    children: [
    { title: "Incident Response", updated: "2d ago", comments: 8 },
    { title: "Deployment Checklist", updated: "5d ago", comments: 4 }]

  }]

},
{
  key: "PROD",
  name: "Product",
  type: "team",
  pages: [
  {
    title: "Q1 Roadmap",
    updated: "1d ago",
    comments: 12,
    children: [
    { title: "Feature Specs", updated: "2d ago", comments: 6 },
    { title: "User Research", updated: "1w ago", comments: 3 }]

  },
  { title: "Release Notes", updated: "3d ago", comments: 1 }]

},
{
  key: "~alex",
  name: "Alex's Space",
  type: "personal",
  pages: [
  { title: "Draft: RFC Auth v3", updated: "Yesterday", comments: 0 },
  { title: "Meeting Notes", updated: "2d ago", comments: 0 }]

}];


const ConfluenceSpaceExplorer = () => {
  const [expandedSpace, setExpandedSpace] = useState<string | null>("ENG");
  const [expandedPage, setExpandedPage] = useState<string | null>("Architecture Overview");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "team" | "personal">("all");

  const filtered = filter === "all" ? mockSpaces : mockSpaces.filter((s) => s.type === filter);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <ConfluenceIcon s={18} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spaces</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all mb-2">
          <span className="text-slate-400">{Icon.search}</span>
          <input
            className="flex-1 text-xs outline-none placeholder-slate-400 text-slate-700 bg-transparent"
            placeholder="Search spaces & pages..." />

        </div>
        <div className="flex gap-1">
          {(["all", "team", "personal"] as const).map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
            filter === f ?
            "bg-blue-600 text-white" :
            "bg-slate-50 text-slate-500 hover:bg-slate-100"}`
            }>

              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.map((space) =>
        <div key={space.key} className="mb-1">
            <button
            onClick={() => setExpandedSpace(expandedSpace === space.key ? null : space.key)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

              <span className={`text-slate-400 transition-transform ${expandedSpace === space.key ? "rotate-90" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-ebd9960e">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
              <span className="text-slate-500">
                {space.type === "personal" ? Icon.users : Icon.grid}
              </span>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{space.name}</p>
                <p className="text-xs text-slate-400">{space.key}</p>
              </div>
              <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {space.type}
              </span>
            </button>

            {expandedSpace === space.key &&
          <div className="ml-4">
                {space.pages.map((page) =>
            <div key={page.title} className="mb-0.5">
                    {page.children ?
              <>
                        <button
                  onClick={() => setExpandedPage(expandedPage === page.title ? null : page.title)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">

                          <span className={`text-slate-400 transition-transform ${expandedPage === page.title ? "rotate-90" : ""}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3" data-test-id="svg-0c9e9c94">
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                          </span>
                          <span className="text-slate-400">{Icon.doc}</span>
                          <span className="text-xs font-medium text-slate-600 flex-1 text-left truncate">{page.title}</span>
                          {page.comments > 0 &&
                  <span className="text-xs text-slate-400 flex items-center gap-0.5">
                              {Icon.chat}
                              {page.comments}
                            </span>
                  }
                        </button>
                        {expandedPage === page.title &&
                <div className="ml-5">
                            {page.children.map((child) =>
                  <button
                    key={child.title}
                    onClick={() => setSelectedItem(selectedItem === child.title ? null : child.title)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                    selectedItem === child.title ?
                    "bg-blue-50 border border-blue-200" :
                    "hover:bg-slate-50"}`
                    }>

                                <span className="text-slate-400">{Icon.file}</span>
                                <div className="text-left flex-1 min-w-0">
                                  <p className={`text-xs font-medium truncate ${
                      selectedItem === child.title ? "text-blue-700" : "text-slate-700"}`
                      }>
                                    {child.title}
                                  </p>
                                  <p className="text-xs text-slate-400">{child.updated}</p>
                                </div>
                                {child.comments > 0 &&
                    <span className="text-xs text-slate-400">{child.comments}</span>
                    }
                                {selectedItem === child.title &&
                    <span className="text-blue-500">{Icon.check}</span>
                    }
                              </button>
                  )}
                          </div>
                }
                      </> :

              <button
                onClick={() => setSelectedItem(selectedItem === page.title ? null : page.title)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-0.5 ${
                selectedItem === page.title ?
                "bg-blue-50 border border-blue-200" :
                "hover:bg-slate-50"}`
                }>

                        <span className="text-slate-400">{Icon.file}</span>
                        <div className="text-left flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${
                  selectedItem === page.title ? "text-blue-700" : "text-slate-700"}`
                  }>
                            {page.title}
                          </p>
                          <p className="text-xs text-slate-400">{page.updated}</p>
                        </div>
                        {page.comments > 0 &&
                <span className="text-xs text-slate-400">{page.comments}</span>
                }
                        {selectedItem === page.title &&
                <span className="text-blue-500">{Icon.check}</span>
                }
                      </button>
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
            <ConfluenceIcon s={16} />
            <span className="text-xs text-blue-700 font-medium flex-1 truncate">{selectedItem}</span>
            <span className="text-xs text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
              Selected
            </span>
          </div>
        </div>
      }
    </div>);

};

export { ConfluenceSpaceExplorer };