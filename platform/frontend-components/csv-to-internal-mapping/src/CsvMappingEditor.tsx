import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import type { MappingEntry, FieldMeta, CsvMappingEditorProps } from "./types";

/* ─── Design Tokens ─── */
const T = {
  bg: "#f8f9fb",
  surface: "#ffffff",
  surfaceHover: "#f1f3f7",
  border: "#e2e6ed",
  borderLight: "#edf0f4",
  text: "#1a1f36",
  textSecondary: "#5e6278",
  textTertiary: "#9ca3b8",
  accent: "#5b5fc7",
  accentHover: "#4b4fb7",
  accentLight: "#eef0ff",
  accentBorder: "#d4d6f9",
  success: "#16a34a",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
  warning: "#d97706",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  radius: "10px",
  radiusSm: "7px",
  radiusLg: "14px",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
  shadowMd: "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  shadowLg: "0 12px 40px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.03)",
  font: "'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontMono: "'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace",
};

const INITIAL_MAPPINGS: MappingEntry[] = [
  { id: 1, csvHeader: "VulnerabilityID", mapsTo: "vulnerabilityId", locked: false },
  { id: 2, csvHeader: "PkgName", mapsTo: "packageName", locked: false },
  { id: 3, csvHeader: "InstalledVersion", mapsTo: "targetVersion", locked: false },
  { id: 4, csvHeader: "Severity", mapsTo: "severity", locked: false },
  { id: 5, csvHeader: "Title", mapsTo: "componentName", locked: false },
  { id: 6, csvHeader: "Target", mapsTo: "filePath", locked: false },
];

const AVAILABLE_FIELDS = [
  "vulnerabilityId", "packageName", "targetVersion", "severity",
  "componentName", "filePath", "description", "fixedVersion",
  "installedVersion", "cveId", "cvssScore", "publishedDate",
];

/* ─── SVG Icon Set ─── */
const I = {
  Lock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Arrow: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="14 7 19 12 14 17" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Warn: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Schema: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="8" height="6" rx="1.5" /><rect x="14" y="3" width="8" height="6" rx="1.5" />
      <rect x="8" y="15" width="8" height="6" rx="1.5" />
      <path d="M6 9v2a2 2 0 0 0 2 2h2" /><path d="M18 9v2a2 2 0 0 1-2 2h-2" /><path d="M12 13v2" />
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

/* ─── Hover helper ─── */
function useHover(): [boolean, { onMouseEnter: () => void; onMouseLeave: () => void }] {
  const [h, setH] = useState(false);
  return [h, { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) }];
}

/* ─── Status config ─── */
const STATUS_CFG = {
  valid:     { label: "Valid",     desc: "Mapped to a unique field",    color: T.success, icon: <I.Check /> },
  duplicate: { label: "Duplicate", desc: "Field or header used twice", color: T.danger,  icon: <I.Warn /> },
  unmapped:  { label: "Unmapped",  desc: "No target field assigned",   color: T.warning, icon: <I.Warn /> },
} as const;

function getStatusKey(mapping: MappingEntry, allMappings: MappingEntry[]): keyof typeof STATUS_CFG {
  if (!mapping.mapsTo.trim()) return "unmapped";
  const isDupTarget = allMappings.filter((m) => m.mapsTo === mapping.mapsTo).length > 1;
  const isDupHeader = allMappings.filter((m) => m.csvHeader === mapping.csvHeader).length > 1;
  return isDupTarget || isDupHeader ? "duplicate" : "valid";
}

/* ─── Status Badge (icon-only dot) ─── */
function StatusBadge({ mapping, allMappings }: { mapping: MappingEntry; allMappings: MappingEntry[] }) {
  const cfg = STATUS_CFG[getStatusKey(mapping, allMappings)];
  return (
    <span
      title={cfg.label}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", color: cfg.color }}
    >
      {cfg.icon}
    </span>
  );
}

/* ─── Status Legend ─── */
function StatusLegend() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "14px" }}>
      {(Object.keys(STATUS_CFG) as (keyof typeof STATUS_CFG)[]).map((k) => {
        const s = STATUS_CFG[k];
        return (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: T.textSecondary }}>
            <span style={{ display: "inline-flex", color: s.color }}>{s.icon}</span>
            <span style={{ fontWeight: 600 }}>{s.label}</span>
            <span style={{ color: T.textTertiary }}>&mdash; {s.desc}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ─── Type Colors (for schema metadata badges) ─── */
const TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  string:   { color: "#2563EB", bg: "#EFF6FF" },
  semver:   { color: "#7C3AED", bg: "#F5F3FF" },
  enum:     { color: "#D97706", bg: "#FFFBEB" },
  datetime: { color: "#DB2777", bg: "#FDF2F8" },
  float:    { color: "#0D9488", bg: "#F0FDFA" },
};

function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] ?? { color: "#71717A", bg: "#F4F4F5" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: "20px",
      fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em",
      color: c.color, background: c.bg,
    }}>{type}</span>
  );
}

function RequiredBadge({ required }: { required: boolean }) {
  return required ? (
    <span style={{
      fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
      padding: "2px 6px", borderRadius: "4px",
      color: "#DC2626", background: "#FEF2F2",
    }}>REQ</span>
  ) : (
    <span style={{
      fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em",
      padding: "2px 6px", borderRadius: "4px",
      color: "#A1A1AA", background: "#F4F4F5",
    }}>OPT</span>
  );
}

/* ─── Grid column templates ─── */
const GRID_BASE = "2rem 1fr 2.5rem 1fr";
const GRID_META = " 1.3fr auto auto";
const GRID_EDITABLE_META = " 1.3fr 6rem 3.2rem";
const GRID_TAIL = " 7rem 2.2rem 2.2rem";

function gridCols(hasMeta: boolean, editableMeta?: boolean) {
  if (editableMeta) return GRID_BASE + GRID_EDITABLE_META + GRID_TAIL;
  return hasMeta ? GRID_BASE + GRID_META + GRID_TAIL : GRID_BASE + GRID_TAIL;
}

/* ─── Zod schemas for bulk-insert validation ─── */
const JsonMappingSchema = z.record(z.string().min(1), z.string().min(1, "Value must not be empty"));
const JsonArraySchema = z.array(z.string().min(1)).min(1);

type BulkMappingResult = { pairs: [string, string][]; error: string | null };

/** Parse bulk header input. Supports:
 *  - Comma: "col1, col2, col3" → csvHeader only, mapsTo empty
 *  - JSON object: {"col1":"field1"} → csvHeader:mapsTo pairs (validated with Zod)
 *  - JSON array: ["col1","col2"] → csvHeader only (validated with Zod)
 *  - YAML list: "- col1\n- col2" → csvHeader only
 *  - YAML map: "col1: field1\ncol2: field2" → csvHeader:mapsTo pairs (validated) */
function parseBulkMappings(input: string): BulkMappingResult {
  const trimmed = input.trim();
  if (!trimmed) return { pairs: [], error: null };

  // Try JSON
  try {
    const parsed = JSON.parse(trimmed);

    // JSON object → key:value pairs
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const result = JsonMappingSchema.safeParse(parsed);
      if (!result.success) {
        const issue = result.error.issues[0];
        return { pairs: [], error: `Invalid JSON mapping: ${issue.path.length ? `"${issue.path[0]}": ` : ''}${issue.message}` };
      }
      const pairs: [string, string][] = Object.entries(result.data).map(([k, v]) => [k.trim(), v.trim()]);
      return { pairs, error: null };
    }

    // JSON array → bare headers
    if (Array.isArray(parsed)) {
      const result = JsonArraySchema.safeParse(parsed);
      if (!result.success) {
        return { pairs: [], error: 'JSON array must contain non-empty strings' };
      }
      const pairs: [string, string][] = result.data.map(h => [h.trim(), '']);
      return { pairs, error: null };
    }

    return { pairs: [], error: 'Expected a JSON object or array' };
  } catch { /* not JSON — try YAML / comma */ }

  // Try YAML list (- item)
  if (/^-\s/m.test(trimmed)) {
    const items = trimmed.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim().replace(/^-\s*/, '').trim()).filter(Boolean);
    if (items.length > 0) return { pairs: items.map(h => [h, '']), error: null };
  }

  // Try YAML map (key: value)
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  const hasColons = lines.every(l => l.includes(':'));
  if (hasColons && lines.length > 0) {
    const pairs: [string, string][] = [];
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (!match) return { pairs: [], error: `Invalid YAML line (expected "key: value"): "${line}"` };
      const key = match[1].trim();
      const val = match[2].trim();
      if (!key) return { pairs: [], error: `Empty key in line: "${line}"` };
      if (!val) return { pairs: [], error: `Empty value for key "${key}"` };
      pairs.push([key, val]);
    }
    return { pairs, error: null };
  }

  // Comma-separated bare headers
  const items = trimmed.split(',').map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return { pairs: [], error: 'No headers found' };
  return { pairs: items.map(h => [h, '']), error: null };
}

/* ─── Clipboard Paste Icon ─── */
const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

/* ─── Suggest mapsTo from CSV header ─── */

/** Convert a string to camelCase: "PackageName" → "packageName", "VulnerabilityID" → "vulnerabilityId", "git_repo" → "gitRepo" */
function toCamelCase(s: string): string {
  // Split on underscores, hyphens, spaces, or PascalCase word boundaries
  const parts = s
    .replace(/[-_\s]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean);
  if (parts.length === 0) return s;
  return parts
    .map((p, i) => i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

function suggestMapsTo(csvHeader: string, availableFields: string[]): string | null {
  if (!csvHeader) return null;
  const lower = csvHeader.toLowerCase();
  const match = availableFields.find((f) => f.toLowerCase() === lower);
  if (match) return match;
  const camel = toCamelCase(csvHeader);
  // Check if the camelCase version matches an available field (case-insensitive)
  const camelMatch = availableFields.find((f) => f.toLowerCase() === camel.toLowerCase());
  if (camelMatch) return camelMatch;
  return camel !== csvHeader ? camel : null;
}

/* ─── Mapping Row ─── */
const DEFAULT_FIELD_TYPES = ["string", "semver", "enum", "datetime", "float"];

function MappingRow({ mapping, index, onUpdate, onRemove, onToggleLock, onSave, allMappings, csvHeaders, availableFields, fieldMeta, editableMetadata, knownFieldTypes, isNew, unsaved }: {
  mapping: MappingEntry;
  index: number;
  onUpdate: (id: number, field: keyof MappingEntry, value: string | boolean) => void;
  onRemove: (id: number) => void;
  onToggleLock: (id: number) => void;
  onSave?: (id: number) => void;
  allMappings: MappingEntry[];
  csvHeaders: string[];
  availableFields: string[];
  fieldMeta?: Record<string, FieldMeta>;
  editableMetadata?: boolean;
  knownFieldTypes?: string[];
  isNew: boolean;
  unsaved: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const [hov, hovBind] = useHover();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMeta = !!fieldMeta;
  const meta = fieldMeta?.[mapping.mapsTo];
  const fieldTypes = knownFieldTypes ?? DEFAULT_FIELD_TYPES;
  const suggestion = !mapping.mapsTo.trim() ? suggestMapsTo(mapping.csvHeader, availableFields) : null;

  const filtered = availableFields.filter(
    (f) => f.toLowerCase().includes(mapping.mapsTo.toLowerCase()) && f !== mapping.mapsTo
  );

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  return (
    <>
      <div
        {...hovBind}
        style={{
          display: "grid",
          gridTemplateColumns: gridCols(hasMeta, editableMetadata),
          alignItems: "center", gap: "12px",
          padding: "14px 20px",
          borderBottom: unsaved ? "none" : `1px solid ${T.borderLight}`,
          background: hov ? T.surfaceHover : isNew ? T.accentLight : T.surface,
          transition: "background 0.2s ease",
        }}
      >
        <span style={{ fontSize: "12px", color: T.textTertiary, fontWeight: 500, textAlign: "center", fontFamily: T.fontMono }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <select
            value={mapping.csvHeader}
            onChange={(e) => onUpdate(mapping.id, "csvHeader", e.target.value)}
            disabled={mapping.locked}
            style={{
              padding: "6px 14px", borderRadius: T.radiusSm,
              fontSize: "13px", fontFamily: T.fontMono, fontWeight: 500,
              color: T.text, background: "#f3f4f8",
              border: `1px solid ${T.border}`, letterSpacing: "-0.01em",
              cursor: mapping.locked ? "default" : "pointer",
              appearance: "auto",
            }}
          >
            {!csvHeaders.includes(mapping.csvHeader) && (
              <option value={mapping.csvHeader}>{mapping.csvHeader}</option>
            )}
            {csvHeaders.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "center", color: mapping.locked ? T.accent : T.textTertiary, transition: "color 0.2s" }}>
          <I.Arrow />
        </div>

        <div style={{ position: "relative" }}>
          {editing && !mapping.locked ? (
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={mapping.mapsTo}
                onChange={(e) => { onUpdate(mapping.id, "mapsTo", e.target.value); setShowSugg(true); }}
                onBlur={() => setTimeout(() => { setEditing(false); setShowSugg(false); }, 150)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") { setEditing(false); setShowSugg(false); } }}
                style={{
                  width: "100%", padding: "6px 12px", borderRadius: T.radiusSm,
                  fontSize: "13px", fontFamily: T.fontMono,
                  border: `2px solid ${T.accent}`, outline: "none",
                  background: T.surface, color: T.accent,
                  boxShadow: `0 0 0 3px ${T.accentLight}`,
                }}
              />
              {showSugg && filtered.length > 0 && (
                <div style={{
                  position: "absolute", zIndex: 50, marginTop: "4px",
                  width: "100%", borderRadius: T.radius,
                  border: `1px solid ${T.border}`, background: T.surface,
                  boxShadow: T.shadowLg, overflow: "hidden",
                }}>
                  {filtered.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onMouseDown={(e) => { e.preventDefault(); onUpdate(mapping.id, "mapsTo", s); setEditing(false); setShowSugg(false); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "8px 14px", fontSize: "13px", fontFamily: T.fontMono,
                        color: T.textSecondary, background: "transparent", border: "none", cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => !mapping.locked && setEditing(true)}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px", borderRadius: T.radiusSm,
                fontSize: "13px", fontFamily: T.fontMono, fontWeight: 500,
                color: T.accent, background: T.accentLight,
                border: `1px solid ${T.accentBorder}`,
                cursor: mapping.locked ? "default" : "pointer",
                transition: "all 0.15s ease", opacity: mapping.locked ? 0.7 : 1,
              }}
            >
              {mapping.mapsTo || (suggestion ? (
                <span
                  style={{ color: T.textTertiary, fontFamily: T.fontMono, cursor: "pointer" }}
                  title={`Click to accept suggestion: ${suggestion}`}
                  onClick={(e) => { e.stopPropagation(); onUpdate(mapping.id, "mapsTo", suggestion); }}
                >
                  <span style={{ fontStyle: "italic", fontFamily: T.font, fontSize: "12px", marginRight: "6px" }}>suggest:</span>{suggestion}
                </span>
              ) : <span style={{ color: T.textTertiary, fontStyle: "italic", fontFamily: T.font }}>click to map...</span>)}
            </button>
          )}
        </div>

        {/* Schema metadata columns — read-only from fieldMeta lookup */}
        {hasMeta && !editableMetadata && (
          <>
            <span style={{ fontSize: "12.5px", color: meta ? T.textSecondary : T.textTertiary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {meta?.description ?? "—"}
            </span>
            <span>{meta ? <TypeBadge type={meta.type} /> : <span style={{ color: T.textTertiary, fontSize: "11px" }}>—</span>}</span>
            <span>{meta ? <RequiredBadge required={meta.required} /> : <span style={{ color: T.textTertiary, fontSize: "11px" }}>—</span>}</span>
          </>
        )}

        {/* Editable metadata columns — stored on MappingEntry */}
        {editableMetadata && (
          <>
            <input
              type="text"
              value={mapping.description ?? ""}
              onChange={(e) => onUpdate(mapping.id, "description", e.target.value)}
              disabled={mapping.locked}
              placeholder="Field description"
              style={{
                padding: "5px 10px", borderRadius: T.radiusSm,
                fontSize: "12.5px", color: T.text, background: "#f3f4f8",
                border: `1px solid ${T.border}`,
                cursor: mapping.locked ? "default" : "text",
                opacity: mapping.locked ? 0.7 : 1,
              }}
            />
            <select
              value={mapping.fieldType ?? "string"}
              onChange={(e) => onUpdate(mapping.id, "fieldType", e.target.value)}
              disabled={mapping.locked}
              style={{
                padding: "5px 8px", borderRadius: T.radiusSm,
                fontSize: "11px", fontWeight: 600, color: T.textSecondary,
                background: "#f3f4f8", border: `1px solid ${T.border}`,
                cursor: mapping.locked ? "default" : "pointer",
                appearance: "auto",
              }}
            >
              {fieldTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <input
                type="checkbox"
                checked={mapping.required ?? true}
                onChange={(e) => onUpdate(mapping.id, "required", e.target.checked)}
                disabled={mapping.locked}
                style={{ width: "15px", height: "15px", cursor: mapping.locked ? "default" : "pointer", accentColor: T.accent }}
              />
            </div>
          </>
        )}

        <StatusBadge mapping={mapping} allMappings={allMappings} />

        <button
          onClick={() => onToggleLock(mapping.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "30px", height: "30px", borderRadius: T.radiusSm,
            border: "none", cursor: "pointer",
            color: mapping.locked ? T.accent : T.textTertiary,
            background: mapping.locked ? T.accentLight : "transparent",
            transition: "all 0.15s",
          }}
          title={mapping.locked ? "Unlock mapping" : "Lock mapping"}
        >
          {mapping.locked ? <I.Lock /> : <I.Unlock />}
        </button>

        <button
          onClick={() => onRemove(mapping.id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "30px", height: "30px", borderRadius: T.radiusSm,
            border: "none", cursor: "pointer",
            color: T.textTertiary, background: "transparent",
            opacity: hov ? 1 : 0, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.danger; e.currentTarget.style.background = T.dangerBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = T.textTertiary; e.currentTarget.style.background = "transparent"; }}
          title="Remove mapping"
        >
          <I.Trash />
        </button>
      </div>

      {unsaved && onSave && (
        <div style={{
          display: "flex", justifyContent: "flex-end",
          padding: "8px 20px",
          borderBottom: `1px solid ${T.borderLight}`,
          background: T.successBg,
        }}>
          <button
            onClick={() => onSave(mapping.id)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 16px", borderRadius: T.radiusSm,
              fontSize: "12px", fontWeight: 600, color: "#fff",
              background: T.success, border: "none", cursor: "pointer",
              transition: "all 0.15s",
            }}
            title="Save mapping"
          >
            <I.Check /> Save Mapping
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Stats Panel (sidebar widget) ─── */
function StatsPanel({ mappings }: { mappings: MappingEntry[] }) {
  const valid = mappings.filter((m) => {
    const dupTarget = mappings.filter((o) => o.mapsTo === m.mapsTo).length > 1;
    const dupHeader = mappings.filter((o) => o.csvHeader === m.csvHeader).length > 1;
    return m.mapsTo.trim() && !dupTarget && !dupHeader;
  }).length;
  const dupTargets = new Set(mappings.map((m) => m.mapsTo).filter((v, i, a) => v && a.indexOf(v) !== i));
  const dupHeaders = new Set(mappings.map((m) => m.csvHeader).filter((v, i, a) => v && a.indexOf(v) !== i));
  const dupes = new Set([...dupTargets, ...dupHeaders]).size;
  const unmapped = mappings.filter((m) => !m.mapsTo.trim()).length;
  const locked = mappings.filter((m) => m.locked).length;
  const pct = mappings.length ? Math.round((valid / mappings.length) * 100) : 0;

  const items = [
    { label: "Valid", value: valid, color: T.success, bg: T.successBg },
    { label: "Duplicates", value: dupes, color: T.danger, bg: T.dangerBg },
    { label: "Unmapped", value: unmapped, color: T.warning, bg: T.warningBg },
    { label: "Locked", value: locked, color: T.accent, bg: T.accentLight },
  ];

  return (
    <div style={{ background: T.surface, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
        Mapping Health
      </div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: T.text, fontFamily: T.font }}>{pct}%</span>
          <span style={{ fontSize: "12px", color: T.textTertiary }}>{valid}/{mappings.length} fields</span>
        </div>
        <div style={{ height: "6px", borderRadius: "3px", background: "#edf0f4", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "3px", width: `${pct}%`,
            background: pct === 100 ? T.success : `linear-gradient(90deg, ${T.accent}, #818cf8)`,
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {items.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: T.radiusSm, background: s.bg }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: T.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: T.textSecondary, marginTop: "1px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── JSON Preview ─── */
function JsonPreview({ mappings, apiEndpoint }: { mappings: MappingEntry[]; apiEndpoint?: string }) {
  const [copied, setCopied] = useState(false);
  const hasEditableMeta = mappings.some((m) => m.description != null || m.fieldType != null || m.required != null);
  const obj: Record<string, unknown> = {};
  mappings.forEach((m) => {
    if (!m.mapsTo.trim()) return;
    if (hasEditableMeta) {
      obj[m.csvHeader] = { mapsTo: m.mapsTo, description: m.description ?? "", type: m.fieldType ?? "string", required: m.required ?? true };
    } else {
      obj[m.csvHeader] = m.mapsTo;
    }
  });
  const json = JSON.stringify(obj, null, 2);
  const handleCopy = () => { navigator.clipboard.writeText(json).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };

  return (
    <div style={{ background: T.surface, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${T.borderLight}` }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Generated Schema Map
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "4px 10px", borderRadius: T.radiusSm,
            fontSize: "12px", fontWeight: 500,
            color: copied ? T.success : T.textSecondary,
            background: "transparent", border: `1px solid ${T.borderLight}`,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {copied ? <I.Check /> : <I.Copy />} {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>
      <pre style={{
        padding: "16px 20px", margin: 0,
        fontSize: "12.5px", fontFamily: T.fontMono, lineHeight: 1.7,
        color: T.accent, background: "#fafbfe", overflowX: "auto",
      }}>
        {json}
      </pre>
      {apiEndpoint && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "14px 20px",
          borderTop: `1px solid ${T.borderLight}`, background: "#fafbfe",
        }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
            API Endpoint
          </span>
          <code style={{
            flex: 1, padding: "6px 12px", borderRadius: T.radiusSm,
            fontSize: "12.5px", fontFamily: T.fontMono,
            color: T.accent, background: T.accentLight,
            border: `1px solid ${T.accentBorder}`,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {apiEndpoint}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(apiEndpoint)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "4px 10px", borderRadius: T.radiusSm,
              fontSize: "12px", fontWeight: 500, color: T.textSecondary,
              background: "transparent", border: `1px solid ${T.borderLight}`,
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <I.Copy /> Copy
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ Main ═══════════════ */
export function CsvMappingEditor({ apiEndpoint, csvHeaders = [], availableFields, fieldMeta, editableMetadata, knownFieldTypes, initialMappings, onChange, onCreateMapping, hideSidebar, showBulkInsert: showBulkInsertBtn }: CsvMappingEditorProps) {
  const resolvedFields = availableFields ?? AVAILABLE_FIELDS;
  const [mappings, setMappings] = useState<MappingEntry[]>(initialMappings ?? INITIAL_MAPPINGS);
  const [newRowId, setNewRowId] = useState<number | null>(null);
  const [unsavedIds, setUnsavedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const nextId = useRef((initialMappings ?? INITIAL_MAPPINGS).length + 1);
  const hasMeta = !!fieldMeta || !!editableMetadata;

  // Sync from parent when initialMappings changes
  useEffect(() => {
    if (initialMappings) {
      setMappings(initialMappings);
      nextId.current = initialMappings.length + 1;
    }
  }, [initialMappings]);

  const setMappingsAndNotify = useCallback((updater: MappingEntry[] | ((prev: MappingEntry[]) => MappingEntry[])) => {
    setMappings((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const handleUpdate = useCallback((id: number, field: keyof MappingEntry, value: string | boolean) => {
    setMappingsAndNotify((p) => p.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }, [setMappingsAndNotify]);
  const handleRemove = useCallback((id: number) => { setMappingsAndNotify((p) => p.filter((m) => m.id !== id)); }, [setMappingsAndNotify]);
  const handleToggleLock = useCallback((id: number) => { setMappingsAndNotify((p) => p.map((m) => (m.id === id ? { ...m, locked: !m.locked } : m))); }, [setMappingsAndNotify]);

  const handleAdd = () => {
    const id = nextId.current++;
    const entry: MappingEntry = { id, csvHeader: csvHeaders[0] ?? "", mapsTo: "", locked: false };
    if (editableMetadata) { entry.description = ""; entry.fieldType = "string"; entry.required = true; }
    setMappingsAndNotify((p) => [...p, entry]);
    setUnsavedIds((p) => new Set(p).add(id));
    setNewRowId(id);
    setTimeout(() => setNewRowId(null), 1200);
  };

  const handleSave = useCallback((id: number) => {
    const mapping = mappings.find((m) => m.id === id);
    if (mapping && onCreateMapping) {
      const { id: _, ...rest } = mapping;
      onCreateMapping(rest);
    }
    setUnsavedIds((p) => { const next = new Set(p); next.delete(id); return next; });
  }, [mappings, onCreateMapping]);

  const bulkParsed = bulkText.trim() ? parseBulkMappings(bulkText) : { pairs: [], error: null };
  const handleBulkInsert = () => {
    if (bulkParsed.error || bulkParsed.pairs.length === 0) return;
    const newEntries: MappingEntry[] = bulkParsed.pairs.map(([csvHeader, mapsTo]) => {
      const id = nextId.current++;
      const entry: MappingEntry = { id, csvHeader, mapsTo, locked: false };
      if (editableMetadata) { entry.description = ""; entry.fieldType = "string"; entry.required = true; }
      return entry;
    });
    setMappingsAndNotify((p) => [...p, ...newEntries]);
    setBulkText("");
    setBulkOpen(false);
  };

  const tabs = [{ key: "editor" as const, label: "Mapping Editor" }, { key: "preview" as const, label: "Mapping Export" }];

  return (
    <div style={{ width: "100%", background: T.bg, fontFamily: T.font }}>
      <div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: hideSidebar ? "1fr" : "1fr 260px", gap: "20px", alignItems: "start" }}>

          {/* Left: Editor */}
          <div>
            <div style={{ display: "inline-flex", borderRadius: T.radiusSm, background: "#eef0f4", padding: "3px", marginBottom: "16px" }}>
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  padding: "7px 16px", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                  color: activeTab === t.key ? T.text : T.textTertiary,
                  background: activeTab === t.key ? T.surface : "transparent",
                  boxShadow: activeTab === t.key ? T.shadow : "none",
                  transition: "all 0.15s",
                }}>{t.label}</button>
              ))}
            </div>

            {activeTab === "editor" && (
              <div style={{ marginBottom: "10px" }}><StatusLegend /></div>
            )}

            {activeTab === "editor" ? (
              <div style={{ background: T.surface, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: gridCols(hasMeta, editableMetadata),
                  alignItems: "center", gap: "12px", padding: "12px 20px",
                  borderBottom: `1px solid ${T.border}`, background: "#fafbfd",
                }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textAlign: "center" }}>#</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>CSV Header</span>
                  <span />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Maps To</span>
                  {hasMeta && (
                    <>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Description</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Type</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Req</span>
                    </>
                  )}
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</span>
                  <span /><span />
                </div>

                {mappings.map((m, i) => (
                  <MappingRow key={m.id} mapping={m} index={i} onUpdate={handleUpdate} onRemove={handleRemove}
                    onToggleLock={handleToggleLock} onSave={handleSave} allMappings={mappings}
                    csvHeaders={csvHeaders} availableFields={resolvedFields} fieldMeta={fieldMeta}
                    editableMetadata={editableMetadata} knownFieldTypes={knownFieldTypes}
                    isNew={m.id === newRowId} unsaved={unsavedIds.has(m.id)} />
                ))}

                <div style={{ display: "flex", borderTop: `1px solid ${T.borderLight}` }}>
                  <button onClick={handleAdd} style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "8px", flex: 1, padding: "14px",
                    fontSize: "13px", fontWeight: 600, color: T.textTertiary,
                    background: "transparent", border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentLight; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.textTertiary; e.currentTarget.style.background = "transparent"; }}
                  >
                    <I.Plus /> Add mapping
                  </button>
                  {showBulkInsertBtn && (
                    <button onClick={() => setBulkOpen(!bulkOpen)} style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "6px", padding: "14px 20px",
                      fontSize: "13px", fontWeight: 600,
                      color: bulkOpen ? T.accent : T.textTertiary,
                      background: bulkOpen ? T.accentLight : "transparent",
                      border: "none", borderLeft: `1px solid ${T.borderLight}`, cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { if (!bulkOpen) { e.currentTarget.style.color = T.accent; e.currentTarget.style.background = T.accentLight; } }}
                    onMouseLeave={(e) => { if (!bulkOpen) { e.currentTarget.style.color = T.textTertiary; e.currentTarget.style.background = "transparent"; } }}
                    >
                      <ClipboardIcon /> Bulk Insert
                    </button>
                  )}
                </div>
                {showBulkInsertBtn && bulkOpen && (
                  <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.borderLight}`, background: "#fafbfe" }}>
                    <p style={{ fontSize: "12px", color: T.textSecondary, marginBottom: "8px" }}>
                      Paste headers as <strong>comma-separated</strong>, <strong>JSON array</strong>, <strong>YAML list</strong>, or as <strong>JSON object</strong> / <strong>YAML map</strong> with mappings:
                    </p>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={'cve_id, severity, package\n\n{"cve_id": "vulnerabilityId", "severity": "severity"}\n\ncve_id: vulnerabilityId\nseverity: severity'}
                      rows={4}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: T.radiusSm,
                        fontSize: "13px", fontFamily: T.fontMono,
                        border: `1px solid ${bulkParsed.error ? T.danger : T.border}`, background: T.surface,
                        color: T.text, resize: "vertical", outline: "none",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = bulkParsed.error ? T.danger : T.accent;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${bulkParsed.error ? T.dangerBg : T.accentLight}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = bulkParsed.error ? T.danger : T.border;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    {bulkText.trim() && bulkParsed.error && (
                      <p style={{ fontSize: "11px", color: T.danger, marginTop: "6px" }}>
                        {bulkParsed.error}
                      </p>
                    )}
                    {bulkText.trim() && !bulkParsed.error && bulkParsed.pairs.length > 0 && (
                      <p style={{ fontSize: "11px", color: T.success, marginTop: "6px" }}>
                        {bulkParsed.pairs.length} mapping(s) ready &mdash; {bulkParsed.pairs.filter(([, v]) => v).length} with target field
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={handleBulkInsert}
                        disabled={!bulkText.trim() || !!bulkParsed.error || bulkParsed.pairs.length === 0}
                        style={{
                          display: "flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: T.radiusSm,
                          fontSize: "13px", fontWeight: 600, color: "#fff",
                          background: T.accent, border: "none", cursor: "pointer",
                          opacity: (!bulkText.trim() || !!bulkParsed.error) ? 0.5 : 1,
                        }}
                      >
                        <I.Plus /> Insert Mappings
                      </button>
                      <button
                        onClick={() => { setBulkOpen(false); setBulkText(""); }}
                        style={{
                          padding: "8px 16px", borderRadius: T.radiusSm,
                          fontSize: "13px", fontWeight: 500,
                          color: T.textSecondary, background: "transparent",
                          border: `1px solid ${T.border}`, cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <JsonPreview mappings={mappings} apiEndpoint={apiEndpoint} />
            )}
          </div>

          {/* Right Sidebar */}
          {!hideSidebar && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <StatsPanel mappings={mappings} />

              <div style={{ background: T.surface, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                  Quick Actions
                </div>
                {[
                  { icon: <I.Download />, label: "Export mapping config", action: () => setActiveTab("preview") },
                  { icon: <I.Lock />, label: "Lock all valid fields", action: () => {
                    setMappingsAndNotify((p) => p.map((m) => {
                      const isDup = p.filter((o) => o.mapsTo === m.mapsTo).length > 1;
                      return m.mapsTo.trim() && !isDup ? { ...m, locked: true } : m;
                    }));
                  }},
                ].map((a, i) => (
                  <button key={i} onClick={a.action} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "10px 12px", marginBottom: "4px",
                    borderRadius: T.radiusSm, border: "none",
                    fontSize: "13px", fontWeight: 500, color: T.textSecondary,
                    background: "transparent", cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = T.surfaceHover; e.currentTarget.style.color = T.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
                  >
                    <span style={{ color: T.accent }}>{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
