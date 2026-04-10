import { useState, useMemo } from 'react';
import { Plus, Database, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { ApiCategorySelect } from '@internal/dropdown-categories';
import type { CategoryOption } from '@internal/dropdown-categories';
import {
  useDatasources,
  useCreateDatasource,
  useUpdateDatasource,
  useDeleteDatasource,
  useDatasourceCategories,
} from '../hooks/queries';
import { CategoryBadge } from '../components/CategoryBadge';
import { TagBadge } from '../components/TagBadge';
import { Pagination } from '../components/Pagination';
import type { DatasourceStatus } from '../types';

/** Static resource-level presets for csv-datasource-hub */
const STATIC_PRESETS: CategoryOption[] = [
  { value: 'infosec', label: 'Infosec', source: 'resource' },
  { value: 'vulnerability', label: 'Vulnerability', source: 'resource' },
  { value: 'dependency', label: 'Dependency', source: 'resource' },
  { value: 'compliance', label: 'Compliance', source: 'resource' },
  { value: 'performance', label: 'Performance', source: 'resource' },
];

const STATUS_OPTIONS: DatasourceStatus[] = ['active', 'archived', 'deprecated'];

interface Props {
  onSelect: (id: string) => void;
}

export function DatasourceListPage({ onSelect }: Props) {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (categoryFilter) params.category = categoryFilter;

  const { data, isLoading } = useDatasources(params);
  const { data: catData } = useDatasourceCategories();
  const createMutation = useCreateDatasource();
  const updateMutation = useUpdateDatasource();
  const deleteMutation = useDeleteDatasource();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('infosec');
  const [newDescription, setNewDescription] = useState('');

  /** Merge static presets with actual DB categories (deduped, case-insensitive) */
  const resourceCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: CategoryOption[] = [];
    for (const opt of STATIC_PRESETS) {
      seen.add(opt.value.toLowerCase());
      result.push(opt);
    }
    if (catData?.categories) {
      for (const cat of catData.categories) {
        if (!seen.has(cat.toLowerCase())) {
          seen.add(cat.toLowerCase());
          result.push({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1), source: 'resource' });
        }
      }
    }
    return result;
  }, [catData]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({
      name: newName,
      category: newCategory,
      description: newDescription || undefined,
    });
    setNewName('');
    setNewDescription('');
    setShowCreate(false);
  };

  const handleStatusChange = (id: string, status: DatasourceStatus) => {
    updateMutation.mutate({ id, data: { status } });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this datasource permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Datasources</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
        >
          <Plus className="w-4 h-4" /> New Datasource
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="grid gap-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full text-sm"
                  placeholder="e.g., Q1 Vulnerability Scan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <ApiCategorySelect
                  value={newCategory}
                  onChange={setNewCategory}
                  targetApp="csv-datasource-hub"
                  resourceCategories={resourceCategories}
                  validationMode="flexible"
                  className="min-w-[180px] text-sm"
                  placeholder="Select or type category…"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm"
                placeholder="Brief description of this datasource…"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newName.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {!showCreate && (
        <div className="flex gap-2 mb-4">
          <ApiCategorySelect
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1); }}
            allOption={{ value: '', label: 'All categories' }}
            targetApp="csv-datasource-hub"
            resourceCategories={resourceCategories}
            validationMode="flexible"
            className="min-w-[180px] text-sm"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div className="grid gap-3">
            {data?.items.map((ds) => (
              <div
                key={ds.id}
                onClick={() => onSelect(ds.id)}
                className="bg-white rounded-lg border p-4 hover:border-indigo-300 cursor-pointer transition-colors"
              >
                {/* Top row: icon + name + right actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-800">{ds.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Status dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ds.status}
                        onChange={(e) => handleStatusChange(ds.id, e.target.value as DatasourceStatus)}
                        className="appearance-none bg-transparent text-xs font-medium px-2 py-1 pr-5 rounded border border-slate-200 hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-300"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, ds.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {ds.description && (
                  <p className="text-sm text-slate-500 mt-1 ml-7">{ds.description}</p>
                )}

                {/* Bottom row: category badge + tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 ml-7">
                  <CategoryBadge category={ds.category} />
                  {ds.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                </div>
              </div>
            ))}
            {data?.items.length === 0 && (
              <p className="text-center text-slate-500 py-8">No datasources found.</p>
            )}
          </div>
          {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
        </>
      )}
    </div>
  );
}
