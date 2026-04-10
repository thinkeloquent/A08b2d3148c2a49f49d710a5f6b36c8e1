import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Layers,
  AlertCircle,
  ArrowLeft,
  Edit,
  GitBranch,
  GitCommit,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { RuleTreeTable } from '../components/rule-tree';
import { StatisticsCards } from '../components/stats';
import { useToast } from '../components/feedback/Toast';
import { ExportModal } from '../components/feedback/ExportModal';
import { useRuleTree, useSaveRuleTree } from '../hooks/useRuleTrees';
import { useRuleItems } from '../hooks/useRuleItems';
import { countRules, normalizeApiTree } from '../utils/tree-helpers';
import type { RuleItem, RuleGroup, RuleCondition, GitMetadata } from '../types/rule.types';

/**
 * Build a map of id -> serialized snapshot (without children/expanded)
 * for every item in the tree.
 */
function buildSnapshotMap(node: RuleItem, map: Map<string, string> = new Map()): Map<string, string> {
  const { id, type, enabled, description } = node;
  let key: string;
  if (type === 'condition') {
    const c = node as RuleCondition;
    // Handle both camelCase and snake_case from API
    const raw = c as unknown as Record<string, unknown>;
    key = JSON.stringify({
      id, type, enabled, description,
      field: c.field,
      operator: c.operator,
      value: c.value,
      valueType: c.valueType ?? raw.value_type,
      dataType: c.dataType ?? raw.data_type,
    });
  } else {
    const g = node as RuleGroup;
    key = JSON.stringify({ id, type, enabled, description, name: g.name, logic: g.logic, color: g.color });
  }
  map.set(id, key);
  if ('conditions' in node && Array.isArray((node as RuleGroup).conditions)) {
    for (const child of (node as RuleGroup).conditions) {
      buildSnapshotMap(child, map);
    }
  }
  return map;
}

/** Returns a Set of item IDs that are new or modified compared to the saved snapshot. */
function computeChangedIds(saved: RuleGroup | undefined, current: RuleGroup): Set<string> {
  if (!saved) return new Set<string>();
  const savedMap = buildSnapshotMap(saved);
  const changed = new Set<string>();
  (function walk(node: RuleItem) {
    const savedSnap = savedMap.get(node.id);
    const currentSnap = buildSnapshotMap(node).get(node.id)!;
    if (!savedSnap || savedSnap !== currentSnap) {
      changed.add(node.id);
    }
    if ('conditions' in node && Array.isArray((node as RuleGroup).conditions)) {
      for (const child of (node as RuleGroup).conditions) walk(child);
    }
  })(current);
  return changed;
}

export function RuleTreeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data, isLoading } = useRuleTree(id);
  const saveRuleTree = useSaveRuleTree();
  const [exportOpen, setExportOpen] = useState(false);

  const {
    rules,
    setRules,
    addCondition,
    addGroup,
    addFolder,
    deleteRule,
    duplicateRule,
    toggleExpand,
    moveItem,
  } = useRuleItems();

  const tree = data?.tree;
  const savedRulesRef = useRef<RuleGroup | undefined>(undefined);

  // Sync rules from API when loaded
  // API returns rules as an array; extract the root group
  useEffect(() => {
    if (tree?.rules) {
      const rawRoot = Array.isArray(tree.rules) ? tree.rules[0] : tree.rules;
      if (rawRoot) {
        const root = normalizeApiTree(rawRoot) as RuleGroup;
        setRules(root);
        savedRulesRef.current = root;
      }
    }
  }, [tree, setRules]);

  // Compute changed (unsaved) item IDs
  const changedIds = useMemo(
    () => computeChangedIds(savedRulesRef.current, rules),
    [rules]
  );

  // Compute stats
  const stats = useMemo(() => {
    const s = countRules(rules);
    return {
      total: s.conditions,
      active: Math.max(0, s.enabled - 1), // subtract root group, floor at 0
      groups: s.groups,
      folders: s.folders,
      conditions: s.conditions,
    };
  }, [rules]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await saveRuleTree.mutateAsync({ id, data: { rules } });
      savedRulesRef.current = rules;
      addToast('success', 'Rules saved successfully!');
    } catch {
      addToast('error', 'Failed to save rules');
    }
  };

  const handleCancel = () => {
    if (tree?.rules) {
      const rawRoot = Array.isArray(tree.rules) ? tree.rules[0] : tree.rules;
      if (rawRoot) {
        const root = normalizeApiTree(rawRoot) as RuleGroup;
        setRules(root);
        savedRulesRef.current = root;
      }
      addToast('info', 'Changes reverted');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-1/3 mb-2" />
          <div className="h-4 bg-slate-50 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-base font-medium text-slate-600">Rule tree not found</p>
        <button
          onClick={() => navigate('/trees')}
          className="mt-4 text-accent-600 hover:text-accent-800 text-sm font-medium"
        >
          Back to Rule Trees
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate(`/trees/${id}/edit`)}
          className="btn-secondary"
        >
          <Edit className="w-4 h-4 shrink-0" />
          Edit Info
        </button>
        <button
          onClick={() => setExportOpen(true)}
          className="btn-secondary"
        >
          <Layers className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/trees')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{tree.name}</h1>
              <span
                className={`pill ${
                  tree.active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tree.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {tree.description && (
              <p className="text-slate-500 mt-1 text-sm">{tree.description}</p>
            )}
          </div>
        </div>

        {/* Git Metadata */}
        {(tree.repo_url || tree.branch || tree.commit_sha || tree.git_tag) && (
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs text-slate-500">
            {tree.repo_url && (
              <a
                href={tree.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-accent-600 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{tree.repo_url.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {tree.branch && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                <GitBranch className="w-3 h-3" />
                {tree.branch}
              </span>
            )}
            {tree.git_tag && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                <Tag className="w-3 h-3" />
                {tree.git_tag}
              </span>
            )}
            {tree.commit_sha && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-mono">
                <GitCommit className="w-3 h-3" />
                {tree.commit_sha.substring(0, 7)}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <StatisticsCards
          totalRules={stats.total}
          activeRules={stats.active}
          groupCount={stats.groups}
          folderCount={stats.folders}
          conditionCount={stats.conditions}
        />
      </div>

      {/* Rule Tree Table */}
      <RuleTreeTable
        rules={rules}
        onUpdate={setRules}
        onDelete={deleteRule}
        onAddCondition={addCondition}
        onAddGroup={addGroup}
        onAddFolder={addFolder}
        onToggleExpand={toggleExpand}
        onDuplicate={duplicateRule}
        onMoveItem={moveItem}
        changedIds={changedIds}
        git={{ repo_url: tree.repo_url, branch: tree.branch, commit_sha: tree.commit_sha, git_tag: tree.git_tag } as GitMetadata}
      />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {stats.conditions} conditions in {stats.groups} groups, {stats.folders} folders
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saveRuleTree.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${saveRuleTree.isPending ? 'animate-pulse' : ''}`} />
            {saveRuleTree.isPending ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
      </div>
    </div>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        rules={rules}
        baseFilename={tree.name.replace(/\s+/g, '-').toLowerCase()}
      />
    </>
  );
}
