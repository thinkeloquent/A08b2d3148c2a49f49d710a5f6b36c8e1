import { useState, useCallback, useEffect } from 'react';
import { AppShell } from './layout/AppShell';
import { FileTreeProvider } from './components/FileTreeContext';
import { FigmaCanvas } from './components/FigmaCanvas';
import { FileTreeNavigation } from './components/FileTreeNavigation';
import { FigmaFileHeader } from './components/FigmaFileHeader';
import { NodePropertiesPanel } from './components/NodePropertiesPanel';
import { fetchFigmaFile } from './api/figma';
import { figmaDocumentToFileNodes } from './api/figma-to-filetree';
import type { FileNode } from './types';

const BASE_PATH = '/apps/figma-file-navigator';

/** Extract file key and node id from the URL path. */
function parseUrl(): { fileKey: string; nodeId: string } {
  const path = window.location.pathname;
  if (!path.startsWith(BASE_PATH + '/')) return { fileKey: '', nodeId: '' };
  const rest = path.slice(BASE_PATH.length + 1);
  const slashIdx = rest.indexOf('/');
  if (slashIdx === -1) return { fileKey: decodeURIComponent(rest), nodeId: '' };
  return {
    fileKey: decodeURIComponent(rest.slice(0, slashIdx)),
    nodeId: decodeURIComponent(rest.slice(slashIdx + 1)),
  };
}

function App() {
  const [fileNodes, setFileNodes] = useState<FileNode[] | null>(null);
  const [fileKey, setFileKey] = useState<string>('');
  const [initialNodeId, setInitialNodeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const loadFile = useCallback(async (key: string, nodeId = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFigmaFile(key);
      const nodes = figmaDocumentToFileNodes(response.document);
      if (!nodes.length) {
        setError('No visible pages found in this file.');
        return;
      }
      setFileNodes(nodes);
      setFileKey(key);
      setFileName(response.name);
      setInitialNodeId(nodeId);
      const url = nodeId
        ? `${BASE_PATH}/${encodeURIComponent(key)}/${encodeURIComponent(nodeId)}`
        : `${BASE_PATH}/${encodeURIComponent(key)}`;
      window.history.pushState(null, '', url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Figma file');
      setFileNodes(null);
      setFileKey('');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-load file from URL on mount
  useEffect(() => {
    const { fileKey: urlKey, nodeId } = parseUrl();
    if (urlKey) loadFile(urlKey, nodeId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const { fileKey: urlKey, nodeId } = parseUrl();
      if (urlKey && urlKey !== fileKey) {
        loadFile(urlKey, nodeId);
      } else if (urlKey === fileKey && nodeId) {
        setInitialNodeId(nodeId);
      } else if (!urlKey) {
        setFileNodes(null);
        setFileKey('');
        setFileName(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fileKey, loadFile]);

  const handleLoadFile = useCallback((key: string) => {
    loadFile(key);
  }, [loadFile]);

  return (
    <AppShell>
      <div className="-m-6 flex flex-col" style={{ height: 'calc(100vh - 7.5rem)' }}>
        <FigmaFileHeader onLoadFile={handleLoadFile} isLoading={isLoading} fileName={fileName} />

        {error && (
          <div className="mx-6 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {fileNodes ? (
          <FileTreeProvider fileKey={fileKey} nodes={fileNodes} initialNodeId={initialNodeId}>
            <div className="flex flex-1 min-h-0">
              <FileTreeNavigation />
              <FigmaCanvas />
              <NodePropertiesPanel />
            </div>
          </FileTreeProvider>
        ) : !error ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="mx-auto mb-4 w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm font-medium">Loading Figma file...</p>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto text-slate-300 mb-4"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <p className="text-slate-400 text-sm font-medium">Enter a Figma file key and click Load File to begin</p>
                  <p className="text-slate-300 text-xs mt-2">The file key is the string after /file/ in a Figma URL</p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

export default App;
