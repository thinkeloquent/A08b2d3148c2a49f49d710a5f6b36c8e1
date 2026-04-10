import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { PanelLeftSidebarMenu002 } from '@internal/panel-left-sidebar-menu-002';
import type { SidebarItem } from '@internal/panel-left-sidebar-menu-002';
import { AppShell } from './layout/AppShell';
import { promptsApi } from './services/api';
import type { Prompt } from './types';
import PromptDetailPage from './pages/PromptDetailPage';
import EditPromptPage from './pages/EditPromptPage';
import EditVersionPage from './pages/EditVersionPage';
import ApiDocsPage from './pages/ApiDocsPage';
import NewPromptPage from './pages/NewPromptPage';

function PromptsSidebar({ prompts, onSelect }: { prompts: Prompt[]; onSelect: (id: string) => void }) {
  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      prompts.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.status,
        tags: [p.slug],
        updated: new Date(p.updatedAt).toLocaleDateString(),
      })),
    [prompts],
  );

  const handleItemSelect = useCallback(
    (item: SidebarItem) => {
      onSelect(String(item.id));
    },
    [onSelect],
  );

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
      <PanelLeftSidebarMenu002
        title="Prompts"
        filterSections={[]}
        items={sidebarItems}
        searchPlaceholder="Search prompts..."
        onItemSelect={handleItemSelect}
        header={<></>}
        hideListHeader
        className="rounded-none shadow-none border-0"
      />
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-700">Select a prompt</h2>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">
        Choose a prompt from the sidebar to view its details.
      </p>
    </div>
  );
}

function PromptsLayout() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    promptsApi
      .list()
      .then((res) => {
        setPrompts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      navigate(`/prompts/${id}`);
    },
    [navigate],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <PromptsSidebar prompts={prompts} onSelect={handleSelect} />
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading prompts...</div>
          </div>
        )}
        {error && (
          <div className="p-4 mx-8 mt-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && <Outlet />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/prompts" replace />} />
        <Route path="/prompts" element={<PromptsLayout />}>
          <Route index element={<EmptyState />} />
          <Route path="new" element={<NewPromptPage />} />
          <Route path=":id" element={<PromptDetailPage />} />
          <Route path=":id/edit" element={<EditPromptPage />} />
          <Route path=":id/versions/:versionId/edit" element={<EditVersionPage />} />
        </Route>
        <Route path="/prompts/:id/v/:versionNumber/docs/api" element={<ApiDocsPage />} />
      </Routes>
    </AppShell>
  );
}
