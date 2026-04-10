/**
 * Persona Editor Main Application
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { PanelLeftSidebarMenu002 } from '@internal/panel-left-sidebar-menu-002';
import type { SidebarItem } from '@internal/panel-left-sidebar-menu-002';
import { AppShell } from './layout/AppShell';
import { queryClient } from './lib/queryClient';
import { usePersonas, usePersona } from './hooks/usePersonas';
import { LLMDefaultCreatePage } from './components/LLMDefaultCreatePage';
import { PersonaCreatePage } from './components/PersonaCreatePage';
import { PersonaEditPage } from './components/PersonaEditPage';


const BASE = '/apps/persona-editor';

function parseRoute(): { personaId: string | null; editing: boolean; special: string | null } {
  const path = window.location.pathname.replace(BASE, '') || '/';
  if (path === '/new') return { personaId: null, editing: false, special: 'new' };
  if (path === '/llm-default/new') return { personaId: null, editing: false, special: 'llm-default-new' };
  const editMatch = path.match(/^\/(.+)\/edit$/);
  if (editMatch) return { personaId: editMatch[1], editing: true, special: null };
  const idMatch = path.match(/^\/([a-f0-9-]+)$/);
  if (idMatch) return { personaId: idMatch[1], editing: false, special: null };
  return { personaId: null, editing: false, special: null };
}

function PersonaDetail({ personaId }: { personaId: string }) {
  const { data: persona, isLoading } = usePersona(personaId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading persona...</div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Persona not found</div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{persona.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            {persona.role && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">
                {persona.role}
              </span>
            )}
            {persona.tone && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                {persona.tone}
              </span>
            )}
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">
              {persona.llm_provider}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            window.history.pushState(null, '', `${BASE}/${persona.id}/edit`);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Edit Persona
        </button>
      </div>

      {persona.description && (
        <p className="text-sm text-slate-600 mb-6">{persona.description}</p>
      )}

      <div className="space-y-4">
        {/* ID */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Identifier</h3>
          </div>
          <div className="p-4">
            <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">{persona.id}</code>
          </div>
        </div>

        {/* Goals */}
        {persona.goals && persona.goals.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Goals</h3>
            </div>
            <ul className="p-4 space-y-1">
              {persona.goals.map((goal, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">-</span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* System Prompt */}
        {persona.prompt_system_template && persona.prompt_system_template.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Prompt</h3>
            </div>
            <pre className="p-4 text-sm text-slate-700 bg-white whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
              {persona.prompt_system_template.join('\n')}
            </pre>
          </div>
        )}

        {/* Tools */}
        {persona.tools && persona.tools.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tools</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {persona.tools.map((tool) => (
                <span key={tool} className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-1 font-mono">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LLM Config */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">LLM Configuration</h3>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center px-4 py-2.5 text-sm">
              <span className="text-slate-500 w-40">Provider</span>
              <span className="text-slate-700 font-medium">{persona.llm_provider}</span>
            </div>
            {persona.llm_temperature != null && (
              <div className="flex items-center px-4 py-2.5 text-sm">
                <span className="text-slate-500 w-40">Temperature</span>
                <span className="text-slate-700 font-medium">{persona.llm_temperature}</span>
              </div>
            )}
            {persona.version && (
              <div className="flex items-center px-4 py-2.5 text-sm">
                <span className="text-slate-500 w-40">Version</span>
                <span className="text-slate-700 font-medium">{persona.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-700">Select a persona</h2>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">
        Choose a persona from the sidebar to view its details.
      </p>
    </div>
  );
}

function AppContent() {
  const { data: personas, isLoading, error } = usePersonas();
  const [route, setRoute] = useState(parseRoute);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      (personas ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.llm_provider,
        tags: [p.role, p.tone].filter(Boolean) as string[],
      })),
    [personas],
  );

  const handleItemSelect = useCallback((item: SidebarItem) => {
    window.history.pushState(null, '', `${BASE}/${item.id}`);
    setRoute({ personaId: String(item.id), editing: false, special: null });
  }, []);

  // Special pages render without sidebar
  if (route.special === 'new') return <PersonaCreatePage />;
  if (route.special === 'llm-default-new') return <LLMDefaultCreatePage />;
  if (route.editing && route.personaId) return <PersonaEditPage personaId={route.personaId} />;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
        <PanelLeftSidebarMenu002
          title="Personas"
          filterSections={[]}
          items={sidebarItems}
          searchPlaceholder="Search personas..."
          onItemSelect={handleItemSelect}
          header={<></>}
          hideListHeader
          className="rounded-none shadow-none border-0"
        />
      </aside>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-slate-400">Loading personas...</div>
          </div>
        )}
        {error && (
          <div className="p-4 mx-8 mt-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            Failed to load personas
          </div>
        )}
        {!isLoading && !error && (
          route.personaId ? <PersonaDetail personaId={route.personaId} /> : <EmptyState />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <AppContent />
      </AppShell>
    </QueryClientProvider>
  );
}
