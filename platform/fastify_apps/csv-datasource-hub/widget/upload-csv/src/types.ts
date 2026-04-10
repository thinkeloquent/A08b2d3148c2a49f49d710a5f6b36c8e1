// ── Datasource ──────────────────────────────────────────────

export type DatasourceCategory =
  | 'infosec' | 'vulnerability' | 'dependency'
  | 'compliance' | 'performance' | 'custom';

export interface Datasource {
  id: string;
  name: string;
  description: string | null;
  category: DatasourceCategory;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatasourceCreatePayload {
  name: string;
  description?: string;
  category?: DatasourceCategory;
}

// ── Instance (upload result) ────────────────────────────────

export interface CsvUploadResult {
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
  created_at: string;
  updated_at: string;
}

// ── Upload progress ─────────────────────────────────────────

export interface UploadProgress {
  /** 0–100 */
  percent: number;
  loaded: number;
  total: number;
}

// ── Widget props ────────────────────────────────────────────

export interface CSVUploadWidgetProps {
  /**
   * Pre-selected datasource ID.
   * When provided the datasource selector is skipped.
   */
  datasourceId?: string;
  /** API base path (defaults to /~/api/csv-datasource) */
  apiBase?: string;
  /** Called after successful upload with the created instance */
  onSuccess: (result: CsvUploadResult) => void;
  /** Called on upload error */
  onError?: (error: Error) => void;
  /** Optional label placeholder text */
  labelPlaceholder?: string;
  /**
   * Default category when auto-creating a datasource.
   * Defaults to 'custom'.
   */
  defaultCategory?: DatasourceCategory;
}
