/**
 * Minimal API client for csv-datasource-hub instance data.
 * Used internally by InstanceDataView to fetch instance metadata,
 * columns, and paginated payload data.
 */

const DEFAULT_API_BASE = '/~/api/csv-datasource';

export interface HubInstance {
  id: string;
  datasource_id: string;
  label: string;
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  column_headers: string[];
  instance_date: string | null;
  status: string;
}

export interface HubPayload {
  id: string;
  instance_id: string;
  row_index: number;
  data: Record<string, string>;
}

export interface HubOffsetResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface UpsertResult {
  updated: number;
  inserted: number;
  skipped: number;
  newRowCount: number;
  columns: string[];
}

async function request<T>(apiBase: string, path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function createHubApi(apiBase = DEFAULT_API_BASE) {
  return {
    getInstance: (instanceId: string) =>
      request<HubInstance>(apiBase, `/instances/${instanceId}`),

    getColumns: (instanceId: string) =>
      request<{ columns: string[] }>(apiBase, `/instances/${instanceId}/columns`),

    getData: (instanceId: string, offset = 0, limit = 50) =>
      request<HubOffsetResponse<HubPayload>>(
        apiBase,
        `/instances/${instanceId}/data?offset=${offset}&limit=${limit}`,
      ),

    getExportUrl: (instanceId: string, format: 'csv' | 'json') =>
      `${apiBase}/instances/${instanceId}/data/export?format=${format}`,

    upsertCsv: async (instanceId: string, file: File, matchColumns: string[], columnMapping?: Record<string, string>): Promise<UpsertResult> => {
      const form = new FormData();
      form.append('file', file);
      form.append('match_columns', JSON.stringify(matchColumns));
      if (columnMapping) form.append('column_mapping', JSON.stringify(columnMapping));
      const res = await fetch(`${apiBase}/instances/${instanceId}/upsert`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(body.message || `Upsert failed: ${res.status}`);
      }
      return res.json();
    },
  };
}
