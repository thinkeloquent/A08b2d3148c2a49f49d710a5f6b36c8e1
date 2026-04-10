import { useApi } from '../hooks/useApi.js';
import { fetchStats } from '../services/api.js';
import { CountBar } from './CountBar.jsx';
import { Card } from './Card.jsx';
import { LoadingState } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';
import { Sparkline } from './Sparkline.jsx';

function StatMetric({ label, value, color = '#4f46e5', sparkData }) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <span
        className="text-[10px] uppercase tracking-widest font-medium"
        style={{ color: '#94a3b8' }}
      >
        {label}
      </span>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold tabular-nums" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {sparkData && <Sparkline data={sparkData} color={color} height={28} width={80} />}
      </div>
    </Card>
  );
}

export function StatisticsTab({ dbName, collection }) {
  const { data, loading, error, refetch } = useApi(
    () => fetchStats(dbName, collection || undefined),
    [dbName, collection],
  );

  if (loading) return <LoadingState message="Loading statistics..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  const { stats } = data;

  // Build a simple sparkline from top component counts
  const componentSpark = (stats.topComponents || [])
    .slice(0, 12)
    .map((c) => c.count);

  const metaMaxCount = Math.max(...(stats.metadataDistribution || []).map((m) => m.count), 1);
  const componentMaxCount = Math.max(...(stats.topComponents || []).map((c) => c.count), 1);

  return (
    <div className="space-y-4">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMetric
          label="Total Embeddings"
          value={stats.totalEmbeddings}
          color="#4f46e5"
          sparkData={componentSpark.length > 0 ? componentSpark : undefined}
        />
        <StatMetric
          label="Unique Components"
          value={stats.uniqueComponents}
          color="#7c3aed"
        />
        <StatMetric
          label="Unique Files"
          value={stats.uniqueFiles}
          color="#059669"
        />
        <StatMetric
          label="Unique Libraries"
          value={stats.uniqueLibraries}
          color="#d97706"
        />
      </div>

      {/* Collection info */}
      {stats.collection && (
        <Card className="p-4">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold block mb-3"
            style={{ color: '#94a3b8' }}
          >
            Collection
          </span>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>Name</span>
              <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{stats.collection.name}</p>
            </div>
            <div>
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>Dimension</span>
              <p className="text-sm font-semibold tabular-nums" style={{ color: '#4f46e5' }}>{stats.collection.dimension}d</p>
            </div>
            <div>
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>ID</span>
              <p className="text-[11px] font-mono" style={{ color: '#64748b' }}>{stats.collection.id}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Metadata key distribution */}
      {stats.metadataDistribution && stats.metadataDistribution.length > 0 && (
        <Card className="p-5">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold block mb-4"
            style={{ color: '#94a3b8' }}
          >
            Metadata Key Distribution
          </span>
          <div className="space-y-2.5">
            {stats.metadataDistribution.map((m) => (
              <CountBar
                key={m.key}
                label={m.key}
                count={m.count}
                maxCount={metaMaxCount}
                color="linear-gradient(90deg, #6366f1, #7c3aed)"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Top components distribution */}
      {stats.topComponents && stats.topComponents.length > 0 && (
        <Card className="p-5">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold block mb-4"
            style={{ color: '#94a3b8' }}
          >
            Top Components by Embedding Count
          </span>
          <div className="space-y-2">
            {stats.topComponents.map((c) => (
              <CountBar
                key={c.component}
                label={c.component}
                count={c.count}
                maxCount={componentMaxCount}
                color="#7c3aed"
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
