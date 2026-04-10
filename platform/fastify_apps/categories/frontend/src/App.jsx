import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./layout/AppShell";

const API = "/~/api/categories";

const FALLBACK_CATEGORY_TYPES = [
  { id: "fb-ct-1", name: "System Prompt" },
  { id: "fb-ct-2", name: "AI Persona" },
  { id: "fb-ct-3", name: "Chatbot Definition" },
  { id: "fb-ct-4", name: "Vector Store Reference" },
  { id: "fb-ct-5", name: "Tool Definition" },
  { id: "fb-ct-6", name: "Workflow Template" },
];

const FALLBACK_TARGET_APPS = [
  { id: "fb-ta-1", name: "Prompt Template Studio" },
  { id: "fb-ta-2", name: "AI Persona Builder" },
  { id: "fb-ta-3", name: "Support Ticket App" },
  { id: "fb-ta-4", name: "Knowledge Base Admin" },
  { id: "fb-ta-5", name: "Tool Registry" },
  { id: "fb-ta-6", name: "Workflow Editor" },
];

const FALLBACK_CATEGORIES = [
  {
    id: crypto.randomUUID(),
    name: "Prompt Snippets",
    categoryType: { name: "System Prompt" },
    targetApp: { name: "Prompt Template Studio" },
    category_type_id: "fb-ct-1",
    target_app_id: "fb-ta-1",
    description: "Reusable components for large language model prompts.",
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Persona Templates",
    categoryType: { name: "AI Persona" },
    targetApp: { name: "AI Persona Builder" },
    category_type_id: "fb-ct-2",
    target_app_id: "fb-ta-2",
    description: "Base profiles for AI assistants (e.g., 'Friendly Guide').",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Customer Support Bots",
    categoryType: { name: "Chatbot Definition" },
    targetApp: { name: "Support Ticket App" },
    category_type_id: "fb-ct-3",
    target_app_id: "fb-ta-3",
    description: "AI bots linked to customer service channels.",
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "RAG Knowledge Bases",
    categoryType: { name: "Vector Store Reference" },
    targetApp: { name: "Knowledge Base Admin" },
    category_type_id: "fb-ct-4",
    target_app_id: "fb-ta-4",
    description: "References to indexed vector databases for retrieval.",
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

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

const IcoDots = (p) => (
  <Ico {...p}>
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </Ico>
);

const IcoArrowLeft = (p) => (
  <Ico {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </Ico>
);

const IcoCopy = (p) => (
  <Ico {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Ico>
);

const IcoCheck = (p) => (
  <Ico {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Ico>
);

const CopyId = ({ id }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      title={id}
      className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
    >
      {copied ? <IcoCheck size={15} className="text-emerald-500" /> : <IcoCopy size={15} />}
    </button>
  );
};

const CategoryModal = ({ category, categoryTypes, targetApps, onSave, onCancel }) => {
  const [f, setF] = useState({
    name: category?.name || "",
    category_type_id: category?.category_type_id || categoryTypes[0]?.id || "",
    target_app_id: category?.target_app_id || targetApps[0]?.id || "",
    description: category?.description || "",
  });

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8" style={{ animation: "fadeIn .15s ease" }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[88vh] flex flex-col overflow-hidden border border-gray-200"
        style={{ animation: "modalSlide .2s ease" }}
      >
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {category ? `Edit Category` : "New Category"}
            </h2>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <IcoX size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: "thin" }}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
            <input
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g., Prompt Snippets"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
            />
          </div>
          {category?.id && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ID</label>
              <div className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-sm text-gray-400 font-mono truncate">{category.id}</span>
                <CopyId id={category.id} />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category Type</label>
            <div className="relative">
              <select
                value={f.category_type_id}
                onChange={(e) => set("category_type_id", e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
              >
                {categoryTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <IcoChevDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Target Application</label>
            <div className="relative">
              <select
                value={f.target_app_id}
                onChange={(e) => set("target_app_id", e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
              >
                {targetApps.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <IcoChevDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea
              value={f.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={() => onSave(f)}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-[0.97]"
          >
            {category ? "Save Changes" : "Create Category"}
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
  );
};

const DeleteModal = ({ category, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ animation: "fadeIn .12s ease" }}>
    <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center" style={{ animation: "modalSlide .18s ease" }}>
      <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
        <IcoTrash size={20} className="text-red-500" />
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-1">Delete &quot;{category.name}&quot;?</h3>
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

const IcoTag = (p) => (
  <Ico {...p}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Ico>
);

const IcoGrid = (p) => (
  <Ico {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </Ico>
);

const IcoMonitor = (p) => (
  <Ico {...p}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </Ico>
);

const IcoDownload = (p) => (
  <Ico {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Ico>
);

const IcoLink = (p) => (
  <Ico {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Ico>
);

const TAB_DEFS = [
  { label: "Categories", icon: IcoGrid, slug: "categories" },
  { label: "Category Type", icon: IcoTag, slug: "category-type" },
  { label: "Target Application", icon: IcoMonitor, slug: "target-application" },
  { label: "Export", icon: IcoDownload, slug: "export" },
];

const TabBar = ({ activeTab, onTabChange }) => (
  <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm mb-4">
    {TAB_DEFS.map((tab, i) => {
      const Icon = tab.icon;
      const active = activeTab === i;
      return (
        <button
          key={i}
          onClick={() => onTabChange(i)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
            active
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <Icon size={15} />
          {tab.label}
        </button>
      );
    })}
  </div>
);

/* ── Inline CRUD for Category Types ── */
function CategoryTypesPanel({ categoryTypes, setCategoryTypes, flash }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await apiFetch("/category-types", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setCategoryTypes((prev) => [...prev, res.category_type]);
      flash(`Created "${name.trim()}"`);
    } catch {
      const newItem = { id: crypto.randomUUID(), name: name.trim() };
      setCategoryTypes((prev) => [...prev, newItem]);
      flash(`Created "${name.trim()}"`);
    }
    setName("");
  };

  const handleDelete = async (item) => {
    try {
      await apiFetch(`/category-types/${item.id}`, { method: "DELETE" });
    } catch {
      // continue locally
    }
    setCategoryTypes((prev) => prev.filter((t) => t.id !== item.id));
    flash(`Deleted "${item.name}"`, "err");
  };

  const handleUpdate = async (item) => {
    if (!editName.trim()) return;
    try {
      const res = await apiFetch(`/category-types/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });
      setCategoryTypes((prev) => prev.map((t) => (t.id === item.id ? res.category_type : t)));
    } catch {
      setCategoryTypes((prev) => prev.map((t) => (t.id === item.id ? { ...t, name: editName.trim() } : t)));
    }
    flash(`Updated "${editName.trim()}"`);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New category type name..."
          className="flex-1 max-w-xs h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
        />
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-[0.97]"
        >
          <IcoPlus size={15} /> Add
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-indigo-50/40">
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-3">Name</th>
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">ID</th>
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categoryTypes.map((t, idx) => (
              <tr
                key={t.id}
                className={`border-b border-gray-50 transition-colors group ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                } hover:bg-indigo-50/20`}
              >
                <td className="px-3 py-3">
                  {editId === t.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(t);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      autoFocus
                      className="h-8 px-2 rounded-lg border border-indigo-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200 transition"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">{t.name}</span>
                  )}
                </td>
                <td className="px-2 py-3">
                  <CopyId id={t.id} />
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-0.5">
                    {editId === t.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(t)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition"
                        >
                          <IcoCheck size={15} />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        >
                          <IcoX size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditId(t.id); setEditName(t.name); }}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                        >
                          <IcoEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <IcoTrash size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categoryTypes.length === 0 && (
              <tr>
                <td colSpan={3} className="py-10 text-center text-sm text-gray-400">
                  No category types yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Inline CRUD for Target Apps ── */
function TargetAppsPanel({ targetApps, setTargetApps, flash }) {
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await apiFetch("/target-apps", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setTargetApps((prev) => [...prev, res.target_app]);
      flash(`Created "${name.trim()}"`);
    } catch {
      const newItem = { id: crypto.randomUUID(), name: name.trim() };
      setTargetApps((prev) => [...prev, newItem]);
      flash(`Created "${name.trim()}"`);
    }
    setName("");
  };

  const handleDelete = async (item) => {
    try {
      await apiFetch(`/target-apps/${item.id}`, { method: "DELETE" });
    } catch {
      // continue locally
    }
    setTargetApps((prev) => prev.filter((a) => a.id !== item.id));
    flash(`Deleted "${item.name}"`, "err");
  };

  const handleUpdate = async (item) => {
    if (!editName.trim()) return;
    try {
      const res = await apiFetch(`/target-apps/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName.trim() }),
      });
      setTargetApps((prev) => prev.map((a) => (a.id === item.id ? res.target_app : a)));
    } catch {
      setTargetApps((prev) => prev.map((a) => (a.id === item.id ? { ...a, name: editName.trim() } : a)));
    }
    flash(`Updated "${editName.trim()}"`);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New target application name..."
          className="flex-1 max-w-xs h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
        />
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-[0.97]"
        >
          <IcoPlus size={15} /> Add
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-indigo-50/40">
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-3">Name</th>
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">ID</th>
              <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targetApps.map((a, idx) => (
              <tr
                key={a.id}
                className={`border-b border-gray-50 transition-colors group ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                } hover:bg-indigo-50/20`}
              >
                <td className="px-3 py-3">
                  {editId === a.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(a);
                        if (e.key === "Escape") setEditId(null);
                      }}
                      autoFocus
                      className="h-8 px-2 rounded-lg border border-indigo-300 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200 transition"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">{a.name}</span>
                  )}
                </td>
                <td className="px-2 py-3">
                  <CopyId id={a.id} />
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-0.5">
                    {editId === a.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(a)}
                          className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-500 hover:text-emerald-600 transition"
                        >
                          <IcoCheck size={15} />
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        >
                          <IcoX size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditId(a.id); setEditName(a.name); }}
                          className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                        >
                          <IcoEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <IcoTrash size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {targetApps.length === 0 && (
              <tr>
                <td colSpan={3} className="py-10 text-center text-sm text-gray-400">
                  No target applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Export Panel ── */

const IcoPlay = (p) => (
  <Ico {...p}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </Ico>
);

const ENDPOINTS = [
  {
    label: "Export All",
    method: "GET",
    path: "/export",
    description: "Retrieve all categories, category types, and target applications as JSON.",
    params: [],
  },
  {
    label: "List Categories",
    method: "GET",
    path: "/",
    description: "List categories with optional filters. Both filters are combinable.",
    params: [
      { name: "category_type_id", type: "select", source: "categoryTypes", placeholder: "All types" },
      { name: "category_type_name", type: "text", placeholder: "Type name (case-insensitive)..." },
      { name: "target_app_id", type: "select", source: "targetApps", placeholder: "All apps" },
      { name: "target_app_name", type: "text", placeholder: "App name (case-insensitive)..." },
    ],
  },
  {
    label: "Search Categories",
    method: "GET",
    path: "/search",
    description: "Fuzzy search across name and description (case-insensitive ILIKE).",
    params: [
      { name: "q", type: "text", placeholder: "Search term...", required: true },
    ],
  },
];

function EndpointRow({ ep, categoryTypes, targetApps, flash }) {
  const [paramValues, setParamValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const setParam = (k, v) => setParamValues((prev) => ({ ...prev, [k]: v }));

  const buildQueryString = () => {
    const parts = [];
    for (const p of ep.params) {
      const v = paramValues[p.name];
      if (v) parts.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(v)}`);
    }
    return parts.length ? `?${parts.join("&")}` : "";
  };

  const fullPath = () => `${ep.path}${buildQueryString()}`;
  const fullUrl = () => `${window.location.origin}/~/api/categories${fullPath()}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl());
    setCopiedUrl(true);
    flash("URL copied");
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  const tryEndpoint = async () => {
    for (const p of ep.params) {
      if (p.required && !paramValues[p.name]) {
        setResult({ error: `"${p.name}" is required.` });
        return;
      }
    }
    setLoading(true);
    try {
      const data = await apiFetch(fullPath());
      setResult(data);
    } catch (err) {
      setResult({ error: err.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result || result.error) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories-${ep.label.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Downloaded");
  };

  const sources = { categoryTypes, targetApps };

  const resultCount = result && !result.error
    ? (result.categories?.length ?? result.category_types?.length ?? null)
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
            {ep.method}
          </span>
          <h3 className="text-sm font-bold text-gray-900">{ep.label}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">{ep.description}</p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 min-w-0">
            <IcoLink size={14} className="text-gray-400 shrink-0" />
            <code className="text-xs text-gray-700 font-mono truncate flex-1">
              /~/api/categories{fullPath()}
            </code>
          </div>
          <button
            onClick={copyUrl}
            title="Copy full URL"
            className="shrink-0 p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
          >
            {copiedUrl ? <IcoCheck size={15} className="text-emerald-500" /> : <IcoCopy size={15} />}
          </button>
        </div>

        {ep.params.length > 0 && (
          <div className="flex flex-wrap items-end gap-2 mb-3">
            {ep.params.map((p) => (
              <div key={p.name} className="flex-1 min-w-[160px] max-w-xs">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {p.name}{p.required ? " *" : ""}
                </label>
                {p.type === "select" ? (
                  <div className="relative">
                    <select
                      value={paramValues[p.name] || ""}
                      onChange={(e) => setParam(p.name, e.target.value)}
                      className="w-full h-9 px-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
                    >
                      <option value="">{p.placeholder}</option>
                      {(sources[p.source] || []).map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                    <IcoChevDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    value={paramValues[p.name] || ""}
                    onChange={(e) => setParam(p.name, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && tryEndpoint()}
                    placeholder={p.placeholder}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={tryEndpoint}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-[0.97] disabled:opacity-50"
          >
            <IcoPlay size={14} />
            {loading ? "Loading..." : "Try It"}
          </button>
          {result && !result.error && (
            <button
              onClick={downloadJson}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition active:scale-[0.97]"
            >
              <IcoDownload size={15} /> Download
            </button>
          )}
          {result && (
            <button
              onClick={() => setResult(null)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              title="Clear result"
            >
              <IcoX size={14} />
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="border-t border-gray-100">
          <div className="px-4 py-2 bg-indigo-50/40 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Response {result.error ? "(Error)" : ""}
            </span>
            {resultCount !== null && (
              <span className="text-[11px] text-gray-500">{resultCount} result{resultCount !== 1 ? "s" : ""}</span>
            )}
          </div>
          <pre className="p-4 text-xs text-gray-700 font-mono overflow-auto max-h-[300px] thin-scroll whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ExportPanel({ categoryTypes, targetApps, flash }) {
  return (
    <div className="space-y-4">
      {ENDPOINTS.map((ep) => (
        <EndpointRow
          key={ep.path + ep.label}
          ep={ep}
          categoryTypes={categoryTypes}
          targetApps={targetApps}
          flash={flash}
        />
      ))}
    </div>
  );
}

const APP_BASE = "/apps/categories";

function EditCategoryPage({ category, categoryTypes, targetApps, onSave, onBack }) {
  const [f, setF] = useState({
    name: category.name,
    category_type_id: category.category_type_id,
    target_app_id: category.target_app_id,
    description: category.description || "",
  });

  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="flex-1 overflow-y-auto p-5 thin-scroll">
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
        >
          <IcoArrowLeft size={15} /> Back to Categories
        </button>

        <div>
          <div className="flex items-center gap-4 pb-5 border-b border-indigo-100">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-gray-900">{category.name}</h1>
                <CopyId id={category.id} />
              </div>
            </div>
            <button
              onClick={() => onSave(f)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition active:scale-[0.97]"
            >
              Save
            </button>
          </div>

          <div className="py-6 space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Category Name</label>
              <input
                value={f.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Category Type</label>
              <div className="relative">
                <select
                  value={f.category_type_id}
                  onChange={(e) => set("category_type_id", e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
                >
                  {categoryTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <IcoChevDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Target Application</label>
              <div className="relative">
                <select
                  value={f.target_app_id}
                  onChange={(e) => set("target_app_id", e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition appearance-none"
                >
                  {targetApps.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <IcoChevDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Description</label>
                <span className="text-xs text-gray-400">{f.description.length}/200</span>
              </div>
              <textarea
                value={f.description}
                onChange={(e) => { if (e.target.value.length <= 200) set("description", e.target.value); }}
                rows={4}
                placeholder="Describe this category..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function apiFetch(path, opts) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [targetApps, setTargetApps] = useState([]);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [path, setPath] = useState(window.location.pathname);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTabRaw] = useState(() => {
    const slug = window.location.pathname.replace(`${APP_BASE}/`, "").replace(/\/.*$/, "");
    const idx = TAB_DEFS.findIndex((t) => t.slug === slug);
    return idx >= 0 ? idx : 0;
  });

  // Fetch lookup data and categories from API
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [typesRes, appsRes, catsRes] = await Promise.all([
          apiFetch("/category-types"),
          apiFetch("/target-apps"),
          apiFetch("/"),
        ]);
        if (cancelled) return;
        setCategoryTypes(typesRes.category_types);
        setTargetApps(appsRes.target_apps);
        setCategories(catsRes.categories);
      } catch {
        // API not available — use fallback data
        if (cancelled) return;
        setCategoryTypes(FALLBACK_CATEGORY_TYPES);
        setTargetApps(FALLBACK_TARGET_APPS);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState(null, "", to);
    setPath(to);
  }, []);

  const setTab = useCallback((i) => {
    setTabRaw(i);
    navigate(`${APP_BASE}/${TAB_DEFS[i].slug}`);
  }, [navigate]);

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
      const slug = window.location.pathname.replace(`${APP_BASE}/`, "").replace(/\/.*$/, "");
      const idx = TAB_DEFS.findIndex((t) => t.slug === slug);
      setTabRaw(idx >= 0 ? idx : 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const flash = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  const filtered = categories.filter((c) => {
    if (!q) return true;
    const lq = q.toLowerCase();
    return c.name.toLowerCase().includes(lq);
  });

  const editMatch = path.match(/\/edit\/([0-9a-f-]{36})$/);
  const editId = editMatch ? editMatch[1] : null;
  const editCategory = editId != null ? categories.find((c) => c.id === editId) : null;

  const handleSave = async (form) => {
    try {
      if (editModal) {
        const res = await apiFetch(`/${editModal.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setCategories(categories.map((c) => (c.id === editModal.id ? res.category : c)));
        flash(`Updated ${form.name}`);
        setEditModal(null);
      } else if (editCategory) {
        const res = await apiFetch(`/${editCategory.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setCategories(categories.map((c) => (c.id === editCategory.id ? res.category : c)));
        flash(`Updated ${form.name}`);
        navigate(APP_BASE);
      } else {
        const res = await apiFetch("/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setCategories([res.category, ...categories]);
        flash(`Created ${form.name}`);
        setCreating(false);
      }
    } catch {
      // Fallback for when API is unavailable
      if (editModal) {
        setCategories(categories.map((c) => (c.id === editModal.id ? { ...c, ...form, updatedAt: new Date().toISOString() } : c)));
        flash(`Updated ${form.name}`);
        setEditModal(null);
      } else if (editCategory) {
        setCategories(categories.map((c) => (c.id === editCategory.id ? { ...c, ...form, updatedAt: new Date().toISOString() } : c)));
        flash(`Updated ${form.name}`);
        navigate(APP_BASE);
      } else {
        const typeName = categoryTypes.find((t) => t.id === form.category_type_id)?.name || "";
        const appName = targetApps.find((a) => a.id === form.target_app_id)?.name || "";
        setCategories([{
          ...form,
          id: crypto.randomUUID(),
          categoryType: { name: typeName },
          targetApp: { name: appName },
          updatedAt: new Date().toISOString(),
        }, ...categories]);
        flash(`Created ${form.name}`);
        setCreating(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/${deleteCategory.id}`, { method: "DELETE" });
    } catch {
      // Continue with local delete even if API fails
    }
    setCategories(categories.filter((c) => c.id !== deleteCategory.id));
    flash(`Deleted ${deleteCategory.name}`, "err");
    setDeleteCategory(null);
  };

  if (loading) {
    return (
      <AppShell>
      <div className="h-screen flex items-center justify-center" style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", background: "#f4f5f7" }}>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
      </AppShell>
    );
  }

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
        {editCategory ? (
          <EditCategoryPage
            category={editCategory}
            categoryTypes={categoryTypes}
            targetApps={targetApps}
            onSave={handleSave}
            onBack={() => navigate(`${APP_BASE}/${TAB_DEFS[0].slug}`)}
          />
        ) : (
        <main className="flex-1 overflow-y-auto p-5 thin-scroll">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-800">Category Manager</h1>
          </div>

          <TabBar activeTab={tab} onTabChange={setTab} />

          {tab === 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 max-w-xs">
                  <IcoSearch size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300 transition"
                  />
                </div>
              </div>
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-[0.97]"
              >
                <IcoPlus size={15} /> Add Category
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-indigo-50/40">
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-3">Category Name</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">ID</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">Category Type</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">Target Application</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">Description</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">Last Updated</th>
                    <th className="text-left text-[11px] font-bold text-indigo-900 uppercase tracking-wider py-2.5 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-50 transition-colors group ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      } hover:bg-indigo-50/20`}
                    >
                      <td className="px-3 py-3">
                        <span className="text-sm font-semibold text-gray-700">{c.name}</span>
                      </td>
                      <td className="px-2 py-3">
                        <CopyId id={c.id} />
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-sm text-gray-600">{c.categoryType?.name}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-sm text-gray-600">{c.targetApp?.name}</span>
                      </td>
                      <td className="px-2 py-3 max-w-[200px]">
                        <span className="text-sm text-gray-500 line-clamp-2">{c.description}</span>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-400">{timeAgo(c.updatedAt)}</span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => navigate(`${APP_BASE}/edit/${c.id}`)}
                            className="p-1.5 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition"
                          >
                            <IcoEdit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteCategory(c)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                          >
                            <IcoTrash size={15} />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                            <IcoDots size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                        No categories match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {tab === 1 && (
            <CategoryTypesPanel
              categoryTypes={categoryTypes}
              setCategoryTypes={setCategoryTypes}
              flash={flash}
            />
          )}

          {tab === 2 && (
            <TargetAppsPanel
              targetApps={targetApps}
              setTargetApps={setTargetApps}
              flash={flash}
            />
          )}

          {tab === 3 && (
            <ExportPanel
              categoryTypes={categoryTypes}
              targetApps={targetApps}
              flash={flash}
            />
          )}
        </main>
        )}
      </div>

      {creating && (
        <CategoryModal
          category={null}
          categoryTypes={categoryTypes}
          targetApps={targetApps}
          onSave={handleSave}
          onCancel={() => setCreating(false)}
        />
      )}
      {editModal && (
        <CategoryModal
          category={editModal}
          categoryTypes={categoryTypes}
          targetApps={targetApps}
          onSave={handleSave}
          onCancel={() => setEditModal(null)}
        />
      )}
      {deleteCategory && <DeleteModal category={deleteCategory} onConfirm={handleDelete} onCancel={() => setDeleteCategory(null)} />}
    </div>
    </AppShell>
  );
}
