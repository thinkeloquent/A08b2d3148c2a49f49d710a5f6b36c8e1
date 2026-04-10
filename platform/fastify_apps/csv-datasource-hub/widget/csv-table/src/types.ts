// ── Widget props ────────────────────────────────────────────

export interface CsvTableWidgetProps {
  /** csv-datasource-hub instance ID to load data from */
  instanceId: string;
  /** API base path (defaults to /~/api/csv-datasource) */
  apiBase?: string;
  /** Page size for data fetching. Defaults to 50. */
  pageSize?: number;
}
