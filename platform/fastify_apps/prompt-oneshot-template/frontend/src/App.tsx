import { useState, useEffect, useCallback, useMemo } from 'react';
import { AiopsPromptOneshotTemplate } from '@internal/aiops-prompt-oneshot-template';
import { PanelLeftSidebarMenu002 } from '@internal/panel-left-sidebar-menu-002';
import type { SidebarItem } from '@internal/panel-left-sidebar-menu-002';
import { AppShell } from './layout/AppShell';
import { fetchTemplates, fetchTemplate, fetchCategories } from './services/api';
import type { TemplateSummary, DocumentTemplate } from './services/api';

const BASE_PATH = '/apps/prompt-oneshot-template';

function parseRoute(): { templateId: string | null; editing: boolean } {
  const path = window.location.pathname;
  if (!path.startsWith(BASE_PATH)) return { templateId: null, editing: false };
  const rest = path.slice(BASE_PATH.length).replace(/^\//, '');
  if (!rest) return { templateId: null, editing: false };
  const segments = rest.split('/');
  const templateId = segments[0] || null;
  const editing = segments[1] === 'edit';
  return { templateId, editing };
}

function App() {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load a template by id and optionally enter edit mode
  const loadTemplate = useCallback(async (id: string, edit: boolean) => {
    try {
      const tmpl = await fetchTemplate(id);
      setSelectedTemplate(tmpl);
      setEditing(edit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    }
  }, []);

  // Initial data load + restore state from URL
  useEffect(() => {
    Promise.all([fetchTemplates(), fetchCategories()])
      .then(([templatesRes]) => {
        setTemplates(templatesRes.templates);
        setLoading(false);

        const route = parseRoute();
        if (route.templateId) {
          loadTemplate(route.templateId, route.editing);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const route = parseRoute();
      if (!route.templateId) {
        setSelectedTemplate(null);
        setEditing(false);
      } else {
        loadTemplate(route.templateId, route.editing);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [loadTemplate]);

  const handlePreviewTemplate = useCallback(
    async (id: string) => {
      window.history.pushState(null, '', `${BASE_PATH}/${id}`);
      await loadTemplate(id, false);
    },
    [loadTemplate],
  );

  const handleEditTemplate = useCallback(() => {
    if (selectedTemplate) {
      window.history.pushState(null, '', `${BASE_PATH}/${selectedTemplate.id}/edit`);
      setEditing(true);
    }
  }, [selectedTemplate]);

  const handleBackFromEdit = useCallback(() => {
    if (selectedTemplate) {
      window.history.pushState(null, '', `${BASE_PATH}/${selectedTemplate.id}`);
    }
    setEditing(false);
  }, [selectedTemplate]);

  const handleSave = useCallback((template: string, data: Record<string, string>, version: string) => {
    console.info('[prompt-oneshot-template] Save:', { template: template.substring(0, 100) + '...', variableCount: Object.keys(data).length, version });
  }, []);

  // Map TemplateSummary → SidebarItem
  const sidebarItems: SidebarItem[] = useMemo(
    () =>
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        tags: [t.version],
      })),
    [templates],
  );

  const handleSidebarItemSelect = useCallback(
    (item: SidebarItem) => {
      handlePreviewTemplate(String(item.id));
    },
    [handlePreviewTemplate],
  );

  // Template editor view
  if (editing && selectedTemplate) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200">
            <button
              onClick={handleBackFromEdit}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Back to Templates
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">{selectedTemplate.name}</span>
            <span className="ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">
              {selectedTemplate.category}
            </span>
          </div>
          <AiopsPromptOneshotTemplate
            defaultTemplate={selectedTemplate.template}
            defaultMockData={selectedTemplate.mockData}
            defaultTemplateName={selectedTemplate.templateName}
            defaultVersion={selectedTemplate.version}
            onSave={handleSave}
          />
        </div>
      </AppShell>
    );
  }

  // Template picker + preview view
  return (
    <AppShell>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        <aside className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white overflow-y-auto">
          <PanelLeftSidebarMenu002
            title="Templates"
            filterSections={[]}
            items={sidebarItems}
            searchPlaceholder="Search templates..."
            onItemSelect={handleSidebarItemSelect}
            header={<></>}
            hideListHeader
            className="rounded-none shadow-none border-0"
          />
        </aside>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-400">Loading templates...</div>
            </div>
          )}

          {error && (
            <div className="p-4 mx-8 mt-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && !selectedTemplate && (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-700">Select a template</h2>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Choose a document template from the sidebar to view its details.
              </p>
            </div>
          )}

          {!loading && !error && selectedTemplate && (
            <div className="px-8 py-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-800">{selectedTemplate.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                      {selectedTemplate.category}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">
                      {selectedTemplate.version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEditTemplate}
                  className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Edit Template
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-6">{selectedTemplate.description}</p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Template Preview</h3>
                </div>
                <pre className="p-4 text-sm text-slate-700 bg-white overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {selectedTemplate.template}
                </pre>
              </div>

              {Object.keys(selectedTemplate.mockData).length > 0 && (
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Variables</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {Object.entries(selectedTemplate.mockData).map(([key, value]) => (
                      <div key={key} className="flex items-start px-4 py-2.5 text-sm">
                        <span className="font-mono text-indigo-600 shrink-0 w-48 truncate">{`{{${key}}}`}</span>
                        <span className="text-slate-500 truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default App;
