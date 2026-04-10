import { useState } from 'react';
import { useApi } from '../hooks/useApi.js';
import { fetchComponents } from '../services/api.js';
import { LoadingState } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { Card } from './Card.jsx';

/**
 * Component card for the grid view.
 */
function ComponentCard({ component, count, maxCount, onClick, selected }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-xl text-left transition-all"
      style={{
        background: selected ? '#eef2ff' : '#ffffff',
        border: `1px solid ${selected ? '#a5b4fc' : '#e2e8f0'}`,
        boxShadow: selected ? '0 1px 4px rgba(99,102,241,0.1)' : '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <p
        className="text-xs font-semibold mb-2 truncate"
        style={{ color: selected ? '#4f46e5' : '#334155' }}
        title={component}
      >
        {component}
      </p>
      {/* Mini progress bar */}
      <div
        className="h-1 rounded-full mb-1.5"
        style={{ background: '#f1f5f9' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: selected
              ? 'linear-gradient(90deg, #6366f1, #818cf8)'
              : 'linear-gradient(90deg, #cbd5e1, #94a3b8)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span
        className="text-[10px] tabular-nums"
        style={{ color: selected ? '#6366f1' : '#94a3b8' }}
      >
        {count.toLocaleString()} embeddings
      </span>
    </button>
  );
}

export function ComponentsTab({ dbName, collection, onFilterByComponent }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => fetchComponents(dbName, 200, collection || undefined),
    [dbName, collection],
  );

  if (loading) return <LoadingState message="Loading components..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const components = data?.components ?? [];

  if (components.length === 0) {
    return (
      <EmptyState
        message="No component metadata found"
        subMessage="This database does not have 'component' metadata keys"
      />
    );
  }

  const maxCount = Math.max(...components.map((c) => c.count), 1);

  const filtered = search
    ? components.filter((c) =>
        c.component.toLowerCase().includes(search.toLowerCase()),
      )
    : components;

  const handleSelect = (component) => {
    const next = selected === component ? null : component;
    setSelected(next);
    if (onFilterByComponent) onFilterByComponent(next);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: '#64748b' }}
        >
          {components.length} components
        </span>
        {selected && (
          <button
            onClick={() => handleSelect(null)}
            className="text-[10px] px-2.5 py-1 rounded-lg"
            style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter components..."
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
          style={{
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
          }}
        />
      </div>

      {/* Components grid */}
      {filtered.length === 0 ? (
        <EmptyState message="No components match your filter" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filtered.map((c) => (
            <ComponentCard
              key={c.component}
              component={c.component}
              count={c.count}
              maxCount={maxCount}
              selected={selected === c.component}
              onClick={() => handleSelect(c.component)}
            />
          ))}
        </div>
      )}

      {selected && (
        <Card className="p-4">
          <p className="text-xs" style={{ color: '#64748b' }}>
            Selected component:{' '}
            <span style={{ color: '#4f46e5' }}>{selected}</span>
            {' — '}
            switch to the Browse tab to see filtered embeddings.
          </p>
        </Card>
      )}
    </div>
  );
}
