import { useState, useMemo, useCallback } from "react";
import { AppShell } from "./layout/AppShell";
import {
  Search,
  Layout,
  Package,
  Cpu,
  Image,
  Shapes,
  Shield,
  TrendingUp,
  Copy,
  Check,
  Filter,
  ChevronRight,
  Layers,
  Book,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import {
  useFigmaFiles,
  useTags,
  apiToUiFigmaFile,
  type FigmaFile,
} from "./hooks";
import { isApiError } from "./types/errors";

/* ── Helpers ──────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  design_system:     { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  component_library: { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-500" },
  prototype:         { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200",  dot: "bg-violet-500" },
  illustration:      { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   dot: "bg-amber-500" },
  icon_set:          { bg: "bg-teal-50",    text: "text-teal-600",    border: "border-teal-200",    dot: "bg-teal-500" },
};

const STATUS_STYLES: Record<string, string> = {
  stable:       "bg-green-50 text-green-600 border-green-200",
  beta:         "bg-amber-50 text-amber-600 border-amber-200",
  experimental: "bg-purple-50 text-purple-600 border-purple-200",
  deprecated:   "bg-slate-50 text-slate-400 border-slate-200",
};

const TYPE_LABELS: Record<string, string> = {
  design_system:     "Design System",
  component_library: "Component Lib",
  prototype:         "Prototype",
  illustration:      "Illustration",
  icon_set:          "Icon Set",
};

const formatCount = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/* ── File Type Definitions ────────────────────────────────── */

interface FileType {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

/* ── Detail Panel ─────────────────────────────────────────── */

function DetailPanel({ file, onClose }: { file: FigmaFile; onClose: () => void }) {
  const [expandedDocs, setExpandedDocs] = useState(false);
  const typeColor = TYPE_COLORS[file.type] ?? {
    bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400",
  };

  return (
    <div className="w-[320px] min-w-[320px] h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-start shrink-0">
        <div>
          <div className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider mb-1">Figma File Detail</div>
          <div className="text-[13px] text-slate-800 font-semibold break-all">{file.name}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
              {TYPE_LABELS[file.type] ?? file.type}
            </span>
            {file.verified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 border border-indigo-200">
                <Shield className="w-3 h-3" /> Verified
              </span>
            )}
            {file.trending && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                <TrendingUp className="w-3 h-3" /> Trending
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-slate-500 text-lg leading-none px-1 -mt-0.5 transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-4 overflow-y-auto flex-1">
        {/* Thumbnail */}
        {file.thumbnailUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 h-32 flex items-center justify-center">
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Description */}
        <p className="text-[12.5px] text-slate-600 leading-relaxed mb-4">{file.description}</p>

        {/* Metrics */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Metrics</div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100 text-center">
            <div className="text-[12px] font-semibold text-indigo-600">{formatCount(file.componentCount)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Components</div>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100 text-center">
            <div className="text-[12px] font-semibold text-violet-600">{formatCount(file.styleCount)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Styles</div>
          </div>
          <div className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100 text-center">
            <div className="text-[12px] font-semibold text-teal-600">{file.pageCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pages</div>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-3" />

        {/* Meta */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Details</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-slate-400">Status</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[file.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
              {file.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-slate-400">File Key</span>
            <span className="text-[12px] text-slate-700 font-mono truncate max-w-[160px]">{file.figmaFileKey || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-slate-400">Editor Type</span>
            <span className="text-[12px] text-slate-700">{file.editorType || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-slate-400">Last Modified By</span>
            <span className="text-[12px] text-indigo-500 font-medium">{file.lastModifiedBy || "—"}</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-3" />

        {/* Tags */}
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5">Tags</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {file.tags.length === 0 && <span className="text-[12px] text-slate-300">No tags</span>}
          {file.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-[11px] font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Documentation */}
        {file.documentation.length > 0 && (
          <>
            <div className="h-px bg-slate-100 my-3" />
            <button
              onClick={() => setExpandedDocs(!expandedDocs)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <div className="flex items-center gap-1.5">
                <Book className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Documentation</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500 border border-indigo-200">
                  {file.documentation.length}
                </span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedDocs ? "rotate-90" : ""}`} />
            </button>
            {expandedDocs && (
              <div className="space-y-1">
                {file.documentation.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-[12px] text-slate-600 transition-colors cursor-pointer border border-slate-100">
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        {file.figmaUrl && (
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={file.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in Figma
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────── */

function App() {
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("components");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeBooleanFilters, setActiveBooleanFilters] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<FigmaFile | null>(null);

  const { data: filesResponse, isLoading, isError, error, refetch } = useFigmaFiles({
    include_tags: true,
    include_metadata: true,
  });

  const { data: tagsResponse } = useTags();

  const figmaFiles: FigmaFile[] = useMemo(() => {
    if (!filesResponse?.figmaFiles) return [];
    return filesResponse.figmaFiles.map(apiToUiFigmaFile);
  }, [filesResponse]);

  const allTags = useMemo(() => {
    if (tagsResponse?.tags) return tagsResponse.tags.map((t) => t.name).sort();
    const tags = new Set<string>();
    figmaFiles.forEach((file) => file.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [figmaFiles, tagsResponse]);

  const booleanFilterKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const file of figmaFiles) {
      for (const [key, value] of Object.entries(file)) {
        if (typeof value === "boolean" && value) keys.add(key);
      }
    }
    return Array.from(keys).sort();
  }, [figmaFiles]);

  const fileTypes: FileType[] = useMemo(
    () => [
      { id: "all",              label: "All",              icon: <Layers className="w-3.5 h-3.5" />,  count: figmaFiles.length },
      { id: "design_system",     label: "Design Systems",   icon: <Layout className="w-3.5 h-3.5" />,  count: figmaFiles.filter((f) => f.type === "design_system").length },
      { id: "component_library", label: "Component Libs",   icon: <Package className="w-3.5 h-3.5" />, count: figmaFiles.filter((f) => f.type === "component_library").length },
      { id: "prototype",         label: "Prototypes",       icon: <Cpu className="w-3.5 h-3.5" />,     count: figmaFiles.filter((f) => f.type === "prototype").length },
      { id: "illustration",      label: "Illustrations",    icon: <Image className="w-3.5 h-3.5" />,   count: figmaFiles.filter((f) => f.type === "illustration").length },
      { id: "icon_set",          label: "Icon Sets",        icon: <Shapes className="w-3.5 h-3.5" />,  count: figmaFiles.filter((f) => f.type === "icon_set").length },
    ],
    [figmaFiles]
  );

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = figmaFiles.filter((file) => {
      const matchesType = selectedType === "all" || file.type === selectedType;
      const matchesSearch =
        !searchQuery ||
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => file.tags.includes(tag));
      const matchesBooleans = Object.entries(activeBooleanFilters).every(
        ([key, active]) => !active || (file as unknown as Record<string, unknown>)[key] === true
      );
      return matchesType && matchesSearch && matchesTags && matchesBooleans;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "components": return b.componentCount - a.componentCount;
        case "styles":     return b.styleCount - a.styleCount;
        case "pages":      return b.pageCount - a.pageCount;
        default:           return 0;
      }
    });
    return filtered;
  }, [figmaFiles, selectedType, searchQuery, selectedTags, activeBooleanFilters, sortBy]);

  const handleCopyName = useCallback((e: React.MouseEvent, file: FigmaFile) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.name);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading Figma files...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = isApiError(error)
      ? error.getUserMessage()
      : "An error occurred while loading Figma files.";
    return (
      <AppShell>
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-14 h-14 bg-red-50 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-200">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-[15px] font-semibold text-slate-800 mb-1.5">Failed to Load Figma Files</h2>
            <p className="text-[13px] text-slate-500 mb-5">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f8f9fb] text-slate-700 flex flex-col">
        {/* ── TopBar ──────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-200 px-5 py-2.5 shrink-0">
          <div className="flex items-center gap-4" data-test-id="div-figma-files-topbar">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <span className="text-[14px] font-bold text-slate-800">Figma Files</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-[420px] relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Search files, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-300 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right badges */}
            <div className="ml-auto flex items-center gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[12px] font-medium text-slate-500 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 font-semibold">{figmaFiles.length}</span> files
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  showFilters
                    ? "bg-indigo-50 border-indigo-200 text-indigo-500"
                    : "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Type Filter Bar ──────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 px-5 py-2 flex items-center gap-2 shrink-0">
          {fileTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                selectedType === type.id
                  ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                  : "bg-white border border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
            >
              {type.icon}
              <span>{type.label}</span>
              <span className={`ml-0.5 px-1.5 py-0.5 rounded text-[10px] ${
                selectedType === type.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
              }`}>
                {type.count}
              </span>
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="components">Components</option>
              <option value="styles">Styles</option>
              <option value="pages">Pages</option>
            </select>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm animate-slide-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Advanced Filters</span>
                  <button onClick={() => setShowFilters(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Boolean filters */}
                {booleanFilterKeys.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {booleanFilterKeys.map((key) => (
                      <label key={key} className="flex items-center gap-1.5 cursor-pointer text-[12px] text-slate-600">
                        <input
                          type="checkbox"
                          checked={activeBooleanFilters[key] ?? false}
                          onChange={(e) =>
                            setActiveBooleanFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="capitalize">{key} only</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Tag filters */}
                {allTags.length > 0 && (
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1.5">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setSelectedTags((prev) =>
                              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                            )
                          }
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                            selectedTags.includes(tag)
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results summary */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-slate-400">
                <span className="text-slate-700 font-semibold">{filteredAndSortedFiles.length}</span> Figma files
                {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
              </p>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Figma Files Table */}
            {filteredAndSortedFiles.length > 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_90px_90px_70px_100px_120px] gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>File</span>
                  <span className="text-center">Components</span>
                  <span className="text-center">Styles</span>
                  <span className="text-center">Pages</span>
                  <span className="text-center">Status</span>
                  <span className="text-right">Type</span>
                </div>

                {/* Table Rows */}
                {filteredAndSortedFiles.map((file) => {
                  const isSelected = selectedFile?.id === file.id;
                  const typeColor = TYPE_COLORS[file.type] ?? {
                    bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400",
                  };

                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFile(isSelected ? null : file)}
                      className={`relative grid grid-cols-[1fr_90px_90px_70px_100px_120px] gap-2 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      {/* Left accent */}
                      {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r" />
                      )}

                      {/* Name + desc */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-800 truncate">{file.name}</span>
                            {file.verified && <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                            {file.trending && <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            <button
                              onClick={(e) => handleCopyName(e, file)}
                              className="p-0.5 text-slate-300 hover:text-slate-500 transition-colors shrink-0"
                              title="Copy name"
                            >
                              {copiedId === file.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{file.description}</div>
                        </div>
                      </div>

                      {/* Components */}
                      <div className="flex items-center justify-center">
                        <span className="text-[12px] font-medium text-indigo-600">{formatCount(file.componentCount)}</span>
                      </div>

                      {/* Styles */}
                      <div className="flex items-center justify-center">
                        <span className="text-[12px] font-medium text-violet-600">{formatCount(file.styleCount)}</span>
                      </div>

                      {/* Pages */}
                      <div className="flex items-center justify-center">
                        <span className="text-[12px] font-medium text-teal-600">{file.pageCount}</span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-center">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_STYLES[file.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                          {file.status}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="flex items-center justify-end">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                          {TYPE_LABELS[file.type] ?? file.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20">
                <div className="w-14 h-14 bg-slate-100 rounded-xl mx-auto mb-4 flex items-center justify-center border border-slate-200">
                  <Search className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-800 mb-1.5">No Figma files found</h3>
                <p className="text-[13px] text-slate-400 max-w-sm mx-auto mb-5">
                  Try adjusting your search query or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedTags([]);
                    setActiveBooleanFilters({});
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-[12.5px] font-medium hover:bg-indigo-100/70 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Detail Panel ─────────────────────────────── */}
          {selectedFile && (
            <DetailPanel file={selectedFile} onClose={() => setSelectedFile(null)} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default App;
