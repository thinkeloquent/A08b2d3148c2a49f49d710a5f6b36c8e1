import { useState, useRef } from 'react';
import { X, Upload, Download, FileJson, FileText, Copy, Check, AlertCircle } from 'lucide-react';
import {
  exportToYaml,
  exportToJson,
  importFromContent,
  downloadAsFile,
} from '../utils/importExport';
import { FormPage, FormMetadata, ElementMetadata, ElementBounds } from '../types';

type ModalMode = 'import' | 'export';
type ExportFormat = 'yaml' | 'json';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  pages: FormPage[];
  metadata?: FormMetadata;
  elementMetadata?: Record<string, ElementMetadata>;
  elementBounds?: Record<string, ElementBounds>;
  version: string;
  onImport: (pages: FormPage[], metadata?: FormMetadata, elementMetadata?: Record<string, ElementMetadata>) => void;
}

export default function ImportExportModal({
  isOpen,
  onClose,
  mode,
  pages,
  metadata,
  elementMetadata,
  elementBounds,
  version,
  onImport,
}: ImportExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('yaml');
  const [importContent, setImportContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const exportContent = mode === 'export'
    ? exportFormat === 'yaml'
      ? exportToYaml(pages, metadata, elementMetadata, elementBounds, version)
      : exportToJson(pages, metadata, elementMetadata, elementBounds, version)
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const ext = exportFormat === 'yaml' ? 'yaml' : 'json';
    const mime = exportFormat === 'yaml' ? 'application/x-yaml' : 'application/json';
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadAsFile(exportContent, `form-export-${timestamp}.${ext}`, mime);
  };

  const handleImport = () => {
    setError(null);
    try {
      const { pages: importedPages, metadata: importedMetadata, elementMetadata: importedElementMetadata } = importFromContent(importContent);
      if (importedPages.length === 0) {
        setError('No valid pages found in the imported content');
        return;
      }
      onImport(importedPages, importedMetadata, importedElementMetadata);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse import content');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportContent(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportContent(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="import-export-modal-overlay" onClick={onClose}>
      <div
        className="import-export-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="import-export-modal-header">
          <h2 className="import-export-modal-title">
            {mode === 'import' ? (
              <>
                <Upload className="w-5 h-5" />
                Import Form
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export Form
              </>
            )}
          </h2>
          <button onClick={onClose} className="import-export-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="import-export-modal-content">
          {mode === 'export' ? (
            <>
              {/* Export format selector */}
              <div className="import-export-format-selector">
                <button
                  className={`import-export-format-btn ${exportFormat === 'yaml' ? 'active' : ''}`}
                  onClick={() => setExportFormat('yaml')}
                >
                  <FileText className="w-4 h-4" />
                  YAML
                </button>
                <button
                  className={`import-export-format-btn ${exportFormat === 'json' ? 'active' : ''}`}
                  onClick={() => setExportFormat('json')}
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </button>
              </div>

              {/* Export preview */}
              <div className="import-export-preview">
                <pre className="import-export-code">{exportContent}</pre>
              </div>

              {/* Export actions */}
              <div className="import-export-actions">
                <button onClick={handleCopy} className="import-export-btn secondary">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload} className="import-export-btn primary">
                  <Download className="w-4 h-4" />
                  Download {exportFormat.toUpperCase()}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Import drop zone */}
              <div
                className="import-export-dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p>Drop a file here or click to upload</p>
                <p className="text-xs text-gray-400">Supports YAML and JSON</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".yaml,.yml,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or paste content */}
              <div className="import-export-divider">
                <span>or paste content</span>
              </div>

              {/* Import textarea */}
              <textarea
                className="import-export-textarea"
                placeholder="Paste YAML or JSON content here..."
                value={importContent}
                onChange={(e) => {
                  setImportContent(e.target.value);
                  setError(null);
                }}
              />

              {/* Error display */}
              {error && (
                <div className="import-export-error">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Import actions */}
              <div className="import-export-actions">
                <button onClick={onClose} className="import-export-btn secondary">
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="import-export-btn primary"
                  disabled={!importContent.trim()}
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
