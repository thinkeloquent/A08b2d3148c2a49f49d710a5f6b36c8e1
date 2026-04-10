import { useRef, useMemo, useCallback, useState } from 'react';
import { Upload, X, FileJson } from 'lucide-react';
import { RuleTreeTable } from '../components/rule-tree';
import { StatisticsCards } from '../components/stats';
import { useRuleItems } from '../hooks/useRuleItems';
import { useExportImport } from '../hooks/useExportImport';
import { countRules } from '../utils/tree-helpers';
import type { RuleGroup, RuleItem } from '../types/rule.types';

export function ImportPreviewPage() {
  const { importRules } = useExportImport();
  const { rules, setRules, toggleExpand } = useRuleItems();
  const [loaded, setLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    if (!loaded) return null;
    const s = countRules(rules);
    return {
      total: s.conditions,
      active: s.enabled - 1,
      groups: s.groups,
      folders: s.folders,
      conditions: s.conditions,
    };
  }, [rules, loaded]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setError('');
      const imported = await importRules(event);
      if (imported) {
        setRules(imported);
        setFileName(event.target.files?.[0]?.name ?? '');
        setLoaded(true);
      } else {
        setError('Invalid JSON file. Please upload a valid rule tree export.');
      }
    },
    [importRules, setRules],
  );

  const handleClear = useCallback(() => {
    setLoaded(false);
    setFileName('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const noopId = useCallback((_id: string) => {}, []);
  const noopItem = useCallback((_item: RuleItem) => {}, []);
  const noopRules = useCallback((_rules: RuleGroup) => {}, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Import Preview</h1>
        <p className="text-slate-500 text-sm">
          Upload an exported rule tree JSON file to preview its contents.
        </p>
      </div>

      {/* Upload area */}
      {!loaded && (
        <div className="card p-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-12 cursor-pointer hover:border-accent-400 hover:bg-accent-50/30 transition-colors">
            <Upload className="w-10 h-10 text-slate-300 mb-3" />
            <span className="text-sm font-medium text-slate-600">
              Click to browse or drag &amp; drop a <code className="text-accent-600">.json</code> file
            </span>
            <span className="text-xs text-slate-400 mt-1">Rule tree export files only</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Preview */}
      {loaded && stats && (
        <>
          {/* File info + Clear */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-accent-500" />
                <div>
                  <p className="font-medium text-slate-800">{rules.name || 'Imported Tree'}</p>
                  {fileName && (
                    <p className="text-xs text-slate-400">From {fileName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClear}
                className="btn-secondary text-sm py-1.5"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>

            <StatisticsCards
              totalRules={stats.total}
              activeRules={stats.active}
              groupCount={stats.groups}
              folderCount={stats.folders}
              conditionCount={stats.conditions}
            />
          </div>

          {/* Read-only rule tree */}
          <RuleTreeTable
            rules={rules}
            onUpdate={noopRules}
            onDelete={noopId}
            onAddCondition={noopId}
            onAddGroup={noopId}
            onAddFolder={noopId}
            onToggleExpand={toggleExpand}
            onDuplicate={noopItem}
          />
        </>
      )}
    </div>
  );
}
