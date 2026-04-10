import { useState, useMemo } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import {
  Search,
  Tag,
  Box,
  AlertCircle,
  RefreshCw,
  XCircle,
  Filter,
  X,
  ChevronRight,
  Plus,
  Hash,
  Trash2 } from
"lucide-react";
import { useComponents, useComponent, useDeleteComponent, useTags } from "./hooks";
import { isApiError } from "./types/errors";
import type { ApiComponent, ApiTag, TaxonomyLevel, ComponentStatus } from "./types/api";
import { ComponentEditor } from "./components/editor";
import type { TabId } from "./components/editor/types";
import { TAB_IDS } from "./components/editor/types";

/* ── Constants ─────────────────────────────────────────────── */

const TAXONOMY_COLORS: Record<TaxonomyLevel, {bg: string;text: string;border: string;dot: string;}> = {
  Atom: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", dot: "bg-sky-500" },
  Molecule: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", dot: "bg-violet-500" },
  Organism: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
  Template: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" },
  Page: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", dot: "bg-rose-500" }
};

const STATUS_STYLES: Record<ComponentStatus, string> = {
  draft: "bg-slate-50  text-slate-500  border-slate-200",
  published: "bg-green-50  text-green-600  border-green-200",
  archived: "bg-red-50    text-red-400    border-red-200"
};

/* ── Helpers ────────────────────────────────────────────────── */

function taxonomyColor(level: TaxonomyLevel | undefined) {
  if (!level) return { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" };
  return TAXONOMY_COLORS[level] ?? { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" };
}

/* ── Views ──────────────────────────────────────────────────── */

type ActiveView = "components" | "tags";

/* ── Component Detail Panel ─────────────────────────────────── */

function ComponentDetailPanel({
  component,
  onClose,
  onEdit,
  onDelete,
  isDeleting






}: {component: ApiComponent;onClose: () => void;onEdit: () => void;onDelete: () => void;isDeleting: boolean;}) {
  const tc = taxonomyColor(component.taxonomyLevel);

  return (
    <div className="w-[320px] min-w-[320px] h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-start shrink-0">
        <div>
          <div className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider mb-1">
            Component Detail
          </div>
          <div className="text-[13px] text-slate-800 font-semibold break-all">{component.name}</div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {component.taxonomyLevel &&
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${tc.bg} ${tc.text} ${tc.border}`}>

                <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                {component.taxonomyLevel}
              </span>
            }
            {component.status &&
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[component.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>

                {component.status}
              </span>
            }
          </div>
        </div>
        <div className="flex items-center gap-1 -mt-0.5">
          <button
            onClick={onEdit}
            className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors">

            Edit
          </button>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 text-lg leading-none px-1 transition-colors">

            &times;
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 overflow-y-auto flex-1 space-y-4">
        {component.description &&
        <p className="text-[12.5px] text-slate-600 leading-relaxed">{component.description}</p>
        }

        {/* Details */}
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Details</div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-slate-400">ID</span>
              <span className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">{component.id}</span>
            </div>
            {component.createdBy &&
            <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-400">Created by</span>
                <span className="text-[12px] text-indigo-500 font-medium">{component.createdBy}</span>
              </div>
            }
            {component.createdAt &&
            <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-400">Created</span>
                <span className="text-[12px] text-slate-700">
                  {new Date(component.createdAt).toLocaleDateString()}
                </span>
              </div>
            }
            {component.updatedAt &&
            <div className="flex justify-between items-center">
                <span className="text-[12px] text-slate-400">Updated</span>
                <span className="text-[12px] text-slate-700">
                  {new Date(component.updatedAt).toLocaleDateString()}
                </span>
              </div>
            }
          </div>
        </div>

        {/* Aliases */}
        {component.aliases && component.aliases.length > 0 &&
        <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Aliases</div>
            <div className="flex flex-wrap gap-1.5">
              {component.aliases.map((alias) =>
            <span
              key={alias}
              className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-[11px] font-mono">

                  {alias}
                </span>
            )}
            </div>
          </div>
        }

        {/* Tags */}
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {(!component.tags || component.tags.length === 0) &&
            <span className="text-[12px] text-slate-300">No tags</span>
            }
            {component.tags?.map((tag) =>
            <span
              key={tag.id}
              className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 text-[11px] font-medium">

                {tag.name}
              </span>
            )}
          </div>
        </div>

        {/* Directives */}
        {component.directives &&
        <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
              Directives
            </div>
            <pre className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-words">
              {component.directives}
            </pre>
          </div>
        }
      </div>

      {/* Delete footer */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full text-[12px] text-red-500 hover:text-red-700 font-medium py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">

          {isDeleting ? "Deleting..." : "Delete Component"}
        </button>
      </div>
    </div>);

}

/* ── Components View ────────────────────────────────────────── */

function ComponentsView({ onEditComponent, onDeleteComponent, isDeletingId



}: {onEditComponent: (c: ApiComponent) => void;onDeleteComponent: (id: string) => void;isDeletingId: string | null;}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<TaxonomyLevel | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<ComponentStatus | "all">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ApiComponent | null>(null);

  const { data: componentsResponse, isLoading, isError, error, refetch } = useComponents({
    include_tags: true
  });

  const { data: tagsResponse } = useTags();

  const components: ApiComponent[] = componentsResponse?.components ?? [];
  const allTags: ApiTag[] = tagsResponse?.tags ?? [];

  const taxonomyLevels: Array<{id: TaxonomyLevel | "all";label: string;count: number;}> = useMemo(
    () => [
    { id: "all", label: "All", count: components.length },
    { id: "Atom", label: "Atom", count: components.filter((c) => c.taxonomyLevel === "Atom").length },
    { id: "Molecule", label: "Molecule", count: components.filter((c) => c.taxonomyLevel === "Molecule").length },
    { id: "Organism", label: "Organism", count: components.filter((c) => c.taxonomyLevel === "Organism").length },
    { id: "Template", label: "Template", count: components.filter((c) => c.taxonomyLevel === "Template").length },
    { id: "Page", label: "Page", count: components.filter((c) => c.taxonomyLevel === "Page").length }],

    [components]
  );

  const filtered = useMemo(() => {
    return components.filter((c) => {
      const matchesTaxonomy = selectedTaxonomy === "all" || c.taxonomyLevel === selectedTaxonomy;
      const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
      const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((t) => c.tags?.some((ct) => ct.name === t));
      return matchesTaxonomy && matchesStatus && matchesSearch && matchesTags;
    });
  }, [components, selectedTaxonomy, selectedStatus, searchQuery, selectedTags]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading components...</span>
        </div>
      </div>);

  }

  if (isError) {
    const msg = isApiError(error) ? error.getUserMessage() : "An error occurred.";
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 bg-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-200">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-slate-800 mb-1.5">Failed to Load Components</h2>
          <p className="text-[13px] text-slate-500 mb-5">{msg}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors">

            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      </div>);

  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-[360px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-300 transition-all" />

            {searchQuery &&
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">

                <XCircle className="w-3.5 h-3.5" />
              </button>
            }
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ComponentStatus | "all")}
            className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">

            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
              <span className="text-slate-700 font-semibold">{components.length}</span> components
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg border transition-colors ${
              showFilters ?
              "bg-indigo-50 border-indigo-200 text-indigo-500" :
              "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`
              }>

              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Taxonomy Tabs */}
        <div className="bg-white border-b border-slate-200 px-5 py-2 flex items-center gap-2 flex-wrap shrink-0">
          {taxonomyLevels.map((level) => {
            const isSelected = selectedTaxonomy === level.id;
            const tc = level.id !== "all" ? taxonomyColor(level.id as TaxonomyLevel) : null;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedTaxonomy(level.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                isSelected ?
                tc ?
                `${tc.bg} border ${tc.border} ${tc.text}` :
                "bg-indigo-50 border border-indigo-200 text-indigo-600" :
                "bg-white border border-slate-200 text-slate-400 hover:text-slate-600"}`
                }>

                {tc && isSelected && <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />}
                <span>{level.label}</span>
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                  isSelected ? "bg-white/60 text-current" : "bg-slate-100 text-slate-500"}`
                  }>

                  {level.count}
                </span>
              </button>);

          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Advanced Filters */}
          {showFilters &&
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm animate-slide-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Filter by Tags
                </span>
                <button onClick={() => setShowFilters(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) =>
              <button
                key={tag.id}
                onClick={() =>
                setSelectedTags((prev) =>
                prev.includes(tag.name) ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]
                )
                }
                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                selectedTags.includes(tag.name) ?
                "bg-indigo-50 text-indigo-600 border-indigo-200" :
                "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`
                }>

                    {tag.name}
                  </button>
              )}
                {allTags.length === 0 &&
              <span className="text-[12px] text-slate-300">No tags available</span>
              }
              </div>
            </div>
          }

          {/* Results summary */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-slate-400">
              <span className="text-slate-700 font-semibold">{filtered.length}</span> components
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
            {selectedTags.length > 0 &&
            <button
              onClick={() => setSelectedTags([])}
              className="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium">

                Clear tag filters
              </button>
            }
          </div>

          {/* Table */}
          {filtered.length > 0 ?
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_100px_100px_60px] gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>Component</span>
                <span>Taxonomy</span>
                <span>Status</span>
                <span className="text-right">Tags</span>
                <span className="text-center">Actions</span>
              </div>

              {filtered.map((component) => {
              const isSelected = selectedComponent?.id === component.id;
              const tc = taxonomyColor(component.taxonomyLevel);
              return (
                <div
                  key={component.id}
                  onClick={() => setSelectedComponent(isSelected ? null : component)}
                  className={`relative grid grid-cols-[1fr_120px_100px_100px_60px] gap-2 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                  isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"}`
                  }>

                    {isSelected &&
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r" />
                  }

                    {/* Name + description */}
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-slate-800 truncate">{component.name}</div>
                      {component.description &&
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{component.description}</div>
                    }
                    </div>

                    {/* Taxonomy */}
                    <div className="flex items-center">
                      {component.taxonomyLevel ?
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${tc.bg} ${tc.text} ${tc.border}`}>

                          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                          {component.taxonomyLevel}
                        </span> :

                    <span className="text-[11px] text-slate-300">&mdash;</span>
                    }
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      {component.status ?
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[component.status]}`}>

                          {component.status}
                        </span> :

                    <span className="text-[11px] text-slate-300">&mdash;</span>
                    }
                    </div>

                    {/* Tags count */}
                    <div className="flex items-center justify-end">
                      {component.tags && component.tags.length > 0 ?
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Tag className="w-3 h-3" />
                          {component.tags.length}
                        </span> :

                    <span className="text-[11px] text-slate-300">&mdash;</span>
                    }
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center">
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteComponent(component.id);
                      }}
                      disabled={isDeletingId === component.id}
                      className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete component">

                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>);

            })}
            </div> :

          <div className="text-center py-20">
              <div className="w-14 h-14 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-200">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">No components found</h3>
              <p className="text-[13px] text-slate-400 max-w-sm mx-auto mb-5">
                Try adjusting your search query or filters
              </p>
              <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTaxonomy("all");
                setSelectedStatus("all");
                setSelectedTags([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors">

                Reset All Filters
              </button>
            </div>
          }
        </div>
      </div>

      {/* Detail Panel */}
      {selectedComponent &&
      <ComponentDetailPanel
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onEdit={() => onEditComponent(selectedComponent)}
        onDelete={() => {
          onDeleteComponent(selectedComponent.id);
          setSelectedComponent(null);
        }}
        isDeleting={isDeletingId === selectedComponent.id} />

      }
    </div>);

}

/* ── Tags View ──────────────────────────────────────────────── */

function TagsView() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tagsResponse, isLoading, isError, error, refetch } = useTags();
  const { data: componentsResponse } = useComponents({ include_tags: true });

  const tags: ApiTag[] = tagsResponse?.tags ?? [];
  const components: ApiComponent[] = componentsResponse?.components ?? [];

  // Build a map of tag name -> component count
  const tagComponentCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of components) {
      for (const t of c.tags ?? []) {
        map[t.name] = (map[t.name] ?? 0) + 1;
      }
    }
    return map;
  }, [components]);

  const filtered = useMemo(() => {
    if (!searchQuery) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tags, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading tags...</span>
        </div>
      </div>);

  }

  if (isError) {
    const msg = isApiError(error) ? error.getUserMessage() : "An error occurred.";
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-14 h-14 bg-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-200">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-slate-800 mb-1.5">Failed to Load Tags</h2>
          <p className="text-[13px] text-slate-500 mb-5">{msg}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors">

            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      </div>);

  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-[360px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-300 transition-all" />

          {searchQuery &&
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">

              <XCircle className="w-3.5 h-3.5" />
            </button>
          }
        </div>
        <span className="ml-auto text-[12px] text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
          <span className="text-slate-700 font-semibold">{tags.length}</span> tags
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-[12px] text-slate-400 mb-3">
          <span className="text-slate-700 font-semibold">{filtered.length}</span> tags
          {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
        </p>

        {filtered.length > 0 ?
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_1fr] gap-4 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Tag Name</span>
              <span className="text-center">Components</span>
              <span>ID</span>
            </div>
            {filtered.map((tag) =>
          <div
            key={tag.id}
            className="grid grid-cols-[1fr_80px_1fr] gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">

                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-[13px] font-semibold text-slate-800">{tag.name}</span>
                  {tag.color &&
              <span
                className="w-3 h-3 rounded-full border border-white shadow-sm shrink-0"
                style={{ backgroundColor: tag.color }}
                title={tag.color} />

              }
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[12px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                    {tagComponentCount[tag.name] ?? 0}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-slate-400 font-mono truncate">{tag.id}</span>
                </div>
              </div>
          )}
          </div> :

        <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-200">
              <Tag className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">No tags found</h3>
            <p className="text-[13px] text-slate-400">
              {searchQuery ? "Try a different search term" : "No tags have been created yet"}
            </p>
          </div>
        }
      </div>
    </div>);

}

/* ── Edit Page (route: /:id) ───────────────────────────────────── */

function EditPage() {
  const { id, tab } = useParams<{ id: string; tab: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useComponent(id!);

  const activeTab: TabId = tab && TAB_IDS.includes(tab as TabId) ? (tab as TabId) : "semantic";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading component...</span>
        </div>
      </div>
    );
  }

  const component = data?.component;

  if (isError || !component) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-200">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-slate-800 mb-1.5">Component not found</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors">
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <ComponentEditor
      component={component}
      onBack={() => navigate("/")}
      activeTab={activeTab}
      onTabChange={(t) => navigate(`/${id}/${t}`, { replace: true })} />
  );
}

/* ── Create Page (route: /new) ─────────────────────────────────── */

function CreatePage() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab: TabId = tab && TAB_IDS.includes(tab as TabId) ? (tab as TabId) : "semantic";

  return (
    <ComponentEditor
      onBack={() => navigate("/")}
      activeTab={activeTab}
      onTabChange={(t) => navigate(`/new/${t}`, { replace: true })} />
  );
}

/* ── List Page (route: /) ──────────────────────────────────────── */

function ListPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("components");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useDeleteComponent({
    onSuccess: () => setDeletingId(null)
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const navItems: Array<{id: ActiveView;label: string;icon: React.ReactNode;}> = [
  { id: "components", label: "Components", icon: <Box className="w-4 h-4" /> },
  { id: "tags", label: "Tags", icon: <Tag className="w-4 h-4" /> }];

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-700 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-5 py-2.5 shrink-0">
        <div className="flex items-center gap-4" data-test-id="div-df286cee">
          {/* Nav */}
          <nav className="flex items-center gap-1 ml-6">
            {navItems.map((item) =>
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              activeView === item.id ?
              "bg-indigo-50 text-indigo-600 border border-indigo-200" :
              "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`
              }>

                {item.icon}
                {item.label}
              </button>
            )}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate("/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[12.5px] font-medium hover:bg-indigo-700 transition-colors">

              <Plus className="w-3.5 h-3.5" />
              New Component
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {activeView === "components" &&
        <ComponentsView
          onEditComponent={(c) => navigate(`/${c.id}`)}
          onDeleteComponent={handleDelete}
          isDeletingId={deleteMutation.isPending ? deletingId : null} />

        }
        {activeView === "tags" && <TagsView />}
      </div>
    </div>);
}

/* ── Main App (Router) ─────────────────────────────────────────── */

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/new" element={<CreatePage />} />
        <Route path="/new/:tab" element={<CreatePage />} />
        <Route path="/:id" element={<EditPage />} />
        <Route path="/:id/:tab" element={<EditPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;