import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileJson, FileCode, FileText, Boxes, PenTool, FileType } from 'lucide-react';
import { exportFormats, type ExportFormat } from '../../utils/export-formats';
import type { RuleGroup } from '../../types/rule.types';

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  json:        <FileJson className="w-5 h-5" />,
  xml:         <FileCode className="w-5 h-5" />,
  yaml:        <FileText className="w-5 h-5" />,
  mermaid:     <PenTool className="w-5 h-5" />,
  structurizr: <Boxes className="w-5 h-5" />,
  drawio:      <FileType className="w-5 h-5" />,
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RuleGroup;
  baseFilename: string;
}

export function ExportModal({ isOpen, onClose, rules, baseFilename }: ExportModalProps) {
  const [selected, setSelected] = useState<ExportFormat>('json');
  const [logicOnly, setLogicOnly] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleExport = useCallback(() => {
    const fmt = exportFormats.find((f) => f.id === selected);
    if (!fmt) return;

    const content = fmt.convert(rules, { logicOnly });
    const blob = new Blob([content], { type: fmt.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = logicOnly ? `logic-only${fmt.extension}` : `${baseFilename}${fmt.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }, [selected, logicOnly, rules, baseFilename, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="export-dialog-title" className="text-base font-semibold text-slate-900">
            Export Rule Tree
          </h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format list */}
        <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-400 mb-3">Choose an export format:</p>
          {exportFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelected(fmt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                selected === fmt.id
                  ? 'border-accent-400 bg-accent-50/50 ring-1 ring-accent-400'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  selected === fmt.id
                    ? 'bg-accent-100 text-accent-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {formatIcons[fmt.id]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {fmt.label}
                  <span className="ml-2 text-xs text-slate-400 font-normal">{fmt.extension}</span>
                </p>
                <p className="text-xs text-slate-400 truncate">{fmt.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Options */}
        <div className="px-6 py-3 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={logicOnly}
              onChange={(e) => setLogicOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-accent-600 focus:ring-accent-400"
            />
            <div>
              <span className="text-sm font-medium text-slate-700">Logic only</span>
              <p className="text-xs text-slate-400">Strip id, name, type, dataType — export only the logic structure</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/80 rounded-b-2xl border-t border-slate-100">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn-primary"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
