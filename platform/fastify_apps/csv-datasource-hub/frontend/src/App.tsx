import { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Database, Trash2, Loader2, Search } from 'lucide-react';
import { PanelItemListing, PanelListItem } from '@internal/panel-item-listing';
import type { FilterOption } from '@internal/panel-item-listing';
import { AppShell } from './layout/AppShell';
import { DatasourceDetailPage } from './pages/DatasourceDetailPage';
import { UploadPage } from './pages/UploadPage';
import { InstanceDetailPage } from './pages/InstanceDetailPage';
import {
  useDatasources,
  useDeleteDatasource,
  useDatasourceCategories,
} from './hooks/queries';
import { CategoryBadge } from './components/CategoryBadge';
import type { CsvDatasource } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type View =
  | { page: 'list' }
  | { page: 'detail'; datasourceId: string }
  | { page: 'upload'; datasourceId: string }
  | { page: 'instance'; instanceId: string; datasourceId: string; tab?: string };

const BASE = '/apps/csv-datasource-hub';

function parseView(pathname: string): View {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const clean = rel.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/').filter(Boolean);

  // /datasource/:id/upload
  if (parts[0] === 'datasource' && parts[1] && parts[2] === 'upload') {
    return { page: 'upload', datasourceId: parts[1] };
  }
  // /datasource/:dsId/instance/:instId[/:tab]
  if (parts[0] === 'datasource' && parts[1] && parts[2] === 'instance' && parts[3]) {
    return { page: 'instance', instanceId: parts[3], datasourceId: parts[1], tab: parts[4] || undefined };
  }
  // /datasource/:id
  if (parts[0] === 'datasource' && parts[1]) {
    return { page: 'detail', datasourceId: parts[1] };
  }
  return { page: 'list' };
}

function viewToPath(view: View): string {
  switch (view.page) {
    case 'detail':  return `${BASE}/datasource/${view.datasourceId}`;
    case 'upload':  return `${BASE}/datasource/${view.datasourceId}/upload`;
    case 'instance': return `${BASE}/datasource/${view.datasourceId}/instance/${view.instanceId}${view.tab ? `/${view.tab}` : ''}`;
    default:        return `${BASE}`;
  }
}

function getSelectedDatasourceId(view: View): string | undefined {
  if (view.page === 'detail' || view.page === 'upload' || view.page === 'instance') {
    return view.datasourceId;
  }
  return undefined;
}

function AppContent() {
  const [view, _setView] = useState<View>(() => parseView(window.location.pathname));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const onPop = () => _setView(parseView(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setView = useCallback((v: View) => {
    _setView(v);
    const path = viewToPath(v);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  const params: Record<string, string> = { page: '1', limit: '100' };
  if (categoryFilter) params.category = categoryFilter;

  const { data, isLoading, error } = useDatasources(params);
  const { data: catData } = useDatasourceCategories();
  const deleteMutation = useDeleteDatasource();

  const selectedId = getSelectedDatasourceId(view);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery) return data.items;
    const q = searchQuery.toLowerCase();
    return data.items.filter(
      (ds) =>
        ds.name.toLowerCase().includes(q) ||
        ds.category.toLowerCase().includes(q) ||
        (ds.description && ds.description.toLowerCase().includes(q)),
    );
  }, [data?.items, searchQuery]);

  // Build filter options from categories
  const filterOptions = useMemo<FilterOption[]>(() => {
    const opts: FilterOption[] = [{ value: '', label: 'All categories' }];
    const cats = catData?.categories ?? [];
    for (const cat of cats) {
      opts.push({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) });
    }
    return opts;
  }, [catData]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this datasource permanently?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (selectedId === id) setView({ page: 'list' });
        },
      });
    }
  };

  return (
    <AppShell>
      <PanelItemListing<CsvDatasource>
        title="Datasources"
        items={filteredItems}
        getItemKey={(ds) => ds.id}
        selectedKey={selectedId}
        onItemSelect={(ds) => setView({ page: 'detail', datasourceId: ds.id })}
        searchPlaceholder="Search datasources..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchIcon={<Search className="w-4 h-4" />}
        filterOptions={filterOptions}
        filterValue={categoryFilter}
        onFilterChange={(v) => setCategoryFilter(v)}
        isLoading={isLoading}
        error={error ? { message: error.message } : null}
        totalCount={data?.total}
        itemLabel="datasources"
        loadingElement={<Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        className="min-h-screen"
        panelWidth="w-80"
        panelMinWidth="min-w-80"
        panelMaxWidth="max-w-80"
        contentClassName="bg-slate-50"
        renderItem={(ds, isSelected) => (
          <div className="flex items-center">
            <div className="flex-1 min-w-0">
              <PanelListItem
                title={ds.name}
                subtitle={ds.description ?? undefined}
                isSelected={isSelected}
                icon={<Database className="w-4 h-4 text-slate-400" />}
                badge={<CategoryBadge category={ds.category} />}
              />
            </div>
            <button
              onClick={(e) => handleDelete(e, ds.id)}
              className="flex-shrink-0 mr-3 p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      >
        {/* Content area */}
        {view.page === 'list' && (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a datasource to view details</p>
            </div>
          </div>
        )}
        {view.page === 'detail' && (
          <DatasourceDetailPage
            datasourceId={view.datasourceId}
            onBack={() => setView({ page: 'list' })}
            onSelectInstance={(id) => setView({ page: 'instance', instanceId: id, datasourceId: view.datasourceId })}
            onUpload={(dsId) => setView({ page: 'upload', datasourceId: dsId })}
          />
        )}
        {view.page === 'upload' && (
          <UploadPage
            datasourceId={view.datasourceId}
            onBack={() => setView({ page: 'detail', datasourceId: view.datasourceId })}
            onSuccess={(instId) => setView({ page: 'instance', instanceId: instId, datasourceId: view.datasourceId })}
          />
        )}
        {view.page === 'instance' && (
          <InstanceDetailPage
            instanceId={view.instanceId}
            tab={view.tab}
            onTabChange={(tab) => setView({ ...view, tab })}
            onBack={() => setView({ page: 'detail', datasourceId: view.datasourceId })}
          />
        )}
      </PanelItemListing>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
