import { useState, useEffect, useRef } from 'react';
import type { GitHubCommitHistoryEntry } from '@/types';
import { fetchFileCommits } from '@/api/github';
import { TimeTravelScrubber } from '@/components/history/TimeTravelScrubber';
import { Lightbulb } from '@/components/icons';

interface FileIntelligenceModalProps {
  owner: string;
  repo: string;
  filePath: string;
  fileName: string;
  onClose: () => void;
}

export function FileIntelligenceModal({ owner, repo, filePath, fileName: _fileName, onClose }: FileIntelligenceModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [commits, setCommits] = useState<GitHubCommitHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Auto-generate: fetch commits on mount
  useEffect(() => {
    setLoading(true);
    setError(false);
    setCommits([]);
    fetchFileCommits(owner, repo, filePath)
      .then(data => {
        setCommits(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [owner, repo, filePath]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: 'min(94vw, 1100px)', height: 'min(90vh, 820px)' }}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Lightbulb size={16} className="text-amber-500" />
            <span className="text-[11px] text-amber-500 font-semibold uppercase tracking-wider">File Intelligence</span>
            <span className="text-[13px] font-semibold text-slate-800 font-mono">{filePath}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1 transition-colors">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fb] p-5">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400">Generating intelligence report...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex-1 flex items-center justify-center py-20 text-slate-400 text-sm">
              Failed to load commit history for this file
            </div>
          )}

          {!loading && !error && commits.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-20 text-slate-400 text-sm">
              No commit history found for this file
            </div>
          )}

          {!loading && !error && commits.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <TimeTravelScrubber owner={owner} repo={repo} filePath={filePath} commits={commits} autoLoad bare />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
