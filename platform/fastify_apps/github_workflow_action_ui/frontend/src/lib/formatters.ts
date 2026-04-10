/** Relative time: "now", "5m", "2h", "3d" */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/** Duration between two ISO timestamps: "5s", "2m 30s", "1h 5m" */
export function duration(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  if (!start || !end) return "—";
  const sec = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  );
  if (sec < 60) return `${sec}s`;
  const mm = Math.floor(sec / 60);
  if (mm < 60) return `${mm}m ${sec % 60}s`;
  return `${Math.floor(mm / 60)}h ${mm % 60}m`;
}

/** Human-readable byte size: "512 B", "1.2 KB", "3.4 MB" */
export function formatBytes(b: number | null | undefined): string {
  if (!b) return "0 B";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

/** Localized short date: "Jan 5, 02:30 PM" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
