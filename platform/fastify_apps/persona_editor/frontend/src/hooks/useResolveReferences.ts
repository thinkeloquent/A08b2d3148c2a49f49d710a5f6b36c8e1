/**
 * useResolveReferences Hook
 * Resolves [[id]] references in suggestion text and properties by fetching LLM defaults.
 */

import { useState, useEffect } from 'react';
import type { LLMDefault } from '../types/llm-default';
import { llmDefaultsApi, API_BASE_URL } from '../services/api';
import edgeTemplateRaw from '../../../../../common/apps/persona-editor/persona-prompt.edge-template.edge?raw';

export interface FetchStatus {
  id: string;
  status: 'success' | 'error';
  request: { method: string; url: string };
  response: { status: number; data?: unknown; error?: string };
}

/** Default Edge.js persona prompt template (loaded from common/) */
export const EDGE_TEMPLATE: string = edgeTemplateRaw;

const ID_REF_PATTERN = /^\[\[([^\]]+)\]\]$/;

function fmt(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return JSON.stringify(v, null, 2);
}

/** Build the template data context from properties + resolved entries */
export function buildTemplateContext(
  properties: Record<string, unknown>,
  entries: Record<string, LLMDefault>
): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (Array.isArray(value)) {
      ctx[key] = value.map((item) => {
        if (typeof item === 'string') {
          const m = item.match(ID_REF_PATTERN);
          if (m && entries[m[1]]) {
            const e = entries[m[1]];
            return { id: e.id, name: e.name, context: fmt(e.context), value: fmt(e.value) };
          }
        }
        return { name: String(item), context: String(item), value: String(item) };
      });
    } else if (typeof value === 'string') {
      const m = value.match(ID_REF_PATTERN);
      if (m && entries[m[1]]) {
        const e = entries[m[1]];
        ctx[key] = [{ id: e.id, name: e.name, context: fmt(e.context), value: fmt(e.value) }];
      } else {
        ctx[key] = value;
      }
    } else {
      ctx[key] = value;
    }
  }

  return ctx;
}

export function useResolveReferences(
  suggestion: string,
  properties: Record<string, unknown>
): {
  resolvedText: string;
  resolvedEntries: Record<string, LLMDefault>;
  fetchStatuses: FetchStatus[];
  isResolving: boolean;
} {
  const [resolvedText, setResolvedText] = useState('');
  const [resolvedEntries, setResolvedEntries] = useState<Record<string, LLMDefault>>({});
  const [fetchStatuses, setFetchStatuses] = useState<FetchStatus[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!suggestion) {
      setResolvedText('');
      setResolvedEntries({});
      setFetchStatuses([]);
      return;
    }

    const idPattern = /\[\[([^\]]+)\]\]/g;
    const suggestionIds = [...suggestion.matchAll(idPattern)].map((m) => m[1]);

    const propsIds: string[] = [];
    for (const val of Object.values(properties)) {
      const items = Array.isArray(val) ? val : val ? [val] : [];
      for (const item of items) {
        if (typeof item === 'string') {
          for (const m of item.matchAll(idPattern)) propsIds.push(m[1]);
        }
      }
    }

    const uniqueIds = [...new Set([...suggestionIds, ...propsIds])];

    if (uniqueIds.length === 0) {
      setResolvedText(suggestion);
      setResolvedEntries({});
      setFetchStatuses([]);
      return;
    }

    setIsResolving(true);
    const statuses: FetchStatus[] = [];
    const resolvedMap: Record<string, string> = {};
    const entriesMap: Record<string, LLMDefault> = {};

    Promise.allSettled(
      uniqueIds.map(async (id) => {
        const requestUrl = `${API_BASE_URL}/llm-defaults/${id}`;
        try {
          const entry = await llmDefaultsApi.getById(id);
          const content = typeof entry.context === 'string'
            ? entry.context
            : JSON.stringify(entry.context, null, 2);
          resolvedMap[id] = content;
          entriesMap[id] = entry;
          statuses.push({
            id,
            status: 'success',
            request: { method: 'GET', url: requestUrl },
            response: { status: 200, data: entry },
          });
        } catch (err: unknown) {
          resolvedMap[id] = `[[${id}]]`;
          const errObj = err as { status?: number; message?: string };
          statuses.push({
            id,
            status: 'error',
            request: { method: 'GET', url: requestUrl },
            response: {
              status: errObj?.status || 500,
              error: errObj?.message || String(err),
            },
          });
        }
      })
    ).then(() => {
      let resolved = suggestion;
      for (const [id, value] of Object.entries(resolvedMap)) {
        resolved = resolved.split(`[[${id}]]`).join(value);
      }
      setResolvedText(resolved);
      setResolvedEntries({ ...entriesMap });
      setFetchStatuses(statuses);
      setIsResolving(false);
    });
  }, [suggestion, properties]);

  return { resolvedText, resolvedEntries, fetchStatuses, isResolving };
}
