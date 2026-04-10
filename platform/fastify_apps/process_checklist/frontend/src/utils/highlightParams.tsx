import { type ReactNode } from "react";

/**
 * Highlight parameter values within text so users can see which parts were
 * injected. Longest values are matched first to avoid partial highlights.
 */
export function highlightParams(
  text: string,
  parameters: Record<string, unknown>,
): ReactNode {
  const entries = Object.entries(parameters)
    .map(([key, val]) => ({ key, val: String(val) }))
    .filter((e) => e.val.length > 0)
    // longest first so "Acme Corp" matches before "Acme"
    .sort((a, b) => b.val.length - a.val.length);

  if (entries.length === 0) return text;

  // Build a regex that matches any parameter value (escaped for regex safety)
  const escaped = entries.map((e) =>
    e.val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");

  // Build a value → key lookup for tooltip labels
  const valueToKey = new Map<string, string>();
  for (const e of entries) {
    // first writer wins (longest value was sorted first)
    if (!valueToKey.has(e.val)) valueToKey.set(e.val, e.key);
  }

  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const paramKey = valueToKey.get(part);
    if (paramKey) {
      return (
        <mark
          key={i}
          title={paramKey}
          className="rounded bg-amber-100 px-1 text-amber-900"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

/**
 * Replace {{key}} placeholders in text with parameter values and return
 * ReactNodes with highlighting. Unmatched placeholders get a warning style.
 */
export function highlightPlaceholders(
  text: string,
  parameters: Record<string, string>,
): ReactNode {
  // Match all {{...}} placeholders
  const pattern = /(\{\{(\w+)\}\})/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const placeholder = match[1]; // e.g. {{ClientName}}
    const key = match[2]; // e.g. ClientName
    const value = parameters[key];

    if (value !== undefined) {
      parts.push(
        <mark
          key={`${match.index}-${key}`}
          title={`{{${key}}}`}
          className="rounded bg-amber-100 px-1 text-amber-900"
        >
          {value}
        </mark>,
      );
    } else {
      parts.push(
        <mark
          key={`${match.index}-${key}`}
          title="Unmatched parameter"
          className="rounded bg-red-100 px-1 text-red-700"
        >
          {placeholder}
        </mark>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? text : parts;
}
