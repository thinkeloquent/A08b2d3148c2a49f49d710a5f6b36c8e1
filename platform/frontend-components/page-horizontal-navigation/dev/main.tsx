import { useState, useEffect, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { HorizontalNavigation } from "../src";
import type { NavGroup, ActionItem, TrailingTab } from "../src";
import type { ScopeSelectorScope, ScopeSelectorValue } from "@internal/scope-selector";

/* ── Sample SVG icons ── */
const icon = (d: string) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const GridIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
  </svg>
);

const WorkflowIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="3" cy="8" r="2" />
    <circle cx="13" cy="4" r="2" />
    <circle cx="13" cy="12" r="2" />
    <path d="M5 7.2L11 4.8M5 8.8L11 11.2" />
  </svg>
);

const ActivityIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1,8 4,8 6,3 8,13 10,6 12,8 15,8" />
  </svg>
);

const ChartIcon = icon("M2 14V7M6 14V4M10 14V9M14 14V2");

const CubeIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
    <path d="M8 8L14 4.5M8 8L2 4.5M8 8V15" />
  </svg>
);

const SparkleIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 1V15M1 8H15M3 3L13 13M13 3L3 13" strokeWidth="1" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const FormIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="11" x2="8" y2="11" />
  </svg>
);

const TagIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1.5 1.5H7.5L14.5 8.5L8.5 14.5L1.5 7.5V1.5Z" />
    <circle cx="5" cy="5" r="1" fill="currentColor" />
  </svg>
);

const DatabaseIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <ellipse cx="8" cy="4" rx="6" ry="2.5" />
    <path d="M2 4V12C2 13.38 4.69 14.5 8 14.5S14 13.38 14 12V4" />
    <path d="M2 8C2 9.38 4.69 10.5 8 10.5S14 9.38 14 8" />
  </svg>
);

const CodeIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="5,4 1,8 5,12" />
    <polyline points="11,4 15,8 11,12" />
    <line x1="9" y1="2" x2="7" y2="14" />
  </svg>
);

const BellIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 6.5C4 4 5.8 2 8 2S12 4 12 6.5C12 10 14 11 14 11H2S4 10 4 6.5Z" />
    <path d="M6.5 13C6.8 13.6 7.3 14 8 14S9.2 13.6 9.5 13" />
  </svg>
);

const SettingsIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.9 2.9L4.3 4.3M11.7 11.7L13.1 13.1M13.1 2.9L11.7 4.3M4.3 11.7L2.9 13.1" />
  </svg>
);

const UserIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="8" cy="5.5" r="3" />
    <path d="M2.5 14.5C2.5 11.5 5 9.5 8 9.5S13.5 11.5 13.5 14.5" />
  </svg>
);

/* ── Sample data ── */

const NAV_GROUPS: NavGroup[] = [
  {
    id: "core",
    items: [
      { id: "overview", label: "Overview", icon: GridIcon },
      { id: "workflows", label: "Workflows", icon: WorkflowIcon, badge: 3 },
      { id: "activity", label: "Activity", icon: ActivityIcon },
      { id: "insights", label: "Insights", icon: ChartIcon },
    ],
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    items: [
      { id: "node-registry", label: "Node Type Registry", icon: CubeIcon },
      { id: "ai-ask", label: "AI Ask V2", icon: SparkleIcon, badge: "New" },
      { id: "form-builder", label: "App Form Builder", icon: FormIcon },
    ],
  },
  {
    id: "data",
    label: "Data",
    items: [
      { id: "category-mgr", label: "Category Manager", icon: TagIcon },
      { id: "chromadb", label: "ChromaDB Explorer", icon: DatabaseIcon },
    ],
  },
  {
    id: "dev",
    label: "Developer",
    items: [{ id: "code-repos", label: "Code Repositories", icon: CodeIcon }],
  },
];

const ACTIONS: ActionItem[] = [
  {
    id: "notifications",
    icon: BellIcon,
    ariaLabel: "Notifications",
    showDot: true,
  },
  { id: "settings-action", icon: SettingsIcon, ariaLabel: "Settings" },
];

/* ── FQDP Scope Selector ── */

const FQDP_BASE = "/~/api/fqdp_management_system";

const SCOPE_DEFS: { key: string; label: string; color: string }[] = [
  { key: "organizations", label: "Organizations", color: "#6C5CE7" },
  { key: "workspaces", label: "Workspaces", color: "#0984E3" },
  { key: "teams", label: "Teams", color: "#00B894" },
  { key: "applications", label: "Applications", color: "#E17055" },
  { key: "projects", label: "Projects", color: "#FDCB6E" },
  { key: "resources", label: "Resources", color: "#E84393" },
];

function useFqdpScopes(): ScopeSelectorScope[] {
  const [scopes, setScopes] = useState<ScopeSelectorScope[]>([]);

  useEffect(() => {
    Promise.all(
      SCOPE_DEFS.map(async (def) => {
        const res = await fetch(`${FQDP_BASE}/${def.key}`);
        const json = await res.json();
        const items = (json.data ?? []).map((d: { id: string; name: string }) => ({
          id: d.id,
          name: d.name,
          badge: d.name.charAt(0).toUpperCase(),
        }));
        return { ...def, items } as ScopeSelectorScope;
      })
    ).then(setScopes);
  }, []);

  return scopes;
}

const TRAILING_TABS: TrailingTab[] = [
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

type Variant = "compound" | "compound-explicit" | "standalone";

const VARIANT_GROUPS: NavGroup[] = [
  {
    id: "variants",
    items: [
      { id: "compound", label: "Compound (auto Nav)" },
      { id: "compound-explicit", label: "Compound (explicit Nav)" },
      { id: "standalone", label: "Standalone Nav" },
    ],
  },
];

function PageContent({ activeId }: { activeId: string }) {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-slate-800 mb-1">
        {NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeId)
          ?.label || activeId}
      </h1>
      <p className="text-sm text-slate-400">Page content goes here.</p>
    </div>
  );
}

function getVariantFromPath(): Variant {
  const path = window.location.pathname.replace(/^\//, "") || "compound";
  if (path === "compound-explicit" || path === "standalone") return path;
  return "compound";
}

function App() {
  const [variant, setVariant] = useState<Variant>(getVariantFromPath);
  const [activeId, setActiveId] = useState("overview");
  const fqdpScopes = useFqdpScopes();
  const [scopeValue, setScopeValue] = useState<ScopeSelectorValue | undefined>();

  const handleScopeSelect = useCallback((value: ScopeSelectorValue) => {
    setScopeValue(value);
  }, []);

  const fqdpScopeSelector = useMemo(() => {
    if (fqdpScopes.length === 0) return undefined;
    return {
      scopes: fqdpScopes,
      value: scopeValue,
      onSelect: handleScopeSelect,
      placeholder: "Select scope",
      width: 280,
    };
  }, [fqdpScopes, scopeValue, handleScopeSelect]);

  // Sync variant from popstate (back/forward)
  useEffect(() => {
    const onPop = () => setVariant(getVariantFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (id: string) => {
    const v = id as Variant;
    setVariant(v);
    window.history.pushState(null, "", `/${v}`);
  };

  return (
    <div>
      {/* Variant picker — standalone Nav usage */}
      <div>
        <HorizontalNavigation.Nav
          groups={VARIANT_GROUPS}
          activeId={variant}
          onActiveChange={navigate}
        />
      </div>

      {/* Compound — auto Nav */}
      {variant === "compound" && (
        <HorizontalNavigation
          groups={NAV_GROUPS}
          activeId={activeId}
          onActiveChange={setActiveId}
          fqdpScopeSelector={fqdpScopeSelector}
          search={{ placeholder: "Search pages..." }}
          actions={ACTIONS}
          user={{ icon: UserIcon }}
        >
          <PageContent activeId={activeId} />
        </HorizontalNavigation>
      )}

      {/* Compound — explicit Nav with trailingTabs */}
      {variant === "compound-explicit" && (
        <HorizontalNavigation
          groups={NAV_GROUPS}
          activeId={activeId}
          onActiveChange={setActiveId}
          fqdpScopeSelector={fqdpScopeSelector}
          search={{ placeholder: "Search pages..." }}
          actions={ACTIONS}
          user={{ icon: UserIcon }}
        >
          <HorizontalNavigation.Nav trailingTabs={TRAILING_TABS} />
          <PageContent activeId={activeId} />
        </HorizontalNavigation>
      )}

      {/* Standalone — just the tab bar */}
      {variant === "standalone" && (
        <HorizontalNavigation.Nav
          groups={NAV_GROUPS}
          activeId={activeId}
          onActiveChange={setActiveId}
          trailingTabs={TRAILING_TABS}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
