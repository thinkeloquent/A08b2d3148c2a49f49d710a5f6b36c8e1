import { useState, useMemo } from 'react';
import { Upload, Loader2, Trash2, ChevronDown } from 'lucide-react';
import Select from 'react-select';
import {
  useDatasource,
  useInstances,
  useDeleteInstance,
  useUpdateDatasource,
  useDatasourceCategories,
} from '../hooks/queries';
import { StatusBadge } from '../components/StatusBadge';
import { TagBadge } from '../components/TagBadge';
import { Pagination } from '../components/Pagination';
import type { DatasourceStatus } from '../types';

const STATUS_OPTIONS: DatasourceStatus[] = ['active', 'archived', 'deprecated'];

interface CategoryOpt {
  value: string;
  label: string;
}

/** Static resource-level presets for csv-datasource-hub */
const STATIC_PRESETS: CategoryOpt[] = [
  { value: 'infosec', label: 'Infosec' },
  { value: 'vulnerability', label: 'Vulnerability' },
  { value: 'dependency', label: 'Dependency' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'performance', label: 'Performance' },
];

interface Props {
  datasourceId: string;
  onBack: () => void;
  onSelectInstance: (id: string) => void;
  onUpload: (datasourceId: string) => void;
}

export function DatasourceDetailPage({ datasourceId, onBack: _onBack, onSelectInstance, onUpload }: Props) {
  const { data: ds, isLoading } = useDatasource(datasourceId);
  const [page, setPage] = useState(1);
  const { data: instances } = useInstances(datasourceId, { page: String(page), limit: '20' });
  const deleteMutation = useDeleteInstance();
  const updateMutation = useUpdateDatasource();
  const { data: catData } = useDatasourceCategories();

  /** Merge static presets with actual DB categories (deduped) */
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: CategoryOpt[] = [];
    for (const opt of STATIC_PRESETS) {
      seen.add(opt.value.toLowerCase());
      result.push(opt);
    }
    if (catData?.categories) {
      for (const cat of catData.categories) {
        if (!seen.has(cat.toLowerCase())) {
          seen.add(cat.toLowerCase());
          result.push({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) });
        }
      }
    }
    return result;
  }, [catData]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  if (!ds) return <p className="text-center text-slate-500 py-8">Datasource not found.</p>;

  const handleStatusChange = (status: DatasourceStatus) => {
    updateMutation.mutate({ id: datasourceId, data: { status } });
  };

  const handleCategoryChange = (selected: readonly CategoryOpt[]) => {
    const category = selected.map((o) => o.value).join(',');
    updateMutation.mutate({ id: datasourceId, data: { category } });
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-800">{ds.name}</h1>

          {/* Editable status dropdown */}
          <div className="relative">
            <select
              value={ds.status}
              onChange={(e) => handleStatusChange(e.target.value as DatasourceStatus)}
              className="appearance-none bg-transparent text-xs font-medium px-2 py-1 pr-6 rounded border border-slate-200 hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-300"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>

        {/* Editable category multi-select */}
        <div className="mb-3 max-w-md">
          <Select<CategoryOpt, true>
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter((o) =>
              ds.category.split(',').map((c) => c.trim().toLowerCase()).includes(o.value.toLowerCase()),
            )}
            onChange={(selected) => handleCategoryChange(selected)}
            placeholder="Select categories…"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({ ...base, minHeight: 36, fontSize: '0.875rem' }),
              multiValue: (base) => ({ ...base, backgroundColor: '#e0e7ff', borderRadius: 4 }),
              multiValueLabel: (base) => ({ ...base, color: '#4338ca', fontSize: '0.75rem', fontWeight: 500 }),
              multiValueRemove: (base) => ({ ...base, color: '#6366f1', ':hover': { backgroundColor: '#c7d2fe', color: '#4338ca' } }),
            }}
          />
        </div>

        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const text = e.currentTarget.textContent?.trim() ?? '';
            if (text !== (ds.description ?? '')) {
              updateMutation.mutate({ id: datasourceId, data: { description: text || null } });
            }
          }}
          className="text-slate-600 mb-3 outline-none rounded px-1 -mx-1 hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-300 empty:before:content-['Add_description…'] empty:before:text-slate-300"
        >
          {ds.description}
        </p>
        <div className="flex gap-1 mb-3">
          {ds.tags?.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
        {ds.labels && ds.labels.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ds.labels.map((label) => (
              <span key={label.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                <span className="font-medium">{label.key}:</span> {label.value}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Instances</h2>
        <button
          onClick={() => onUpload(datasourceId)}
          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
        >
          <Upload className="w-4 h-4" /> Upload CSV
        </button>
      </div>

      <div className="space-y-2">
        {instances?.items.map((inst) => (
          <div
            key={inst.id}
            onClick={() => onSelectInstance(inst.id)}
            className="bg-white rounded-lg border p-4 hover:border-indigo-300 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{inst.label}</span>
                <span className="text-xs text-slate-400 font-mono">{inst.id}</span>
                <StatusBadge status={inst.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {inst.file_name} &middot; {inst.row_count} rows
                {inst.instance_date && <> &middot; {inst.instance_date}</>}
                {inst.created_at && <> &middot; Created {new Date(inst.created_at).toLocaleDateString()}</>}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(inst.id); }}
              className="text-slate-400 hover:text-red-500 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {instances?.items.length === 0 && (
          <p className="text-center text-slate-500 py-6">No instances yet. Upload a CSV to get started.</p>
        )}
      </div>
      {instances && <Pagination page={instances.page} totalPages={instances.totalPages} onPageChange={setPage} />}
    </div>
  );
}
