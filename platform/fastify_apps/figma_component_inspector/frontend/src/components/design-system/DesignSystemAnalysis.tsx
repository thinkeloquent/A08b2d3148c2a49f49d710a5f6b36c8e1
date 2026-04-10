import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileJson, Link2, Layers3 } from 'lucide-react';
import { getFileSchema, type FileSchemaSummary } from '../../services/api';

interface DesignSystemAnalysisProps {
  fileId: string;
}

const NODE_TYPE_COLORS: Record<string, string> = {
  DOCUMENT: 'bg-slate-500',
  CANVAS: 'bg-slate-500',
  PAGE: 'bg-slate-500',
  FRAME: 'bg-slate-400',
  GROUP: 'bg-slate-400',
  COMPONENT: 'bg-purple-500',
  COMPONENT_SET: 'bg-purple-500',
  INSTANCE: 'bg-blue-500',
  TEXT: 'bg-green-500',
  VECTOR: 'bg-emerald-500',
};

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</div>
      <div className="mt-1.5 text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function DesignSystemAnalysis({ fileId }: DesignSystemAnalysisProps) {
  const [schema, setSchema] = useState<FileSchemaSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedNodeType, setExpandedNodeType] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!fileId) return;
      setLoading(true);
      setError('');
      try {
        const data = await getFileSchema(fileId);
        if (!active) return;
        setSchema(data);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Failed to load schema summary.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [fileId]);

  const coverageByType = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const row of schema?.propertyCoverage || []) {
      map.set(row.nodeType, row.properties || {});
    }
    return map;
  }, [schema]);

  const tokenByType = useMemo(() => {
    const map = new Map<string, FileSchemaSummary['tokenAdherence'][number]['categories']>();
    for (const row of schema?.tokenAdherence || []) {
      map.set(row.nodeType, row.categories || {});
    }
    return map;
  }, [schema]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-56 rounded bg-gray-200" />
          <div className="h-4 w-80 rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
        <div className="h-80 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const totals = schema?.totals || {
    nodes: 0,
    uniqueNodeTypes: 0,
    pages: 0,
    maxDepth: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">File JSON Schema</h2>
        <p className="text-[13px] text-gray-400">Schema census, depth map, token adherence, and component linkage signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard label="Total Nodes" value={totals.nodes.toLocaleString()} />
        <StatCard label="Node Types" value={totals.uniqueNodeTypes} />
        <StatCard label="Deepest Nesting" value={totals.maxDepth} />
        <StatCard label="Pages" value={totals.pages} />
      </div>

      <div className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layers3 className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">Node Type Census</h3>
        </div>
        <div className="space-y-2">
          {(schema?.census || []).map((row) => {
            const barPct = Math.max(2, Math.round(row.percentage));
            const isExpanded = expandedNodeType === row.nodeType;
            const coverage = coverageByType.get(row.nodeType) || {};
            const tokenCategories = tokenByType.get(row.nodeType) || {};
            const colorClass = NODE_TYPE_COLORS[row.nodeType] || 'bg-gray-400';

            return (
              <div key={row.nodeType} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 transition-colors hover:border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedNodeType(isExpanded ? null : row.nodeType)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span className="font-medium text-gray-800">{row.nodeType}</span>
                        <span>{row.count.toLocaleString()} ({row.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200/80 space-y-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">Property Coverage</div>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(coverage).length > 0 ? Object.entries(coverage).map(([key, value]) => (
                          <span key={key} className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200/80 text-gray-600 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                            {key}: {value.toFixed(1)}%
                          </span>
                        )) : (
                          <span className="text-xs text-gray-400">No tracked properties.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1.5">Token Adherence</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(tokenCategories).map(([category, score]) => (
                          <div key={category} className="rounded-lg border border-gray-200/80 bg-white p-2.5 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                            <div className="font-medium text-gray-800 capitalize">{category}</div>
                            <div className="text-gray-500 mt-0.5">Tokenized: {score.tokenizationPercent.toFixed(1)}%</div>
                            {score.hardCoded > 0 && (
                              <div className="mt-1.5 flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{score.hardCoded} hard-coded</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileJson className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">Depth Map</h3>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {(schema?.depthMap || []).map((page) => (
              <div key={page.pageId} className="rounded-lg border border-gray-100 p-2.5 text-xs">
                <div className="font-medium text-gray-800">{page.pageName}</div>
                <div className="text-gray-500 mt-1">
                  Nodes: {page.totalNodes.toLocaleString()} | Max: {page.maxDepth} | Avg: {page.avgDepth.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">Component Linkage</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-lg border border-gray-100 p-2.5">
              <div className="text-gray-400 text-[11px] uppercase tracking-wide font-medium">Masters</div>
              <div className="text-base font-semibold text-gray-900 mt-0.5">{schema?.linkage?.masters ?? 0}</div>
            </div>
            <div className="rounded-lg border border-gray-100 p-2.5">
              <div className="text-gray-400 text-[11px] uppercase tracking-wide font-medium">Instances</div>
              <div className="text-base font-semibold text-gray-900 mt-0.5">{schema?.linkage?.instances ?? 0}</div>
            </div>
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-2.5">
              <div className="text-amber-600 text-[11px] uppercase tracking-wide font-medium">Suspected Detached</div>
              <div className="text-base font-semibold text-amber-800 mt-0.5">{schema?.linkage?.suspectedDetached ?? 0}</div>
            </div>
            <div className="rounded-lg border border-gray-100 p-2.5">
              <div className="text-gray-400 text-[11px] uppercase tracking-wide font-medium">Snowflakes</div>
              <div className="text-base font-semibold text-gray-900 mt-0.5">{schema?.linkage?.snowflakes ?? 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignSystemAnalysis;
