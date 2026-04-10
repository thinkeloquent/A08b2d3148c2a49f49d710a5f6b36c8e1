import { useState } from 'react';
import { useGraphStore } from '../store/useGraphStore.js';
import { resolveG11n, buildStageContext } from '../graph/g11n.js';

// ─── Sample CSV ──────────────────────────────────────────────────────────────
const SAMPLE_CSV = `package,severity,current_version,fixed_version,repository,file,cve
lodash,high,4.17.15,4.17.21,acme/web-app,package.json,CVE-2021-23337
express,medium,4.17.1,4.18.2,acme/api-server,package.json,CVE-2022-24999
axios,high,0.21.1,0.21.4,acme/web-app,package.json,CVE-2021-3749
minimist,critical,1.2.5,1.2.8,acme/cli-tools,package.json,CVE-2021-44906
node-fetch,medium,2.6.1,2.6.7,acme/api-server,package.json,CVE-2022-0235`;

// ─── Data Source Input Mode ──────────────────────────────────────────────────
function DataSourceInputPanel({ onSubmit, submitting, t, nodeDef }) {
  const [activeTab, setActiveTab] = useState('csv');
  const [csvText, setCsvText] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  const handleLoadSample = () => setCsvText(SAMPLE_CSV);

  const handleSubmit = () => {
    const value = activeTab === 'csv' ? csvText : apiUrl;
    onSubmit(value);
  };

  const inputTabs = [
    { id: 'csv', label: t('csvTabLabel') || 'Paste CSV' },
    { id: 'api', label: t('apiTabLabel') || 'API Endpoint' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-fuchsia-200 w-[680px] max-w-[90vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
          <span className="text-fuchsia-500 text-lg">{nodeDef?.data?.icon ?? '📋'}</span>
          <h3 className="text-sm font-semibold text-slate-800">{t('title')}</h3>
          <span className="ml-auto text-xs text-slate-400">{t('description')}</span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {inputTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-fuchsia-500 text-fuchsia-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">CSV Data</label>
                <button
                  onClick={handleLoadSample}
                  className="text-xs font-medium text-fuchsia-600 hover:text-fuchsia-700 px-2 py-1 rounded hover:bg-fuchsia-50 transition-colors"
                >
                  {t('sampleButton') || 'Load Sample CSV'}
                </button>
              </div>
              <textarea
                rows={10}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={t('csvPlaceholder') || 'Paste CSV data here...\nFirst row should be column headers.'}
                disabled={submitting}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono
                  placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 focus:bg-white"
              />
              {csvText && (
                <div className="text-[11px] text-slate-400">
                  {csvText.trim().split('\n').length - 1} data row(s) detected
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-600">API Endpoint URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={t('apiPlaceholder') || 'https://api.example.com/vulnerabilities'}
                disabled={submitting}
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm
                  placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">
                The API should return JSON with an array of vulnerability records.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleSubmit}
            disabled={submitting || (activeTab === 'csv' ? !csvText.trim() : !apiUrl.trim())}
            className="px-5 py-2 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? 'Loading...' : (t('submitButton') || 'Load Data')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Schema Mapping Mode ─────────────────────────────────────────────────────
function SchemaMappingPanel({ iterations, pausedAtStage, onSubmit, submitting, t, nodeDef }) {
  // Parse the dataset_preview JSON from the latest iteration for this stage
  const stageIterations = iterations.filter((it) => it.stage === pausedAtStage);
  const lastContent = stageIterations[stageIterations.length - 1]?.content ?? '';

  let headers = [];
  let rows = [];
  let schemaFields = [];
  let suggestedMapping = {};
  try {
    const parsed = JSON.parse(lastContent);
    if (parsed.type === 'dataset_preview') {
      headers = parsed.headers ?? [];
      rows = parsed.rows ?? [];
      schemaFields = parsed.schemaFields ?? [];
      suggestedMapping = parsed.suggestedMapping ?? {};
    }
  } catch { /* not JSON */ }

  // Initialize mapping state from suggested mapping
  const [mapping, setMapping] = useState(() => {
    const m = {};
    for (const field of schemaFields) {
      m[field] = suggestedMapping[field] ?? -1;
    }
    return m;
  });

  const handleFieldChange = (field, colIdx) => {
    setMapping((prev) => ({ ...prev, [field]: Number(colIdx) }));
  };

  const handleSubmit = () => {
    // Send mapping as JSON feedback
    const cleanMapping = {};
    for (const [field, idx] of Object.entries(mapping)) {
      if (idx >= 0) cleanMapping[field] = idx;
    }
    onSubmit(JSON.stringify({ mapping: cleanMapping }));
  };

  const previewRows = rows.slice(0, 5);
  const assignedCount = Object.values(mapping).filter((v) => v >= 0).length;

  const fieldLabels = {
    package: 'Package Name',
    severity: 'Severity',
    currentVersion: 'Current Version',
    fixedVersion: 'Fixed Version',
    repo: 'Repository',
    file: 'File Path',
    cve: 'CVE ID',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl border border-blue-200 w-[800px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
          <span className="text-blue-500 text-lg">{nodeDef?.data?.icon ?? '📥'}</span>
          <h3 className="text-sm font-semibold text-slate-800">{t('title')}</h3>
          <span className="ml-auto text-xs text-slate-400">
            {rows.length} row{rows.length !== 1 ? 's' : ''}, {headers.length} column{headers.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Field mapping */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">Column Mapping</h4>
            <div className="grid grid-cols-2 gap-2">
              {schemaFields.map((field) => {
                const required = ['package', 'currentVersion', 'fixedVersion', 'repo', 'file'].includes(field);
                return (
                  <div key={field} className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 w-28 shrink-0">
                      {fieldLabels[field] ?? field}
                      {required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <select
                      value={mapping[field] ?? -1}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className={`flex-1 text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        mapping[field] >= 0
                          ? 'bg-white border-blue-200 text-slate-800'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <option value={-1}>-- unmapped --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>
                          {h} (col {i + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {assignedCount}/{schemaFields.length} fields mapped
            </div>
          </div>

          {/* Data preview table */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-slate-700 mb-3">
              Data Preview {rows.length > 5 && <span className="text-slate-400 font-normal">(first 5 of {rows.length})</span>}
            </h4>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-3 py-2 text-left text-slate-500 font-medium w-8">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left text-slate-600 font-medium whitespace-nowrap">
                        {h}
                        {/* Show mapped-to badge */}
                        {Object.entries(mapping).find(([, idx]) => idx === i) && (
                          <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">
                            {Object.entries(mapping).find(([, idx]) => idx === i)?.[0]}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-3 py-1.5 text-slate-400">{ri + 1}</td>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-slate-700 whitespace-nowrap max-w-[200px] truncate">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <span className="text-[11px] text-slate-400">{t('description')}</span>
          <button
            onClick={handleSubmit}
            disabled={submitting || assignedCount === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? 'Applying...' : (t('submitButton') || 'Apply Mapping')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Presentation Mode (validation results / read-only) ──────────────────────
function PresentationPanel({ iterations, pausedAtStage, onContinue, submitting, t, nodeDef }) {
  const stageIterations = iterations.filter((it) => it.stage === pausedAtStage);
  const lastContent = stageIterations[stageIterations.length - 1]?.content ?? '';
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Try to parse as structured JSON (validation_results or update_summary)
  let validationData = null;
  let updateSummary = null;
  try {
    const parsed = JSON.parse(lastContent);
    if (parsed.type === 'validation_results') validationData = parsed;
    if (parsed.type === 'update_summary') updateSummary = parsed;
  } catch { /* not JSON */ }

  // Severity styling helper
  const sevStyle = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high':     return 'bg-red-50 text-red-600 border-red-200';
      case 'medium':   return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':      return 'bg-blue-50 text-blue-600 border-blue-200';
      default:         return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // If it's validation results, render structured view
  if (validationData) {
    const { valid, totalRows, validRows, errors, mappedData } = validationData;
    // Derive column keys from data
    const columns = mappedData?.length > 0
      ? Object.keys(mappedData[0]).filter((k) => mappedData.some((r) => r[k]))
      : [];
    const totalPages = mappedData ? Math.ceil(mappedData.length / PAGE_SIZE) : 0;
    const pageRows = mappedData?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];
    // Rows with errors (by 1-indexed row number)
    const errorRowSet = new Set(errors.map((e) => e.row));

    const columnLabels = {
      package: 'Package', severity: 'Severity', currentVersion: 'Current',
      fixedVersion: 'Fixed', repo: 'Repository', file: 'File', cve: 'CVE',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
        <div
          className={`bg-white rounded-xl shadow-xl border w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col ${
            valid ? 'border-green-200' : 'border-amber-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 shrink-0">
            <span className="text-lg">{nodeDef?.data?.icon ?? (valid ? '✅' : '⚠️')}</span>
            <h3 className="text-sm font-semibold text-slate-800">{t('title')}</h3>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
              valid
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {valid ? 'All valid' : `${errors.length} issue${errors.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 min-h-0">
            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                <div className="text-lg font-semibold text-slate-800">{totalRows}</div>
                <div className="text-[10px] text-slate-500">Total Rows</div>
              </div>
              <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <div className="text-lg font-semibold text-green-700">{validRows}</div>
                <div className="text-[10px] text-green-600">Valid</div>
              </div>
              {errors.length > 0 && (
                <div className="flex-1 rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                  <div className="text-lg font-semibold text-red-700">{totalRows - validRows}</div>
                  <div className="text-[10px] text-red-600">With Errors</div>
                </div>
              )}
            </div>

            {/* Errors list */}
            {errors.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Validation Errors</h4>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs">
                      <span className="font-mono text-red-400 shrink-0">Row {err.row}</span>
                      <span className="font-medium text-red-700 shrink-0">{err.field}</span>
                      <span className="text-red-600 truncate">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full mapped data table */}
            {mappedData?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-2">
                  Mapped Data <span className="text-slate-400 font-normal">({mappedData.length} row{mappedData.length !== 1 ? 's' : ''})</span>
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left text-slate-500 font-medium w-8">#</th>
                        {columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left text-slate-600 font-medium whitespace-nowrap">
                            {columnLabels[col] ?? col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, ri) => {
                        const rowNum = page * PAGE_SIZE + ri + 1;
                        const hasError = errorRowSet.has(rowNum);
                        return (
                          <tr
                            key={ri}
                            className={hasError ? 'bg-red-50/50' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                          >
                            <td className={`px-3 py-1.5 font-mono ${hasError ? 'text-red-400' : 'text-slate-400'}`}>
                              {rowNum}
                            </td>
                            {columns.map((col) => (
                              <td key={col} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate">
                                {col === 'severity' ? (
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sevStyle(row[col])}`}>
                                    {row[col] || '—'}
                                  </span>
                                ) : col === 'currentVersion' || col === 'fixedVersion' ? (
                                  <span className="font-mono text-slate-700">{row[col] || '—'}</span>
                                ) : col === 'repo' || col === 'file' || col === 'cve' ? (
                                  <span className="font-mono text-slate-500">{row[col] || '—'}</span>
                                ) : (
                                  <span className="text-slate-800 font-medium">{row[col] || '—'}</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">
                      Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, mappedData.length)} of {mappedData.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-6 h-6 text-xs rounded transition-colors ${
                            i === page
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl shrink-0">
            <span className="text-xs text-slate-400">{t('description')}</span>
            <button
              onClick={onContinue}
              disabled={submitting}
              className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm ${
                valid ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {submitting ? 'Continuing...' : (t('continueButton') || 'Continue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update summary view (from updateDependencyNode batch output)
  if (updateSummary) {
    const { total, updates } = updateSummary;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
        <div className="bg-white rounded-xl shadow-xl border border-yellow-200 w-[800px] max-w-[95vw] max-h-[85vh] flex flex-col">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
            <span className="text-yellow-500 text-lg">{nodeDef?.data?.icon ?? '🔧'}</span>
            <h3 className="text-sm font-semibold text-slate-800">{t('title')}</h3>
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
              {total} update{total !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-3 py-2 text-left text-slate-500 font-medium w-8">#</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-medium">Package</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-medium">From</th>
                    <th className="px-3 py-2 text-center text-slate-400 w-6">→</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-medium">To</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-medium">File</th>
                    <th className="px-3 py-2 text-left text-slate-600 font-medium">Repo</th>
                  </tr>
                </thead>
                <tbody>
                  {(updates ?? []).map((u, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-3 py-1.5 text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium text-slate-800">{u.package}</td>
                      <td className="px-3 py-1.5 font-mono text-red-600">{u.from}</td>
                      <td className="px-3 py-1.5 text-center text-slate-400">→</td>
                      <td className="px-3 py-1.5 font-mono text-green-600">{u.to}</td>
                      <td className="px-3 py-1.5 font-mono text-slate-500">{u.file}</td>
                      <td className="px-3 py-1.5 font-mono text-slate-500">{u.repo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <span className="text-xs text-slate-400">{t('description')}</span>
            <button
              onClick={onContinue}
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Continuing...' : (t('continueButton') || 'Continue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: generic list-based presentation (from previous implementation)
  const lines = lastContent.split('\n').filter((l) => l.trim());
  const listItems = lines.filter((l) => /^\d+\.\s/.test(l.trim()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in" onClick={onContinue}>
      <div
        className="bg-white rounded-xl shadow-xl border border-blue-200 w-[640px] max-w-[90vw] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
          <span className="text-blue-500 text-lg">{nodeDef?.data?.icon ?? '📋'}</span>
          <h3 className="text-sm font-semibold text-slate-800">{t('title')}</h3>
          <span className="ml-auto text-xs text-slate-400">{t('description')}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {listItems.length > 0 ? (
            <div className="space-y-2">
              {listItems.map((item, idx) => {
                const pkgMatch = item.match(/\*\*(.+?)\*\*/);
                const sevMatch = item.match(/\((\w+)\)/);
                const pkg = pkgMatch?.[1] ?? '';
                const severity = sevMatch?.[1] ?? '';
                const rest = item.replace(/^\d+\.\s*/, '').replace(/\*\*.*?\*\*/, '').replace(/\(\w+\)/, '').replace(/^[\s—–-]+/, '');
                const sevColor = severity === 'high' ? 'bg-red-100 text-red-700 border-red-200'
                  : severity === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200';
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono text-slate-400 w-5 text-right shrink-0">{idx + 1}</span>
                    <span className="text-sm font-semibold text-slate-800">{pkg}</span>
                    {severity && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${sevColor}`}>{severity}</span>
                    )}
                    <span className="text-xs text-slate-500 truncate flex-1">{rest.trim()}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">{lastContent}</div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <span className="text-xs text-slate-400">
            {listItems.length > 0 ? `${listItems.length} item${listItems.length !== 1 ? 's' : ''}` : ''}
          </span>
          <button
            onClick={onContinue}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? 'Continuing...' : (t('continueButton') || 'Continue')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main FeedbackPanel ──────────────────────────────────────────────────────
export default function FeedbackPanel() {
  const isPaused = useGraphStore((s) => s.isPaused);
  const isPauseAfter = useGraphStore((s) => s.isPauseAfter);
  const submitFeedback = useGraphStore((s) => s.submitFeedback);
  const skipFeedback = useGraphStore((s) => s.skipFeedback);
  const currentStage = useGraphStore((s) => s.currentStage);
  const iterations = useGraphStore((s) => s.iterations);
  const graphDef = useGraphStore((s) => s.graphDef);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pausedAtStage = currentStage;

  if (!isPaused || !graphDef) return null;

  const pausedNodeDef = graphDef.nodes.find((n) => n.id === pausedAtStage);
  const ctx = buildStageContext(pausedNodeDef);
  const interruptType = pausedNodeDef?.data?.interruptType;

  // interruptBefore pauses BEFORE the node runs. Only certain interruptTypes
  // make sense pre-execution (user provides input that the node will consume):
  //   - data_source_input: user provides CSV/API data
  //   - feedback: user provides text feedback
  //   - review: user approves/rejects
  // Everything else (schema_mapping, presentation, or no type) should show a
  // simple checkpoint panel when paused via interruptBefore.
  // interruptAfter means the node already ran — all types work as designed.
  const PRE_EXECUTION_TYPES = ['data_source_input', 'feedback', 'review'];
  const effectiveType = (!isPauseAfter && !PRE_EXECUTION_TYPES.includes(interruptType))
    ? 'checkpoint'
    : interruptType;

  const t = (key) => resolveG11n(graphDef, pausedAtStage, 'feedback', key, ctx);

  const handleSubmit = async (value) => {
    setSubmitting(true);
    await submitFeedback(typeof value === 'string' ? value : feedback);
    setFeedback('');
    setSubmitting(false);
  };

  const handleSkip = async () => {
    setSubmitting(true);
    await skipFeedback();
    setFeedback('');
    setSubmitting(false);
  };

  // ── Checkpoint pause (interruptBefore on a data-dependent node) ──
  if (effectiveType === 'checkpoint') {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] animate-fade-in">
        <div className="bg-white border border-blue-300 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-500 text-lg">{pausedNodeDef?.data?.icon ?? '⏸'}</span>
            <h3 className="text-sm font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              {pausedNodeDef?.data?.label ?? pausedAtStage}
            </h3>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              checkpoint
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Paused before <span className="font-medium text-slate-700">{pausedNodeDef?.data?.label ?? pausedAtStage}</span>.
            Continue to execute this stage, or leave and resume later.
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Continuing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data source input mode (interruptBefore: user provides CSV/API) ──
  if (effectiveType === 'data_source_input') {
    return (
      <DataSourceInputPanel
        onSubmit={handleSubmit}
        submitting={submitting}
        t={t}
        nodeDef={pausedNodeDef}
      />
    );
  }

  // ── Schema mapping mode (interruptAfter: user maps columns to fields) ──
  if (effectiveType === 'schema_mapping') {
    return (
      <SchemaMappingPanel
        iterations={iterations}
        pausedAtStage={pausedAtStage}
        onSubmit={handleSubmit}
        submitting={submitting}
        t={t}
        nodeDef={pausedNodeDef}
      />
    );
  }

  // ── Presentation mode (read-only display with Continue) ──
  if (effectiveType === 'presentation') {
    return (
      <PresentationPanel
        iterations={iterations}
        pausedAtStage={pausedAtStage}
        onContinue={handleSkip}
        submitting={submitting}
        t={t}
        nodeDef={pausedNodeDef}
      />
    );
  }

  // ── Review mode (approve/reject before proceeding) ──
  if (effectiveType === 'review') {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] animate-fade-in">
        <div className="bg-white border border-indigo-300 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-indigo-500 text-lg">{pausedNodeDef?.data?.icon ?? '🔍'}</span>
            <h3 className="text-sm font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{t('title')}</h3>
            <span className="ml-auto text-xs text-slate-400">{t('description')}</span>
          </div>

          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('placeholder') || 'Add review notes (optional)...'}
            disabled={submitting}
            className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400
              resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="px-4 py-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg transition-colors disabled:opacity-50 hover:bg-red-50"
            >
              {t('rejectButton') || 'Reject'}
            </button>
            <button
              onClick={() => handleSubmit(feedback || 'approved')}
              disabled={submitting}
              className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Submitting...' : (t('approveButton') || 'Approve')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Standard feedback mode (textarea) ──
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[600px] max-w-[90vw] animate-fade-in">
      <div className="bg-white border border-amber-300 rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-500 text-lg">💬</span>
          <h3 className="text-sm font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">{t('title')}</h3>
          <span className="ml-auto text-xs text-slate-400">{t('description')}</span>
        </div>

        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={t('placeholder')}
          disabled={submitting}
          className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-400
            resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white"
        />

        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={handleSkip}
            disabled={submitting}
            className="px-4 py-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 hover:bg-slate-50"
          >
            {t('skipButton')}
          </button>
          <button
            onClick={() => handleSubmit(feedback)}
            disabled={submitting}
            className="px-4 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? t('submittingButton') : t('submitButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
