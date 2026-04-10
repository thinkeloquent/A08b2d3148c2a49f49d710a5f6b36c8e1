export type DatasourceCategory = 'infosec' | 'vulnerability' | 'dependency' | 'compliance' | 'performance' | 'custom' | (string & {});
export type DatasourceStatus = 'active' | 'archived' | 'deprecated';
export type InstanceStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface DatasourceTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DatasourceLabel {
  id: string;
  datasource_id: string;
  key: string;
  value: string;
}

export interface CsvDatasource {
  id: string;
  name: string;
  description: string | null;
  category: DatasourceCategory;
  status: DatasourceStatus;
  schema_contract: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  tags?: DatasourceTag[];
  labels?: DatasourceLabel[];
  instances?: CsvInstanceSummary[];
  created_at: string;
  updated_at: string;
}

export interface CsvInstanceSummary {
  id: string;
  label: string;
  file_name: string;
  row_count: number;
  status: InstanceStatus;
  instance_date: string | null;
  created_at: string;
}

export interface CsvInstance {
  id: string;
  datasource_id: string;
  label: string;
  file_name: string;
  file_size_bytes: number;
  row_count: number;
  column_count: number;
  instance_date: string | null;
  status: InstanceStatus;
  column_headers: string[];
  datasource?: { id: string; name: string; category: DatasourceCategory };
  created_at: string;
  updated_at: string;
}

export interface CsvPayload {
  id: string;
  instance_id: string;
  row_index: number;
  data: Record<string, string>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OffsetResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
