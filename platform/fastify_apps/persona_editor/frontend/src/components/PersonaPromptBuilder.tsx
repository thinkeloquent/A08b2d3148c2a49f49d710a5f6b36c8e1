/**
 * PersonaPromptBuilder
 * Prompt inspection UI with sub-views (Resolved, Template, Diff), copy, and apply.
 * Metadata and Fetch Log are shown as separate top-level page tabs.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import type { LLMDefault } from '../types/llm-default';
import { EDGE_TEMPLATE, buildTemplateContext } from '../hooks/useResolveReferences';
import { post } from '../services/api/client';

interface PersonaPromptBuilderProps {
  suggestion: string;
  properties: Record<string, unknown>;
  isResolving: boolean;
  resolvedEntries: Record<string, LLMDefault>;
  onApply: (rendered: string, template: string, data: Record<string, unknown>) => void;
}

/* ── helpers ─────────────────────────────────────────────── */

/** Convert a JS value to a simple YAML string. */
function toYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (value == null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (value.includes('\n')) return `|\n${value.split('\n').map((l) => `${pad}  ${l}`).join('\n')}`;
    if (/[:#{}[\],&*?|>!%@`]/.test(value) || value === '') return JSON.stringify(value);
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map((item) => {
      const inner = toYaml(item, indent + 1);
      return typeof item === 'object' && item !== null
        ? `${pad}- ${inner.trimStart()}`
        : `${pad}- ${inner}`;
    }).join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries.map(([k, v]) => {
      const inner = toYaml(v, indent + 1);
      if (typeof v === 'object' && v !== null && !Array.isArray(v))
        return `${pad}${k}:\n${inner}`;
      if (Array.isArray(v) && v.length > 0)
        return `${pad}${k}:\n${inner}`;
      return `${pad}${k}: ${inner}`;
    }).join('\n');
  }
  return String(value);
}

/* ── copy button ─────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

/* ── main component ──────────────────────────────────────── */

const PROMPT_VIEWS = ['Resolved', 'Template'] as const;

export function PersonaPromptBuilder({
  suggestion,
  properties,
  isResolving,
  resolvedEntries,
  onApply,
}: PersonaPromptBuilderProps) {
  const [promptView, setPromptView] = useState(0);

  /* ── editable Edge.js template + rendered output ── */
  const [edgeTemplate, setEdgeTemplate] = useState(EDGE_TEMPLATE);
  const [renderedTemplate, setRenderedTemplate] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const renderTimer = useRef<ReturnType<typeof setTimeout>>();

  // Re-render when template text or resolved entries change (debounced)
  useEffect(() => {
    if (isResolving || Object.keys(resolvedEntries).length === 0) return;

    clearTimeout(renderTimer.current);
    renderTimer.current = setTimeout(async () => {
      setIsRendering(true);
      try {
        const data = buildTemplateContext(properties, resolvedEntries);
        const result = await post<{ rendered: string }>('/render-template', {
          template: edgeTemplate,
          data,
        });
        setRenderedTemplate(result.rendered);
      } catch {
        setRenderedTemplate('[template render error]');
      }
      setIsRendering(false);
    }, 400);

    return () => clearTimeout(renderTimer.current);
  }, [edgeTemplate, resolvedEntries, properties, isResolving]);

  /* ── template data context as YAML ── */
  const templateContextYaml = useMemo(() => {
    if (Object.keys(resolvedEntries).length === 0) return '';
    const ctx = buildTemplateContext(properties, resolvedEntries);
    return toYaml(ctx);
  }, [properties, resolvedEntries]);

  return (
    <div className="space-y-0">
      {/* Pill switcher */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-lg p-1 w-fit">
        {PROMPT_VIEWS.map((view, idx) => (
          <button
            key={view}
            type="button"
            onClick={() => setPromptView(idx)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              promptView === idx
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Resolved view — rendered Edge.js template output */}
      {promptView === 0 && (
        <div>
          {isResolving ? (
            <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Resolving [[id]] references...
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <CopyButton text={renderedTemplate} />
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 pr-20 text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-96">
                {renderedTemplate}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Template view — editable Edge.js template */}
      {promptView === 1 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded">
              Edge.js
            </span>
            <CopyButton text={edgeTemplate} />
            {edgeTemplate !== EDGE_TEMPLATE && (
              <button
                type="button"
                onClick={() => setEdgeTemplate(EDGE_TEMPLATE)}
                className="px-2 py-0.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset
              </button>
            )}
            {isRendering && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Rendering...
              </span>
            )}
          </div>
          <textarea
            value={edgeTemplate}
            onChange={(e) => setEdgeTemplate(e.target.value)}
            spellCheck={false}
            className="w-full font-mono bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-800 overflow-y-auto resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '12rem', maxHeight: '24rem' }}
          />

          {/* Template data context in YAML */}
          {Object.keys(resolvedEntries).length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">Template Data</span>
                <CopyButton text={templateContextYaml} />
              </div>
              <pre className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs font-mono text-amber-900 whitespace-pre-wrap overflow-y-auto max-h-64">
                {templateContextYaml}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── Apply footer ── */}
      <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          disabled={!suggestion}
          onClick={() => {
            const data = buildTemplateContext(properties, resolvedEntries);
            onApply(renderedTemplate || suggestion, edgeTemplate, data);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Generate Persona Prompt
        </button>
      </div>
    </div>
  );
}
