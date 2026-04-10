import type {
  Datasource,
  DatasourceCreatePayload,
  CsvUploadResult,
  UploadProgress,
} from './types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Datasource operations ───────────────────────────────────

export async function listDatasources(
  apiBase: string,
): Promise<{ items: Datasource[] }> {
  const res = await fetch(`${apiBase}/datasources?limit=100`);
  return handleResponse(res);
}

export async function createDatasource(
  apiBase: string,
  data: DatasourceCreatePayload,
): Promise<Datasource> {
  const res = await fetch(`${apiBase}/datasources`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── Instance / Upload operations ────────────────────────────

/**
 * Upload a CSV file using XMLHttpRequest for progress tracking.
 * Works for both small and large files — the browser streams
 * the FormData body and fires progress events as chunks are sent.
 */
export function uploadCsv(
  apiBase: string,
  datasourceId: string,
  file: File,
  label?: string,
  instanceDate?: string,
  onProgress?: (p: UploadProgress) => void,
): Promise<CsvUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    if (label) formData.append('label', label);
    if (instanceDate) formData.append('instance_date', instanceDate);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiBase}/datasources/${datasourceId}/instances`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          percent: Math.round((e.loaded / e.total) * 100),
          loaded: e.loaded,
          total: e.total,
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const body = JSON.parse(xhr.responseText);
          reject(new Error(body.message || `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.send(formData);
  });
}

export async function listInstances(
  apiBase: string,
  datasourceId: string,
): Promise<{ items: CsvUploadResult[] }> {
  const res = await fetch(`${apiBase}/datasources/${datasourceId}/instances?limit=5`);
  return handleResponse(res);
}
