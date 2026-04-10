import { memo, useState } from 'react';
import { Plus, Layers, Download, Upload, RotateCcw } from 'lucide-react';
import { FilterGroup } from './FilterGroup';
import type { FilterTree, FilterTreeNode, GroupNode } from '@/types';
import { sampleFilters, emptyFilters } from '@/data/sample-filters';

interface FilterBuilderProps {
  initialFilters?: FilterTree;
}

function FilterBuilderComponent({ initialFilters = sampleFilters }: FilterBuilderProps) {
  const [filters, setFilters] = useState<FilterTree>(initialFilters);

  const handleUpdate = (updatedGroup: GroupNode) => {
    setFilters(updatedGroup as FilterTree);
  };

  const handleAddRootFilter = () => {
    const newFilter: FilterTreeNode = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      text: 'New filter condition - double click to edit',
    };
    setFilters({
      ...filters,
      children: [...filters.children, newFilter],
    });
  };

  const handleAddRootGroup = () => {
    const newGroup: FilterTreeNode = {
      id: `group-${Date.now()}`,
      type: 'group',
      operator: 'AND',
      children: [],
    };
    setFilters({
      ...filters,
      children: [...filters.children, newGroup],
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filter-conditions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const data = JSON.parse(text) as FilterTree;
          setFilters(data);
        } catch {
          console.error('Invalid JSON file');
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    setFilters(emptyFilters);
  };

  const handleLoadSample = () => {
    setFilters(sampleFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6 font-sans">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Conditions</h1>
            <p className="text-sm font-semibold text-sky-600 uppercase tracking-wider mt-2">
              Inclusion Filters
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Load Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
              Sample
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Import"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Export"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Main filter area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-6 pl-20">
          <FilterGroup group={filters} onUpdate={handleUpdate} />
        </div>

        {/* Bottom action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleAddRootFilter}
            className="flex items-center gap-2 px-5 py-2.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-all hover:bg-sky-50 rounded-xl border border-transparent hover:border-sky-200"
          >
            <Plus className="w-4 h-4" />
            Add filter
          </button>
          <button
            onClick={handleAddRootGroup}
            className="flex items-center gap-2 px-5 py-2.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-all bg-sky-50 rounded-xl border border-sky-200 hover:bg-sky-100"
          >
            <Layers className="w-4 h-4" />
            Add group
          </button>
        </div>

        {/* Info card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-amber-50 rounded-xl border border-sky-100">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Pro tip:</span> Click on
            <span className="mx-1 px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-semibold">
              AND
            </span>
            or
            <span className="mx-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
              OR
            </span>
            badges to change the logical operator. Hover over filters to delete them.
            Double-click a filter to edit its text.
          </p>
        </div>
      </div>
    </div>
  );
}

export const FilterBuilder = memo(FilterBuilderComponent);
