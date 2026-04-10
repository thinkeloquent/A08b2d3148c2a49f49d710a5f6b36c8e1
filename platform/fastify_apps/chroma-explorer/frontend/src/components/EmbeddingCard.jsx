import { useState } from 'react';
import { MetadataBadge } from './MetadataBadge.jsx';

/**
 * Expandable card for a single embedding row.
 */
export function EmbeddingCard({ embedding, index }) {
  const [expanded, setExpanded] = useState(false);

  const doc = embedding.document || '';
  const truncated = doc.length > 180 ? doc.slice(0, 180) + '…' : doc;

  return (
    <div
      className="rounded-xl p-4 transition-all cursor-pointer"
      style={{
        background: expanded ? '#ffffff' : '#ffffff',
        border: `1px solid ${expanded ? '#c7d2fe' : '#e2e8f0'}`,
        borderLeft: `3px solid ${expanded ? '#6366f1' : '#e2e8f0'}`,
        boxShadow: expanded ? '0 1px 4px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.03)',
      }}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <span
          className="text-[10px] font-bold tabular-nums shrink-0 pt-0.5 w-6 text-right"
          style={{ color: '#94a3b8' }}
        >
          #{index + 1}
        </span>

        <div className="flex-1 min-w-0">
          {/* ID + badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <code
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              {embedding.embeddingId || embedding.id}
            </code>
            {embedding.component && (
              <MetadataBadge label={embedding.component} color="violet" />
            )}
            {embedding.library && (
              <MetadataBadge label={embedding.library} color="cyan" />
            )}
            {embedding.fileName && (
              <MetadataBadge label={embedding.fileName} color="slate" />
            )}
          </div>

          {/* Document text */}
          <p
            className="text-xs leading-relaxed"
            style={{ color: expanded ? '#1e293b' : '#64748b' }}
          >
            {expanded ? doc || '(no document text)' : truncated || '(no document text)'}
          </p>
        </div>

        {/* Expand indicator */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          className={`shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Expanded metadata */}
      {expanded && (
        <div
          className="mt-3 pt-3 ml-9"
          style={{ borderTop: '1px solid #e2e8f0' }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {Object.entries(embedding.metadata || {})
              .filter(([key]) => key !== 'chroma:document')
              .map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <span
                    className="text-[10px] uppercase tracking-wider shrink-0 pt-0.5 w-24"
                    style={{ color: '#94a3b8' }}
                  >
                    {key}
                  </span>
                  <span
                    className="text-[11px] break-all"
                    style={{ color: '#475569' }}
                  >
                    {String(value ?? '')}
                  </span>
                </div>
              ))}
          </div>
          {embedding.filePath && (
            <div className="mt-2">
              <span
                className="text-[10px] uppercase tracking-wider"
                style={{ color: '#94a3b8' }}
              >
                path
              </span>
              <p
                className="text-[11px] mt-0.5 break-all font-mono"
                style={{ color: '#64748b' }}
              >
                {embedding.filePath}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
