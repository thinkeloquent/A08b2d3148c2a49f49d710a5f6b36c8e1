import type { DatasourceTag } from '../types';

export function TagBadge({ tag }: { tag: DatasourceTag }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: tag.color || '#6366f1' }}
    >
      {tag.name}
    </span>
  );
}
