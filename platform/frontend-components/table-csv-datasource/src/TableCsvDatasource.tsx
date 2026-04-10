import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  DataTableProps,
  DataTableColumn,
  DataTableRow,
  SortDirection,
} from "./types";

/* ── helpers ─────────────────────────────────────────────── */

function normalizeColumn(col: string | DataTableColumn): DataTableColumn {
  if (typeof col === "string")
    return { key: col, label: col.replace(/_/g, " ") };
  return { key: col.key, label: col.label ?? col.key.replace(/_/g, " ") };
}

function getCellValue(
  row: DataTableRow,
  key: string,
  colIndex: number,
): string {
  if (Array.isArray(row)) return row[colIndex] ?? "";
  return row[key] ?? "";
}

function isLink(value: string): boolean {
  return value.startsWith("/") || value.startsWith("http");
}

function compareValues(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

/* ── row detail modal ────────────────────────────────────── */

function RowDetailModal({
  row,
  columns,
  rowNumber,
  linkIcon,
  onClose,
}: {
  row: DataTableRow;
  columns: DataTableColumn[];
  rowNumber: number;
  linkIcon?: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "80vw",
          maxWidth: "80%",
          height: "80vh",
          maxHeight: "80%",
        }}
        className="bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">
            Row {rowNumber}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
        {/* body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {columns.map((col, ci) => {
              const value = getCellValue(row, col.key, ci);
              return (
                <div
                  key={col.key}
                  className="border-b border-slate-100 pb-3 last:border-0"
                >
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {col.label}
                  </p>
                  {value ? (
                    isLink(value) ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm break-all"
                      >
                        {linkIcon} {value}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                        {value}
                      </p>
                    )
                  ) : (
                    <span className="text-sm text-slate-300 italic">
                      &mdash;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── default icons (pure SVG, no icon library) ────────────── */

function DefaultSortAsc() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5 text-indigo-500"
    >
      <path d="M8 4l4 5H4l4-5z" />
    </svg>
  );
}

function DefaultSortDesc() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5 text-indigo-500"
    >
      <path d="M8 12l4-5H4l4 5z" />
    </svg>
  );
}

function DefaultSortNeutral() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <path d="M8 4l3 3.5H5L8 4zm0 8L5 8.5h6L8 12z" />
    </svg>
  );
}

/* ── checkbox ────────────────────────────────────────────── */

function IndeterminateCheckbox({
  indeterminate,
  checked,
  onChange,
}: {
  indeterminate?: boolean;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate ?? false;
      }}
      onChange={onChange}
      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
    />
  );
}

/* ── main component ──────────────────────────────────────── */

export function TableCsvDatasource({
  columns: rawColumns,
  rows,
  onRowClick,
  offset = 0,
  expandable = true,
  detailColumns: rawDetailColumns,
  className,
  footerStatus = "Loaded",
  totalRows,
  stickyHeader = true,
  maxHeight = "600px",
  sortAscIcon,
  sortDescIcon,
  sortNeutralIcon,
  linkIcon,
  selectable = true,
  maxCellWidth = "200px",
  hiddenColumns,
}: DataTableProps) {
  const [modalRow, setModalRow] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const allColumns = useMemo(
    () => rawColumns.map(normalizeColumn),
    [rawColumns],
  );
  const columns = useMemo(
    () =>
      hiddenColumns
        ? allColumns.filter((c) => !hiddenColumns.has(c.key))
        : allColumns,
    [allColumns, hiddenColumns],
  );
  const detailCols = useMemo(() => {
    const base = rawDetailColumns
      ? rawDetailColumns.map(normalizeColumn)
      : allColumns;
    return hiddenColumns ? base.filter((c) => !hiddenColumns.has(c.key)) : base;
  }, [rawDetailColumns, allColumns, hiddenColumns]);

  const displayTotal = totalRows ?? rows.length;

  /* sorting */
  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(false);
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    const colIndex = columns.findIndex((c) => c.key === sortKey);
    if (colIndex === -1) return rows;
    const sorted = [...rows].sort((a, b) => {
      const va = getCellValue(a, sortKey, colIndex);
      const vb = getCellValue(b, sortKey, colIndex);
      return compareValues(va, vb);
    });
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [rows, sortKey, sortDir, columns]);

  /* selection */
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((_, i) => i)));
    }
  };

  const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  /* icons */
  const ascIcon = sortAscIcon ?? <DefaultSortAsc />;
  const descIconEl = sortDescIcon ?? <DefaultSortDesc />;
  const neutralIcon = sortNeutralIcon ?? <DefaultSortNeutral />;
  const selectedCount = selectedRows.size;

  // Total columns: select? + rowNum + data columns
  const totalColSpan = (selectable ? 1 : 0) + 1 + columns.length;

  if (columns.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-8 text-center">
        No columns available.
      </p>
    );
  }

  return (
    <div
      className={[
        "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* selection bar */}
      {selectedCount > 0 && (
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-700">
            {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setSelectedRows(new Set())}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      <div
        className="overflow-x-auto"
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className={[
                "bg-slate-50 border-b border-slate-200",
                stickyHeader ? "sticky top-0 z-10" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* select-all checkbox */}
              {selectable && (
                <th
                  className="text-left px-4 py-3 bg-slate-50"
                  style={{ width: 40 }}
                >
                  <IndeterminateCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {/* row number */}
              <th
                className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50"
                style={{ width: 48 }}
              >
                #
              </th>
              {/* data columns */}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const dir = isSorted ? sortDir : false;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 cursor-pointer select-none group hover:text-slate-600"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {dir === "asc"
                        ? ascIcon
                        : dir === "desc"
                          ? descIconEl
                          : neutralIcon}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 && (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="text-center py-12 text-slate-400"
                >
                  <p className="text-base mb-1">No rows match</p>
                  <p className="text-xs text-slate-300">
                    Try adjusting your filters
                  </p>
                </td>
              </tr>
            )}
            {sortedRows.map((row, rowIndex) => {
              const isSelected = selectedRows.has(rowIndex);
              return (
                <tr
                  key={rowIndex}
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).closest(
                        'input[type="checkbox"]',
                      )
                    )
                      return;
                    if (expandable) setModalRow(rowIndex);
                    onRowClick?.(row, offset + rowIndex);
                  }}
                  className={[
                    "border-b border-slate-100 transition-colors duration-100",
                    expandable || onRowClick ? "cursor-pointer" : "",
                    isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* checkbox */}
                  {selectable && (
                    <td className="px-4 py-3 text-sm">
                      <IndeterminateCheckbox
                        checked={isSelected}
                        onChange={() => toggleRow(rowIndex)}
                      />
                    </td>
                  )}
                  {/* row number */}
                  <td className="px-4 py-3 text-sm">
                    <span className="text-xs text-slate-300 tabular-nums">
                      {offset + rowIndex + 1}
                    </span>
                  </td>
                  {/* data cells */}
                  {columns.map((col, ci) => {
                    const val = getCellValue(row, col.key, ci);
                    return (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm"
                        style={
                          maxCellWidth ? { maxWidth: maxCellWidth } : undefined
                        }
                      >
                        <span
                          className={[
                            ci === 0
                              ? "font-medium text-slate-800"
                              : "text-slate-600",
                            maxCellWidth ? "block truncate" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          title={val}
                        >
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
        <span>
          {offset + 1}&ndash;{offset + rows.length} of{" "}
          {displayTotal.toLocaleString()} rows
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {footerStatus}
        </span>
      </div>

      {/* row detail modal */}
      {modalRow !== null && sortedRows[modalRow] && (
        <RowDetailModal
          row={sortedRows[modalRow]}
          columns={detailCols}
          rowNumber={offset + modalRow + 1}
          linkIcon={linkIcon}
          onClose={() => setModalRow(null)}
        />
      )}
    </div>
  );
}
