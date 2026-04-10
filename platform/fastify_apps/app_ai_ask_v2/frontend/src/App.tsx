import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/shared/icons";
import { Avatar } from "@/shared/components";
import { PROMPT_REGISTRY, getPromptEntry } from "@/registry/registry";
import { RegionRenderer } from "@/registry/RegionRenderer";
import { AppShell } from "./layout/AppShell";

const BASE_PATH = "/apps/ai-ask-v2";

function getPromptIdFromPath(): string | null {
  const path = window.location.pathname;
  const prefix = BASE_PATH + "/";
  if (path.startsWith(prefix)) {
    const id = path.slice(prefix.length).replace(/\/+$/, "");
    if (id && getPromptEntry(id)) return id;
  }
  return null;
}

export default function AskAIChat() {
  const [input, setInput] = useState("");
  const [pIdx, setPIdx] = useState(0);
  const [activePromptId, setActivePromptId] = useState<string | null>(() => getPromptIdFromPath());
  const maxChars = 1000;

  const selectPrompt = useCallback((id: string, title: string, sub: string) => {
    setInput(`${title}: ${sub}`);
    setActivePromptId(id);
    window.history.pushState(null, "", `${BASE_PATH}/${id}`);
  }, []);

  useEffect(() => {
    const onPopState = () => setActivePromptId(getPromptIdFromPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const promptSelected = activePromptId !== null;
  const activeEntry = activePromptId ? getPromptEntry(activePromptId) : undefined;

  return (
    <AppShell>
      <div className="flex h-full bg-slate-100 overflow-hidden" style={{ fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Left sidebar */}
        <div data-panel="left" className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
          {promptSelected && activeEntry ? (
            <RegionRenderer slots={activeEntry.regions.left} />
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Main */}
        <div data-panel="main" className="flex-1 flex flex-col min-w-0">

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Suggested prompts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Suggested Prompts</p>
                <div className="flex gap-1">
                  {([[-1, "\u2190"], [1, "\u2192"]] as const).map(([dir, label]) => (
                    <button
                      key={dir}
                      onClick={() => setPIdx((p) => Math.max(0, Math.min(PROMPT_REGISTRY.length - 4, p + dir)))}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {PROMPT_REGISTRY.slice(pIdx, pIdx + 4).map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => selectPrompt(p.id, p.title, p.sub)}
                    className={`flex-1 text-left rounded-xl px-3 py-2.5 border transition-all hover:shadow-sm ${i === 0 ? "bg-indigo-50 border-indigo-200 hover:border-indigo-300" : "bg-white border-slate-200 hover:border-slate-300"}`}
                  >
                    <p className={`text-xs font-bold ${i === 0 ? "text-indigo-700" : "text-slate-700"}`}>{p.title}</p>
                    <p className={`text-xs mt-0.5 truncate ${i === 0 ? "text-indigo-400" : "text-slate-400"}`}>{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt-specific main content */}
            {promptSelected && activeEntry && (
              <RegionRenderer slots={activeEntry.regions.main} />
            )}
          </div>

          {/* Chat area — pinned to bottom */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-100 space-y-2">
            {/* User bubble */}
            {promptSelected && (
            <div className="flex items-start gap-3">
              <Avatar initials="U" color="#6366f1" />
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-lg shadow-sm">
                <p className="text-slate-700 text-sm leading-relaxed">
                  "{input}"
                </p>
              </div>
            </div>
            )}
            <div className="bg-white border border-indigo-300 rounded-2xl shadow-sm ring-1 ring-indigo-100">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, maxChars))}
                className="w-full px-4 pt-3.5 pb-2 text-sm text-slate-700 resize-none outline-none placeholder-slate-400 bg-transparent leading-relaxed"
                rows={2}
                placeholder="Ask anything..."
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-slate-100">
                <div className="flex gap-3">
                  {([["Add Attachment", Icon.attach], ["Use Image", Icon.image]] as const).map(([l, i]) => (
                    <button key={l} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors">
                      {i}{l}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{input.length}/{maxChars}</span>
                  <button className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-all">
                    {Icon.send}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div data-panel="right" className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
          {promptSelected && activeEntry ? (
            <RegionRenderer slots={activeEntry.regions.right} />
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </AppShell>
  );
}
