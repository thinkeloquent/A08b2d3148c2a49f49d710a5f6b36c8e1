/**
 * Component Editor - 7-tab editor for component metadata
 * Manages editor state, tab navigation, save/update
 */

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  AlignLeft,
  Clock,
  Zap,
  Link,
  LayoutGrid,
  Eye } from
"lucide-react";
import { useCreateComponent, useUpdateComponent } from "../../hooks";
import type { ApiComponent } from "../../types/api";
import { isApiError } from "../../types/errors";
import type { EditorState, TabId } from "./types";
import { TABS, TAB_IDS, ATOM_COLORS, EMPTY_STATE, serializeToApi, deserializeFromApi } from "./types";
import { Badge } from "./shared";
import { SemanticTab } from "./SemanticTab";
import { SchemaTab } from "./SchemaTab";
import { LifecycleTab } from "./LifecycleTab";
import { InteractionTab } from "./InteractionTab";
import { DependenciesTab } from "./DependenciesTab";
import { SpatialTab } from "./SpatialTab";
import { PreviewTab } from "./PreviewTab";

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  semantic: <Sparkles className="w-3.5 h-3.5" />,
  schema: <AlignLeft className="w-3.5 h-3.5" />,
  lifecycle: <Clock className="w-3.5 h-3.5" />,
  interactivity: <Zap className="w-3.5 h-3.5" />,
  dependencies: <Link className="w-3.5 h-3.5" />,
  spatial: <LayoutGrid className="w-3.5 h-3.5" />,
  preview: <Eye className="w-3.5 h-3.5" />
};

interface Props {
  /** Existing component to edit, or undefined for new */
  component?: ApiComponent;
  onBack: () => void;
  /** Currently active tab (URL-driven) */
  activeTab?: TabId;
  /** Called when user clicks a tab — parent should update URL */
  onTabChange?: (tab: TabId) => void;
}

export function ComponentEditor({ component, onBack, activeTab: activeTabProp, onTabChange }: Props) {
  const isNew = !component;
  const [state, setState] = useState<EditorState>(
    component ? deserializeFromApi(component) : EMPTY_STATE
  );
  const [internalTab, setInternalTab] = useState<TabId>("semantic");
  const activeTab = activeTabProp && TAB_IDS.includes(activeTabProp) ? activeTabProp : internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const createMutation = useCreateComponent({ onSuccess: () => {setDirty(false);onBack();} });
  const updateMutation = useUpdateComponent({ onSuccess: () => {setDirty(false);onBack();} });
  const saving = createMutation.isPending || updateMutation.isPending;

  const update = useCallback((key: string, val: unknown) => {
    setState((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
    setSaveError(null);
  }, []);

  const handleSave = () => {
    if (!state.name.trim()) return;
    const payload = serializeToApi(state);
    if (isNew) {
      createMutation.mutate(payload, {
        onError: (err) => setSaveError(isApiError(err) ? err.getUserMessage() : "Failed to save")
      });
    } else {
      updateMutation.mutate(
        { id: component!.id, data: payload },
        { onError: (err) => setSaveError(isApiError(err) ? err.getUserMessage() : "Failed to save") }
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-700 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-4" data-test-id="div-d1435398">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-slate-700 transition-colors">

            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-400">Component:</span>
            <span className="text-[13px] text-indigo-600 font-semibold">
              {state.name || "Untitled"}
            </span>
            <Badge label={state.atomLevel} color={ATOM_COLORS[state.atomLevel]} />
          </div>

          {dirty &&
          <span className="text-[11px] text-amber-500 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              unsaved
            </span>
          }

          <div className="ml-auto flex items-center gap-2">
            {saveError &&
            <span className="text-[11px] text-red-500">{saveError}</span>
            }
            <button
              onClick={handleSave}
              disabled={!state.name.trim() || saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[12.5px] font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <nav className="w-[160px] min-w-[160px] bg-white border-r border-slate-200 py-4 px-2 flex flex-col shrink-0">
          <div className="space-y-1" data-test-id="div-12a20f36">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                  active ?
                  "bg-indigo-50 border border-indigo-200 text-indigo-600" :
                  "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`
                  }>

                  <span className={active ? "text-indigo-500" : "text-slate-400"}>
                    {TAB_ICONS[tab.id]}
                  </span>
                  <div>
                    <div className="text-[12px] font-medium">{tab.label}</div>
                    <div className="text-[10px] text-slate-400">{tab.short}</div>
                  </div>
                </button>);

            })}
          </div>

          {/* Stats */}
          <div className="mt-auto pt-4 border-t border-slate-200 px-2 space-y-1.5" data-test-id="div-ed0d69ba">
            {[
            { label: "Props", value: state.fields.length },
            { label: "Triggers", value: state.triggers.length },
            { label: "Services", value: state.deps.length }].
            map((s) =>
            <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{s.label}</span>
                <span className="text-[11px] text-slate-700 font-semibold">{s.value}</span>
              </div>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto" data-test-id="div-c00c2713">
            {activeTab === "semantic" && <SemanticTab state={state} update={update} />}
            {activeTab === "schema" && <SchemaTab state={state} update={update} />}
            {activeTab === "lifecycle" && <LifecycleTab state={state} update={update} />}
            {activeTab === "interactivity" && <InteractionTab state={state} update={update} />}
            {activeTab === "dependencies" && <DependenciesTab state={state} update={update} />}
            {activeTab === "spatial" && <SpatialTab state={state} update={update} />}
            {activeTab === "preview" && <PreviewTab state={state} />}
          </div>
        </main>
      </div>
    </div>);

}