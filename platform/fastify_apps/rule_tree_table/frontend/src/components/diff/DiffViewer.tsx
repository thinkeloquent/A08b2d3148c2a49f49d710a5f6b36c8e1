import { useMemo } from 'react';
import { getFieldChanges, FieldChange } from '@/lib/diff';
import { FieldDiff } from './FieldDiff';
import { CheckCircle } from 'lucide-react';

interface DiffViewerProps<T extends Record<string, unknown>> {
  original: T;
  modified: T;
  fields: (keyof T)[];
  labels?: Partial<Record<keyof T, string>>;
}

export function DiffViewer<T extends Record<string, unknown>>({
  original,
  modified,
  fields,
  labels = {},
}: DiffViewerProps<T>) {
  const changes = useMemo(
    () => getFieldChanges(original, modified, fields),
    [original, modified, fields]
  );

  const hasAnyChanges = changes.some((c) => c.type !== 'unchanged');

  const groupedChanges = useMemo(() => {
    const modified: FieldChange[] = [];
    const added: FieldChange[] = [];
    const removed: FieldChange[] = [];

    for (const change of changes) {
      switch (change.type) {
        case 'modified':
          modified.push(change);
          break;
        case 'added':
          added.push(change);
          break;
        case 'removed':
          removed.push(change);
          break;
      }
    }

    return { modified, added, removed };
  }, [changes]);

  if (!hasAnyChanges) {
    return (
      <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg text-slate-500">
        <CheckCircle className="w-5 h-5 text-emerald-400" />
        <span className="text-sm">No changes detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Changes Preview</h3>
        <div className="flex gap-4 text-sm">
          {groupedChanges.modified.length > 0 && (
            <span className="text-amber-600">
              {groupedChanges.modified.length} modified
            </span>
          )}
          {groupedChanges.added.length > 0 && (
            <span className="text-emerald-600">
              {groupedChanges.added.length} added
            </span>
          )}
          {groupedChanges.removed.length > 0 && (
            <span className="text-red-500">
              {groupedChanges.removed.length} removed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {changes
          .filter((c) => c.type !== 'unchanged')
          .map((change) => (
            <FieldDiff
              key={change.field}
              change={change}
              label={labels[change.field as keyof T]}
            />
          ))}
      </div>
    </div>
  );
}
