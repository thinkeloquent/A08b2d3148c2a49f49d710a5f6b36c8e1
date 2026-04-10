import { useState, useEffect } from 'react';
import { AppShell } from './layout/AppShell.jsx';
import { fetchDatabases } from './services/api.js';
import { BrowseTab } from './components/BrowseTab.jsx';
import { StatisticsTab } from './components/StatisticsTab.jsx';
import { ComponentsTab } from './components/ComponentsTab.jsx';
import { CollectionsTab } from './components/CollectionsTab.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';

// ── Tab configuration ────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'collections',
    label: 'Collections',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    id: 'browse',
    label: 'Browse & Search',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    id: 'statistics',
    label: 'Statistics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    id: 'components',
    label: 'Components',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  },
];

const TAB_IDS = new Set(TABS.map((t) => t.id));
const BASE_PATH = '/apps/chroma-explorer';

// ── URL parsing ──────────────────────────────────────────────────────────────
// URL pattern: /apps/chroma-explorer/{collection?}/{tab?}?db=...
// e.g. /apps/chroma-explorer/chromadb-rag-ingest-manager/components?db=ant-design

function parseUrl() {
  const remainder = window.location.pathname.replace(BASE_PATH, '').replace(/^\//, '');
  const segments = remainder.split('/').filter(Boolean);
  const params = new URLSearchParams(window.location.search);

  let collection = null;
  let tab = 'collections';

  if (segments.length >= 2 && TAB_IDS.has(segments[1])) {
    // /collection/tab
    collection = decodeURIComponent(segments[0]);
    tab = segments[1];
  } else if (segments.length === 1) {
    if (TAB_IDS.has(segments[0])) {
      // /tab (no collection — legacy URL)
      tab = segments[0];
    } else {
      // /collection (default to browse)
      collection = decodeURIComponent(segments[0]);
      tab = 'browse';
    }
  }

  return {
    collection,
    tab,
    db: params.get('db') || null,
  };
}

// ── Database Selector ─────────────────────────────────────────────────────────

function DatabaseSelector({ databases, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const selectedDb = databases.find((d) => d.name === selected);

  return (
    <div className="mb-5 relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#ede9fe' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold block" style={{ color: '#1e293b' }}>
              {selected || 'Select database'}
            </span>
            {selectedDb && selectedDb.available && (
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                {selectedDb.embeddingCount?.toLocaleString() ?? '—'} embeddings
                {selectedDb.collections?.length ? ` · ${selectedDb.collections.length} collection${selectedDb.collections.length !== 1 ? 's' : ''}` : ''}
              </span>
            )}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          {databases.map((db) => (
            <button
              key={db.name}
              onClick={() => { onSelect(db.name); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
              style={{
                background: db.name === selected ? '#eef2ff' : 'transparent',
                borderLeft: db.name === selected ? '2px solid #6366f1' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (db.name !== selected) e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (db.name !== selected) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="text-left">
                <span
                  className="text-xs font-medium block"
                  style={{ color: db.name === selected ? '#4f46e5' : '#334155' }}
                >
                  {db.name}
                </span>
                {db.available ? (
                  <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                    {db.embeddingCount?.toLocaleString() ?? '—'} embeddings
                    {db.collections?.length ? ` · ${db.collections.length} collections` : ''}
                  </span>
                ) : (
                  <span className="text-[10px]" style={{ color: '#ef4444' }}>
                    unavailable
                  </span>
                )}
              </div>
              {db.name === selected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collection Selector (inline pill bar) ─────────────────────────────────────

function CollectionSelector({ collections, selected, onSelect }) {
  if (!collections || collections.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
        Collection:
      </span>
      <button
        onClick={() => onSelect(null)}
        className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all"
        style={{
          background: !selected ? '#eef2ff' : '#f8fafc',
          color: !selected ? '#4f46e5' : '#64748b',
          border: `1px solid ${!selected ? '#a5b4fc' : '#e2e8f0'}`,
        }}
      >
        All
      </button>
      {collections.map((col) => (
        <button
          key={col.name}
          onClick={() => onSelect(col.name)}
          className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all"
          style={{
            background: selected === col.name ? '#eef2ff' : '#f8fafc',
            color: selected === col.name ? '#4f46e5' : '#64748b',
            border: `1px solid ${selected === col.name ? '#a5b4fc' : '#e2e8f0'}`,
          }}
        >
          {col.name}
          <span className="ml-1.5 text-[10px] tabular-nums opacity-70">
            {col.embeddingCount?.toLocaleString()}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Connection Status ──────────────────────────────────────────────────────────

function ConnectionStatus({ connected }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{
        background: connected ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${connected ? '#bbf7d0' : '#fecaca'}`,
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: connected ? '#22c55e' : '#ef4444',
        }}
      />
      <span
        className="text-[10px] font-medium"
        style={{ color: connected ? '#16a34a' : '#dc2626' }}
      >
        {connected ? 'Connected' : 'Offline'}
      </span>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const initial = parseUrl();
  const [activeTab, setActiveTab] = useState(initial.tab);
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState(initial.db || 'ant-design');
  const [selectedCollection, setSelectedCollection] = useState(initial.collection);
  const [connected, setConnected] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [componentFilter, setComponentFilter] = useState(null);

  // Get collections for current database
  const currentDbInfo = databases.find((d) => d.name === selectedDb);
  const collections = currentDbInfo?.collections ?? [];

  // Sync URL when tab, db, or collection changes
  useEffect(() => {
    const url = new URL(window.location);
    let targetPath;
    if (selectedCollection) {
      targetPath = `${BASE_PATH}/${encodeURIComponent(selectedCollection)}/${activeTab}`;
    } else {
      targetPath = `${BASE_PATH}/${activeTab}`;
    }
    let changed = false;
    if (url.pathname !== targetPath) {
      url.pathname = targetPath;
      changed = true;
    }
    if (url.searchParams.get('db') !== selectedDb) {
      url.searchParams.set('db', selectedDb);
      changed = true;
    }
    if (changed) {
      window.history.pushState(null, '', url);
    }
  }, [activeTab, selectedDb, selectedCollection]);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const parsed = parseUrl();
      setActiveTab(parsed.tab);
      setSelectedCollection(parsed.collection);
      if (parsed.db) setSelectedDb(parsed.db);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch database list on mount
  useEffect(() => {
    fetchDatabases()
      .then((res) => {
        setDatabases(res.databases || []);
        setConnected(true);
        const dbs = res.databases || [];
        const fromQuery = initial.db;
        const match = fromQuery && dbs.find((d) => d.name === fromQuery && d.available);
        if (match) {
          setSelectedDb(match.name);
        } else {
          const first = dbs.find((d) => d.available);
          if (first) setSelectedDb(first.name);
        }
      })
      .catch(() => {
        setConnected(false);
      })
      .finally(() => {
        setDbLoading(false);
      });
  }, []);

  const handleFilterByComponent = (component) => {
    setComponentFilter(component);
    if (component) setActiveTab('browse');
  };

  const handleSelectCollection = (collectionName) => {
    setSelectedCollection(collectionName);
    // When selecting a collection from the CollectionsTab, switch to browse
    if (collectionName && activeTab === 'collections') {
      setActiveTab('browse');
    }
  };

  return (
    <AppShell>
    <div
      className="min-h-screen w-full"
      style={{
        background: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="w-full px-6 py-6">
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {dbLoading && <LoadingSpinner size={14} />}
            <ConnectionStatus connected={connected} />
          </div>
        </header>

        {/* ── Database Selector ── */}
        {databases.length > 0 && (
          <DatabaseSelector
            databases={databases}
            selected={selectedDb}
            onSelect={(name) => {
              setSelectedDb(name);
              setSelectedCollection(null);
              setComponentFilter(null);
            }}
          />
        )}

        {/* ── Collection Selector (pill bar, shown on data tabs) ── */}
        {activeTab !== 'collections' && collections.length > 1 && (
          <CollectionSelector
            collections={collections}
            selected={selectedCollection}
            onSelect={setSelectedCollection}
          />
        )}

        {/* ── Tab Navigation ── */}
        <div
          className="flex gap-0.5 mb-5 p-1 rounded-lg w-fit"
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'collections' && (
          <CollectionsTab
            key={selectedDb}
            dbName={selectedDb}
            onSelectCollection={handleSelectCollection}
          />
        )}
        {activeTab === 'browse' && (
          <BrowseTab
            key={`${selectedDb}-${selectedCollection}-${componentFilter}`}
            dbName={selectedDb}
            collection={selectedCollection}
            initialComponent={componentFilter}
          />
        )}
        {activeTab === 'statistics' && (
          <StatisticsTab
            key={`${selectedDb}-${selectedCollection}`}
            dbName={selectedDb}
            collection={selectedCollection}
          />
        )}
        {activeTab === 'components' && (
          <ComponentsTab
            key={`${selectedDb}-${selectedCollection}`}
            dbName={selectedDb}
            collection={selectedCollection}
            onFilterByComponent={handleFilterByComponent}
          />
        )}

      </div>
    </div>
    </AppShell>
  );
}
