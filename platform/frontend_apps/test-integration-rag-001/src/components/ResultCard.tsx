import { useState } from 'react';
import type { SearchResult } from '../types';

type Tab = 'all' | 'text' | 'code';

export default function ResultCard({ result }: { result: SearchResult }) {
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const meta = result.metadata ?? {};
  const codeParts = result.code_parts ?? [];
  const textParts = result.text_parts ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Meta row */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-1.5">
        {meta.component && (
          <span className="font-bold text-gray-600">{meta.component as string}</span>
        )}
        {meta.file_name && <span>{meta.file_name as string}</span>}
        {result.score != null && (
          <span className="bg-green-50 text-green-700 px-1.5 rounded text-xs">
            {result.score.toFixed(4)}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-2">
        {(['all', 'text', 'code'] as Tab[]).map((tab) => {
          const label =
            tab === 'all'
              ? 'All'
              : tab === 'text'
                ? `Text (${textParts.length})`
                : `Code (${codeParts.length})`;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs cursor-pointer border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-blue-500 border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-blue-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'all' && (
        <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {result.content}
        </pre>
      )}

      {activeTab === 'text' && (
        textParts.length > 0
          ? textParts.map((t, i) => (
              <div key={i} className="text-sm text-gray-700 leading-relaxed mb-1.5">
                {t}
              </div>
            ))
          : <div className="text-sm text-gray-400 italic">None detected</div>
      )}

      {activeTab === 'code' && (
        codeParts.length > 0
          ? codeParts.map((c, i) => (
              <pre
                key={i}
                className="text-xs font-mono bg-gray-50 border border-gray-200 rounded p-2 mb-1.5 whitespace-pre-wrap break-words overflow-x-auto"
              >
                {c}
              </pre>
            ))
          : <div className="text-sm text-gray-400 italic">None detected</div>
      )}
    </div>
  );
}
