import { useState } from 'react';
import { X, Copy, CheckCheck } from 'lucide-react';

interface MermaidPreviewProps {
  text: string;
  onClose: () => void;
}

export function MermaidPreview({ text, onClose }: MermaidPreviewProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-[640px] max-w-[90vw] max-h-[80vh] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Mermaid Export
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCheck size={12} className="text-emerald-500" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <pre className="flex-1 p-5 text-sm font-mono text-slate-700 overflow-auto leading-relaxed bg-slate-50">
          {text}
        </pre>
      </div>
    </div>
  );
}
