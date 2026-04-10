import { useApi } from '../hooks/useApi.js';
import { fetchCollections } from '../services/api.js';
import { Card } from './Card.jsx';
import { LoadingState } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { CountBar } from './CountBar.jsx';

function CollectionCard({ collection, onSelect }) {
  return (
    <button
      onClick={() => onSelect(collection.name)}
      className="text-left p-4 rounded-xl transition-all"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#a5b4fc';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
            {collection.name}
          </span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium tabular-nums"
            style={{ background: '#ede9fe', color: '#6d28d9' }}
          >
            {collection.dimension}d
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] block" style={{ color: '#94a3b8' }}>
              Embeddings
            </span>
            <span className="text-lg font-bold tabular-nums" style={{ color: '#4f46e5' }}>
              {(collection.embeddingCount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] block mb-1" style={{ color: '#94a3b8' }}>
            ID
          </span>
          <span className="text-[11px] font-mono break-all" style={{ color: '#64748b' }}>
            {collection.id}
          </span>
        </div>

        <span
          className="inline-flex items-center gap-1 text-[10px] font-medium"
          style={{ color: '#6366f1' }}
        >
          Explore
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}

export function CollectionsTab({ dbName, onSelectCollection }) {
  const { data, loading, error, refetch } = useApi(
    () => fetchCollections(dbName),
    [dbName],
  );

  if (loading) return <LoadingState message="Loading collections..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const collections = data?.collections ?? [];

  if (collections.length === 0) {
    return (
      <EmptyState
        message="No collections found"
        subMessage="This database has no ChromaDB collections"
      />
    );
  }

  const maxCount = Math.max(...collections.map((c) => c.embeddingCount ?? 0), 1);

  return (
    <div className="space-y-4">
      <span
        className="text-[10px] uppercase tracking-widest font-semibold"
        style={{ color: '#64748b' }}
      >
        {collections.length} collection{collections.length !== 1 ? 's' : ''} in {dbName}
      </span>

      {/* Collection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {collections.map((col) => (
          <CollectionCard
            key={col.id}
            collection={col}
            onSelect={onSelectCollection}
          />
        ))}
      </div>

      {/* Embedding distribution bar chart */}
      {collections.length > 1 && (
        <Card className="p-5">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold block mb-4"
            style={{ color: '#94a3b8' }}
          >
            Embedding Distribution
          </span>
          <div className="space-y-2.5">
            {collections.map((col) => (
              <CountBar
                key={col.id}
                label={col.name}
                count={col.embeddingCount ?? 0}
                maxCount={maxCount}
                color="#7c3aed"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
