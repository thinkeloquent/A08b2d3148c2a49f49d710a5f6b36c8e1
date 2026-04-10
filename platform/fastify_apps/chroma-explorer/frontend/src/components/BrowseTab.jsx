import { useState, useCallback, useRef } from 'react';
import { useApi } from '../hooks/useApi.js';
import { fetchEmbeddings, fetchSearch } from '../services/api.js';
import { EmbeddingCard } from './EmbeddingCard.jsx';
import { Pagination } from './Pagination.jsx';
import { LoadingState } from './LoadingSpinner.jsx';
import { ErrorState } from './ErrorState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { Card } from './Card.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';

export function BrowseTab({ dbName, collection, initialComponent }) {
  const [page, setPage] = useState(1);
  const [componentFilter, setComponentFilter] = useState(initialComponent || '');
  const [fileFilter, setFileFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch paginated embeddings (only when not in search mode)
  const { data, loading, error, refetch } = useApi(
    () => fetchEmbeddings(dbName, { page, limit: 20, component: componentFilter || undefined, file_name: fileFilter || undefined, collection: collection || undefined }),
    [dbName, page, componentFilter, fileFilter, collection],
  );

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);
    setActiveSearch(searchQuery);
    try {
      const res = await fetchSearch(dbName, searchQuery.trim(), 30, collection || undefined);
      setSearchResults(res);
    } catch (err) {
      setSearchError(err);
    } finally {
      setSearchLoading(false);
    }
  }, [dbName, searchQuery, collection]);

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    setSearchResults(null);
    setSearchError(null);
    searchInputRef.current?.focus();
  };

  const isSearchMode = !!activeSearch;

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <Card className="p-4">
        {/* Search row */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search document content..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none"
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
            style={{
              background: searchLoading ? '#eef2ff' : '#4f46e5',
              color: searchLoading ? '#4f46e5' : '#ffffff',
              opacity: !searchQuery.trim() ? 0.5 : 1,
            }}
          >
            {searchLoading ? <LoadingSpinner size={12} /> : null}
            {searchLoading ? 'Searching' : 'Search'}
          </button>
          {isSearchMode && (
            <button
              onClick={clearSearch}
              className="px-3 py-2 rounded-lg text-xs transition-all"
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter row — only visible in browse mode */}
        {!isSearchMode && (
          <div className="flex gap-3">
            <input
              type="text"
              value={componentFilter}
              onChange={(e) => { setComponentFilter(e.target.value); setPage(1); }}
              placeholder="Filter by component..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
              }}
            />
            <input
              type="text"
              value={fileFilter}
              onChange={(e) => { setFileFilter(e.target.value); setPage(1); }}
              placeholder="Filter by file name..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: '#f8fafc',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
              }}
            />
            {(componentFilter || fileFilter) && (
              <button
                onClick={() => { setComponentFilter(''); setFileFilter(''); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Search Results */}
      {isSearchMode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: '#64748b' }}
            >
              Search results for: <span style={{ color: '#4f46e5' }}>"{activeSearch}"</span>
            </span>
            {searchResults && (
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                {searchResults.count} result{searchResults.count !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {searchLoading && <LoadingState message="Searching..." />}
          {searchError && <ErrorState error={searchError} onRetry={handleSearch} />}
          {searchResults && searchResults.results.length === 0 && (
            <EmptyState message="No results found" subMessage={`No documents matched "${activeSearch}"`} />
          )}
          {searchResults && searchResults.results.map((emb, i) => (
            <EmbeddingCard key={emb.id} embedding={emb} index={i} />
          ))}
        </div>
      )}

      {/* Browse Results */}
      {!isSearchMode && (
        <div className="space-y-2">
          {/* Summary bar */}
          {data && (
            <div className="flex items-center justify-between px-1">
              <span
                className="text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: '#64748b' }}
              >
                {data.total?.toLocaleString() ?? '—'} total embeddings
              </span>
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total ?? 0)}
              </span>
            </div>
          )}

          {loading && <LoadingState message="Loading embeddings..." />}
          {error && <ErrorState error={error} onRetry={refetch} />}

          {!loading && !error && data && data.embeddings.length === 0 && (
            <EmptyState
              message="No embeddings found"
              subMessage={componentFilter || fileFilter ? 'Try adjusting your filters' : 'This database appears to be empty'}
            />
          )}

          {!loading && !error && data && data.embeddings.map((emb, i) => (
            <EmbeddingCard key={emb.id} embedding={emb} index={(page - 1) * 20 + i} />
          ))}

          {data && (
            <Pagination
              page={page}
              totalPages={data.totalPages ?? 1}
              onPage={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
