import { useCallback, useState, useMemo } from "react";
import Select, { components } from "react-select";
import { icons } from "lucide-react";
import { PanelLeftSidebarMenu002 } from "@internal/panel-left-sidebar-menu-002";
import { AppShell } from "./layout/AppShell";

const CATEGORIES = ["Chat Models", "Other", "Home", "Memory", "Agents", "Tools"];
const CAT_STYLE = {
  "Chat Models": { bg: "#eef2ff", text: "#4338ca", border: "#c7d2fe" },
  Other: { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
  Home: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  Memory: { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
  Agents: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  Tools: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
};
const TYPES = ["String", "Number", "Boolean", "JSON", "Array"];

const INITIAL_NODES = [
  {
    id: 1,
    emoji: "⚙️",
    name: "ChatOpenAI",
    category: "Chat Models",
    status: "active",
    description: "OpenAI chat completion model",
    config: [
      { key: "model", type: "String", value: "gpt-4o" },
      { key: "temperature", type: "Number", value: "0.7" },
      { key: "maxTokens", type: "Number", value: "2048" },
    ],
  },
  {
    id: 2,
    emoji: "🔍",
    name: "TavilySearch",
    category: "Chat Models",
    status: "active",
    description: "Web search tool via Tavily API",
    config: [
      { key: "maxResults", type: "Number", value: "5" },
      { key: "searchDepth", type: "String", value: "advanced" },
    ],
  },
  {
    id: 3,
    emoji: "😎",
    name: "AgentExecutor",
    category: "Chat Models",
    status: "active",
    description: "Runs an agent loop with tools",
    config: [{ key: "verbose", type: "Boolean", value: "true" }],
  },
  {
    id: 4,
    emoji: "👾",
    name: "PromptTemplate",
    category: "Chat Models",
    status: "active",
    description: "Template-based prompt builder",
    config: [{ key: "templateFormat", type: "String", value: "f-string" }],
  },
  {
    id: 5,
    emoji: "💬",
    name: "ConversationBlunck",
    category: "Other",
    status: "inactive",
    description: "Buffer memory for conversations",
    config: [{ key: "bufferSize", type: "Number", value: "10" }],
  },
  { id: 6, emoji: "😊", name: "model", category: "Other", status: "inactive", description: "Base model wrapper", config: [] },
  {
    id: 7,
    emoji: "😊",
    name: "Temperature",
    category: "Chat Models",
    status: "active",
    description: "Temperature control node",
    config: [
      { key: "min", type: "Number", value: "0" },
      { key: "max", type: "Number", value: "2" },
    ],
  },
  {
    id: 8,
    emoji: "🔍",
    name: "TavilySearch",
    category: "Chat Models",
    status: "active",
    description: "Search integration",
    config: [{ key: "apiKey", type: "String", value: "" }],
  },
  { id: 9, emoji: "⚙️", name: "ChatOpenAI", category: "Other", status: "inactive", description: "Alternative config", config: [] },
  {
    id: 10,
    emoji: "📁",
    name: "ConditionanEdger",
    category: "Other",
    status: "inactive",
    description: "Conditional edge routing",
    config: [{ key: "condition", type: "String", value: "" }],
  },
  {
    id: 11,
    emoji: "🗄️",
    name: "SQLDatabase",
    category: "Other",
    status: "active",
    description: "SQL database connector",
    config: [
      { key: "connectionString", type: "String", value: "" },
      { key: "maxConnections", type: "Number", value: "10" },
    ],
  },
  {
    id: 12,
    emoji: "📦",
    name: "VectorStoreMemory",
    category: "Memory",
    status: "active",
    description: "Vector store backed memory",
    config: [
      { key: "embedModel", type: "String", value: "text-embedding-3-small" },
      { key: "topK", type: "Number", value: "4" },
    ],
  },
  {
    id: 13,
    emoji: "⚛️",
    name: "create_react_agent",
    category: "Agents",
    status: "active",
    description: "Create a ReAct pattern agent",
    config: [
      { key: "maxIterations", type: "Number", value: "10" },
      { key: "earlyStop", type: "Boolean", value: "true" },
    ],
  },
];


const Ico = ({ children, size = 18, className = "", ...p }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...p}
  >
    {children}
  </svg>
);

const IcoEdit = (p) => (
  <Ico {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Ico>
);

const IcoTrash = (p) => (
  <Ico {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Ico>
);

const IcoPlus = (p) => (
  <Ico {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Ico>
);

const IcoX = (p) => (
  <Ico {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Ico>
);

const IcoChevDown = (p) => (
  <Ico {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);

const IcoSearch = (p) => (
  <Ico {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Ico>
);

const IcoArrowLeft = (p) => (
  <Ico {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Ico>
);


const CatBadge = ({ cat }) => {
  const s = CAT_STYLE[cat] || CAT_STYLE.Other;
  return (
    <span
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap"
    >
      {cat}
    </span>
  );
};

const StatusBadge = ({ status, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer
    ${
      status === "active"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-gray-100 text-gray-500 border-gray-200"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
    {status}
  </button>
);

const NodeModal = ({ node, onSave, onCancel }) => {
  const [f, setF] = useState({
    name: node?.name || "",
    emoji: node?.emoji || "⚙️",
    category: node?.category || CATEGORIES[0],
    description: node?.description || "",
    status: node?.status || "active",
    config: node?.config ? node.config.map((c) => ({ ...c })) : [],
  });

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const setConfig = (i, k, v) => {
    const next = [...f.config];
    next[i] = { ...next[i], [k]: v };
    set("config", next);
  };
  const removeConfig = (i) => set("config", f.config.filter((_, idx) => idx !== i));
  const addConfig = () => set("config", [...f.config, { key: "", type: "String", value: "" }]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8" style={{ animation: "fadeIn .15s ease" }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[88vh] flex flex-col overflow-hidden border border-gray-200"
        style={{ animation: "modalSlide .2s ease" }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--ff)" }}>
              {node ? `Editing Node Type: ${node.name}` : "New Node Type"}
            </h2>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <IcoX size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "thin" }}>
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Basic Info Form</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={f.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <IcoChevDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Edit form metadata</p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
            <textarea
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition resize-none"
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-0.5">Config Builder Section</h3>
            <p className="text-[11px] text-gray-400 mb-3">default_config JSON</p>

            {f.config.length > 0 && (
              <>
                <div className="grid grid-cols-[1fr_88px_1fr_48px] gap-2 mb-2 px-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Key</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Default Value</span>
                  <span />
                </div>
                <div className="space-y-2">
                  {f.config.map((c, i) => (
                    <div key={`${c.key}-${i}`} className="grid grid-cols-[1fr_88px_1fr_48px] gap-2 items-center group">
                      <input
                        value={c.key}
                        onChange={(e) => setConfig(i, "key", e.target.value)}
                        className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-300 transition"
                      />
                      <div className="relative">
                        <select
                          value={c.type}
                          onChange={(e) => setConfig(i, "type", e.target.value)}
                          className="w-full h-8 px-1.5 pr-5 rounded-md border border-gray-200 text-xs bg-white focus:outline-none focus:border-indigo-300 transition appearance-none"
                        >
                          {TYPES.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        <IcoChevDown
                          size={12}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                      <input
                        value={c.value}
                        onChange={(e) => setConfig(i, "value", e.target.value)}
                        className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-300 transition"
                      />
                      <div className="flex gap-0.5">
                        <button type="button" className="p-1 rounded text-gray-300 hover:text-indigo-500 transition">
                          <IcoEdit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeConfig(i)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 transition"
                        >
                          <IcoTrash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={addConfig}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <IcoPlus size={13} /> Add Config Param
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-3">Form Actions</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onSave(f)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-[0.97]"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ node, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ animation: "fadeIn .12s ease" }}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center" style={{ animation: "modalSlide .18s ease" }}>
      <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <IcoTrash size={20} className="text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">Delete \"{node.name}\"?</h3>
      <p className="text-xs text-gray-500 mb-5">This action cannot be undone.</p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const APP_BASE = "/apps/ai-agent-workflow-node-type";

const ICON_OPTIONS = Object.keys(icons).map((name) => ({ value: name, label: name }));

function LucideIcon({ name, size = 16, className = "" }) {
  const IconComp = icons[name];
  if (!IconComp) return <span className={className}>?</span>;
  return <IconComp size={size} className={className} />;
}

const IconOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <LucideIcon name={props.data.value} size={16} className="text-gray-600 flex-shrink-0" />
      <span className="text-sm truncate">{props.data.label}</span>
    </div>
  </components.Option>
);

const IconSingleValue = (props) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <LucideIcon name={props.data.value} size={16} className="text-gray-700" />
      <span className="text-sm">{props.data.label}</span>
    </div>
  </components.SingleValue>
);

const iconSelectStyles = {
  control: (base) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "0.5rem",
    borderColor: "#e5e7eb",
    fontSize: "14px",
    boxShadow: "none",
    "&:hover": { borderColor: "#c7d2fe" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#eef2ff" : "white",
    color: "#374151",
    padding: "6px 10px",
    cursor: "pointer",
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  menuList: (base) => ({ ...base, maxHeight: "240px" }),
};

function EditNodePage({ node, onSave, onBack }) {
  const [f, setF] = useState({
    name: node.name,
    emoji: node.emoji,
    category: node.category,
    description: node.description,
    status: node.status,
    config: node.config.map((c) => ({ ...c })),
  });

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));
  const setConfig = (i, k, v) => {
    const next = [...f.config];
    next[i] = { ...next[i], [k]: v };
    set("config", next);
  };
  const removeConfig = (i) => set("config", f.config.filter((_, idx) => idx !== i));
  const addConfig = () => set("config", [...f.config, { key: "", type: "String", value: "" }]);
  const color = CAT_STYLE[f.category] || CAT_STYLE.Other;

  return (
    <div className="flex-1 overflow-y-auto p-5 thin-scroll">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
        >
          <IcoArrowLeft size={15} /> Back to Registry
        </button>

        <div>
          {/* Header */}
          <div className="flex items-center gap-4 pb-5 border-b border-indigo-100">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <LucideIcon name={f.emoji} size={22} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Basic Info</h1>
              <p className="text-sm text-gray-400">Configure your tool identity</p>
            </div>
            <button
              onClick={() => onSave(f)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-[0.97]"
            >
              Save
            </button>
          </div>

          <div className="py-6 space-y-6">
            {/* Icon + Name row */}
            <div>
              <div className="flex gap-3">
                <div className="w-64 flex-shrink-0">
                  <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Icon</label>
                  <Select
                    options={ICON_OPTIONS}
                    value={ICON_OPTIONS.find((o) => o.value === f.emoji) || null}
                    onChange={(opt) => set("emoji", opt?.value || "")}
                    components={{ Option: IconOption, SingleValue: IconSingleValue }}
                    styles={{
                      ...iconSelectStyles,
                      control: (base) => ({
                        ...base,
                        minHeight: "44px",
                        borderRadius: "0.75rem",
                        borderColor: "#e5e7eb",
                        fontSize: "14px",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#c7d2fe" },
                      }),
                    }}
                    placeholder=""
                    isClearable
                    filterOption={(option, input) =>
                      !input || option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    value={f.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={f.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <IcoChevDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2">Status</label>
              <div className="flex gap-2 flex-wrap">
                {["active", "inactive", "beta", "deprecated"].map((s) => {
                  const isActive = f.status === s;
                  const dotColor = s === "active" ? "bg-emerald-500" : "bg-gray-300";
                  return (
                    <button
                      key={s}
                      onClick={() => set("status", s)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        isActive
                          ? s === "active"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive && s === "active" ? "bg-emerald-500" : isActive ? "bg-indigo-400" : "bg-gray-300"}`} />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Description</label>
                <span className="text-xs text-gray-400">{f.description.length}/200</span>
              </div>
              <textarea
                value={f.description}
                onChange={(e) => { if (e.target.value.length <= 200) set("description", e.target.value); }}
                rows={4}
                placeholder="Describe your tool..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-0.5">Config Parameters</h3>
              <p className="text-[11px] text-gray-400 mb-3">default_config JSON</p>

              {f.config.length > 0 && (
                <>
                  <div className="grid grid-cols-[1fr_100px_1fr_48px] gap-2 mb-2 px-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Key</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Type</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Default Value</span>
                    <span />
                  </div>
                  <div className="space-y-2">
                    {f.config.map((c, i) => (
                      <div key={`${c.key}-${i}`} className="grid grid-cols-[1fr_100px_1fr_48px] gap-2 items-center group">
                        <input
                          value={c.key}
                          onChange={(e) => setConfig(i, "key", e.target.value)}
                          className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-300 transition"
                        />
                        <div className="relative">
                          <select
                            value={c.type}
                            onChange={(e) => setConfig(i, "type", e.target.value)}
                            className="w-full h-8 px-1.5 pr-5 rounded-md border border-gray-200 text-xs bg-white focus:outline-none focus:border-indigo-300 transition appearance-none"
                          >
                            {TYPES.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                          <IcoChevDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                          value={c.value}
                          onChange={(e) => setConfig(i, "value", e.target.value)}
                          className="h-8 px-2 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-300 transition"
                        />
                        <button
                          type="button"
                          onClick={() => removeConfig(i)}
                          className="p-1 rounded text-gray-300 hover:text-red-500 transition"
                        >
                          <IcoTrash size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={addConfig}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <IcoPlus size={13} /> Add Config Param
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function NodeDetail({ node, onEdit }) {
  return (
    <div className="px-8 py-10">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <LucideIcon name={node.emoji} size={22} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{node.name}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <CatBadge cat={node.category} />
              <StatusBadge status={node.status} onClick={() => {}} />
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Edit Node
        </button>
      </div>

      {node.description && (
        <p className="text-sm text-slate-600 mb-6">{node.description}</p>
      )}

      <div className="space-y-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identifier</h3>
          </div>
          <div className="p-4">
            <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">{node.id}</code>
          </div>
        </div>

        {node.config.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Config Parameters</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {node.config.map((c, i) => (
                <div key={`${c.key}-${i}`} className="flex items-center px-4 py-2.5 text-sm">
                  <span className="font-mono text-indigo-600 w-40 shrink-0">{c.key}</span>
                  <span className="text-slate-400 w-20 shrink-0 text-xs">{c.type}</span>
                  <span className="text-slate-700 font-medium">{c.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [deleteNode, setDeleteNode] = useState(null);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useCallback((to) => {
    window.history.pushState(null, "", to);
  }, []);

  // Parse initial URL
  useMemo(() => {
    const path = window.location.pathname.replace(APP_BASE, "") || "/";
    const editMatch = path.match(/^\/(\d+)\/edit$/);
    const viewMatch = path.match(/^\/(\d+)$/);
    if (editMatch) {
      setSelectedId(Number(editMatch[1]));
      setEditing(true);
    } else if (viewMatch) {
      setSelectedId(Number(viewMatch[1]));
    }
  }, []);

  // Handle browser back/forward
  useState(() => {
    const onPop = () => {
      const path = window.location.pathname.replace(APP_BASE, "") || "/";
      const editMatch = path.match(/^\/(\d+)\/edit$/);
      const viewMatch = path.match(/^\/(\d+)$/);
      if (editMatch) {
        setSelectedId(Number(editMatch[1]));
        setEditing(true);
      } else if (viewMatch) {
        setSelectedId(Number(viewMatch[1]));
        setEditing(false);
      } else {
        setSelectedId(null);
        setEditing(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  });

  const flash = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  const selectedNode = selectedId != null ? nodes.find((n) => n.id === selectedId) : null;

  const sidebarItems = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        category: n.category,
        tags: [n.status],
      })),
    [nodes],
  );

  const handleItemSelect = useCallback(
    (item) => {
      navigate(`${APP_BASE}/${item.id}`);
      setSelectedId(item.id);
      setEditing(false);
    },
    [navigate],
  );

  const handleEdit = useCallback(() => {
    if (selectedNode) {
      navigate(`${APP_BASE}/${selectedNode.id}/edit`);
      setEditing(true);
    }
  }, [selectedNode, navigate]);

  const handleSave = (form) => {
    if (editing && selectedNode) {
      setNodes(nodes.map((n) => (n.id === selectedNode.id ? { ...n, ...form } : n)));
      flash(`Updated ${form.name}`);
      navigate(`${APP_BASE}/${selectedNode.id}`);
      setEditing(false);
    } else {
      const newId = Date.now();
      setNodes([...nodes, { ...form, id: newId }]);
      flash(`Created ${form.name}`);
      setCreating(false);
      navigate(`${APP_BASE}/${newId}`);
      setSelectedId(newId);
    }
  };

  const handleDelete = () => {
    setNodes(nodes.filter((n) => n.id !== deleteNode.id));
    flash(`Deleted ${deleteNode.name}`, "err");
    if (selectedId === deleteNode.id) {
      setSelectedId(null);
      setEditing(false);
      navigate(APP_BASE);
    }
    setDeleteNode(null);
  };

  return (
    <AppShell>
    <div
      className="h-screen overflow-hidden"
      style={{
        "--ff": "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
        "--bg": "#f4f5f7",
        fontFamily: "var(--ff)",
        background: "var(--bg)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalSlide { from { opacity:0; transform:translateY(10px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes toastPop { from { opacity:0; transform:translateY(-8px) scale(.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        .thin-scroll::-webkit-scrollbar { width:4px }
        .thin-scroll::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:99px }
        .thin-scroll::-webkit-scrollbar-track { background:transparent }
      `}</style>

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100]" style={{ animation: "toastPop .18s ease" }}>
          <div
            className={`px-5 py-2.5 rounded-xl shadow-lg text-sm font-semibold text-white whitespace-nowrap ${
              toast.type === "err" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}

      <div className="h-full flex overflow-hidden">
        <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
          <PanelLeftSidebarMenu002
            title="Node Types"
            filterSections={[]}
            items={sidebarItems}
            searchPlaceholder="Search nodes..."
            onItemSelect={handleItemSelect}
            header={<></>}
            hideListHeader
            className="rounded-none shadow-none border-0"
          />
        </aside>

        <div className="flex-1 overflow-y-auto thin-scroll">
          {editing && selectedNode ? (
            <EditNodePage
              node={selectedNode}
              onSave={handleSave}
              onBack={() => {
                navigate(`${APP_BASE}/${selectedNode.id}`);
                setEditing(false);
              }}
            />
          ) : selectedNode ? (
            <NodeDetail node={selectedNode} onEdit={handleEdit} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-700">Select a node type</h2>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Choose a node type from the sidebar to view its details.
              </p>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <NodeModal
          node={null}
          onSave={handleSave}
          onCancel={() => setCreating(false)}
        />
      )}
      {deleteNode && <DeleteModal node={deleteNode} onConfirm={handleDelete} onCancel={() => setDeleteNode(null)} />}
    </div>
    </AppShell>
  );
}
