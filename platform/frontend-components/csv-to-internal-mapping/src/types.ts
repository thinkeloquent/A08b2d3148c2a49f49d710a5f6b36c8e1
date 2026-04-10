/* ── Mapping entry ─────────────────────────────────────────── */

export interface MappingEntry {
  /** Unique identifier for this mapping row. */
  id: number;
  /** The original CSV column header name. */
  csvHeader: string;
  /** The internal schema field this CSV header maps to. */
  mapsTo: string;
  /** Whether this mapping is locked (protected from auto-map). */
  locked: boolean;
  /** Human-readable description of this field (used in editable-metadata mode). */
  description?: string;
  /** Data type label, e.g. "string", "enum", "float" (used in editable-metadata mode). */
  fieldType?: string;
  /** Whether this field is required in the schema (used in editable-metadata mode). */
  required?: boolean;
}

/* ── Status variants ──────────────────────────────────────── */

export type MappingStatus = 'valid' | 'duplicate' | 'unmapped';

/* ── Schema field metadata ────────────────────────────────── */

export interface FieldMeta {
  /** Human-readable description of this field. */
  description: string;
  /** Data type label (e.g. "string", "enum", "float", "datetime", "semver"). */
  type: string;
  /** Whether this field is required in the schema. */
  required: boolean;
}

/* ── Component props ──────────────────────────────────────── */

export interface CsvMappingEditorProps {
  /** API endpoint URL that serves the same mapping JSON output. */
  apiEndpoint?: string;
  /** Available CSV column headers to choose from. */
  csvHeaders?: string[];
  /** Available internal field names for the Maps To dropdown. */
  availableFields?: string[];
  /** Schema metadata keyed by internal field name (mapsTo value). Read-only display. */
  fieldMeta?: Record<string, FieldMeta>;
  /** When true, render editable description/type/required columns per row (stored on MappingEntry). */
  editableMetadata?: boolean;
  /** Allowed field type options for the type dropdown (defaults to common types). */
  knownFieldTypes?: string[];
  /** Initial mapping rows to populate the editor with. */
  initialMappings?: MappingEntry[];
  /** Callback invoked whenever mappings change. */
  onChange?: (mappings: MappingEntry[]) => void;
  /** Callback invoked when a new mapping is saved. */
  onCreateMapping?: (mapping: Omit<MappingEntry, "id">) => void;
  /** When true, hide the right sidebar (Mapping Health + Quick Actions). */
  hideSidebar?: boolean;
  /** When true, show the "Bulk Insert" button next to Add Mapping. */
  showBulkInsert?: boolean;
}
