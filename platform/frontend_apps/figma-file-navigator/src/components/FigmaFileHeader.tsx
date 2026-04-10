import { useState } from 'react';

interface FigmaFileHeaderProps {
  onLoadFile: (fileKey: string) => void;
  isLoading?: boolean;
  fileName?: string | null;
}

export function FigmaFileHeader({ onLoadFile, isLoading, fileName }: FigmaFileHeaderProps) {
  const [fileKey, setFileKey] = useState('');

  const handleLoad = () => {
    const trimmed = fileKey.trim();
    if (trimmed) onLoadFile(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLoad();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          {fileName && (
            <div className="flex items-center gap-2 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a259ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z" />
                <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z" />
                <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 11-7 0z" />
                <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z" />
                <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 truncate">{fileName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            data-testid="file-id-input"
            type="text"
            placeholder="Figma file key..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm w-64"
            value={fileKey}
            onChange={(e) => setFileKey(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            data-testid="load-file-button"
            disabled={!fileKey.trim() || isLoading}
            onClick={handleLoad}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Load File
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
