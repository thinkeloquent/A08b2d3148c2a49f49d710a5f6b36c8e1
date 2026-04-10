import { memo } from 'react';
import { SortableTree, TreeItems } from 'dnd-kit-sortable-tree';
import { Type, ChevronDown, Download, Upload, Layers, Save, Check, Loader2, Trash2 } from 'lucide-react';
import { TreeItem } from './TreeItem';
import type { TreeItemData } from '@/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SortableFilterTreeProps {
  items: TreeItems<TreeItemData>;
  onItemsChanged: (items: TreeItems<TreeItemData>) => void;
  onSave: () => void;
  onReset: () => void;
  saveStatus: SaveStatus;
  saveError: string | null;
  hasUnsavedChanges: boolean;
  savedTreeId: string | null;
}

function SortableFilterTreeComponent({
  items,
  onItemsChanged,
  onSave,
  onReset,
  saveStatus,
  saveError,
  hasUnsavedChanges,
}: SortableFilterTreeProps) {
  const handleAddTextInput = () => {
    const newFilter: TreeItemData & { id: string } = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      text: 'New filter condition - double click to edit',
    };
    onItemsChanged([...items, newFilter]);
  };

  const handleAddDropdown = () => {
    const newFilter: TreeItemData & { id: string } = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      condition: { field: '', operator: 'equals', value: '' },
    };
    onItemsChanged([...items, newFilter]);
  };

  const handleAddGroup = () => {
    const newGroup: TreeItemData & { id: string; children: TreeItems<TreeItemData> } = {
      id: `group-${Date.now()}`,
      type: 'group',
      operator: 'AND',
      canHaveChildren: true,
      children: [],
    };
    onItemsChanged([...items, newGroup]);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
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
          const data = JSON.parse(text) as TreeItems<TreeItemData>;
          onItemsChanged(data);
        } catch {
          console.error('Invalid JSON file');
        }
      }
    };
    input.click();
  };

  return (
    <div className="relative flex-1 min-w-0">
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
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset"
          >
            <Trash2 className="w-4 h-4" />
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
          <button
            onClick={onSave}
            disabled={saveStatus === 'saving'}
            className={`
              flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all
              ${saveStatus === 'saved'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : saveStatus === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                  : saveStatus === 'saving'
                    ? 'bg-sky-50 text-sky-500 border border-sky-200 cursor-wait'
                    : hasUnsavedChanges
                      ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm'
                      : 'bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100'
              }
            `}
            title={saveError || 'Save to server'}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Retry' : 'Save'}
          </button>
        </div>
      </div>

      {/* Save error banner */}
      {saveStatus === 'error' && saveError && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Main tree area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl p-6">
        <SortableTree
          items={items}
          onItemsChanged={onItemsChanged}
          TreeItemComponent={TreeItem}
          indentationWidth={40}
        />

        {items.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p>No filters yet. Add a filter or group to get started.</p>
          </div>
        )}
      </div>

      {/* Bottom action buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handleAddTextInput}
          className="flex items-center gap-2 px-5 py-2.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-all hover:bg-sky-50 rounded-xl border border-transparent hover:border-sky-200"
        >
          <Type className="w-4 h-4" />
          Add text input
        </button>
        <button
          onClick={handleAddDropdown}
          className="flex items-center gap-2 px-5 py-2.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-all hover:bg-sky-50 rounded-xl border border-transparent hover:border-sky-200"
        >
          <ChevronDown className="w-4 h-4" />
          Add dropdown
        </button>
        <button
          onClick={handleAddGroup}
          className="flex items-center gap-2 px-5 py-2.5 text-sky-600 hover:text-sky-700 text-sm font-medium transition-all bg-sky-50 rounded-xl border border-sky-200 hover:bg-sky-100"
        >
          <Layers className="w-4 h-4" />
          Add group
        </button>
      </div>

      {/* Info card */}
      <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-amber-50 rounded-xl border border-sky-100">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Pro tip:</span> Drag items to reorder.
          Click on
          <span className="mx-1 px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-semibold">
            AND
          </span>
          or
          <span className="mx-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
            OR
          </span>
          badges to change the logical operator. Double-click a filter to edit its text.
        </p>
      </div>
    </div>
  );
}

export const SortableFilterTree = memo(SortableFilterTreeComponent);
