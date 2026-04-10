import type { DatasourceCategory } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  infosec: 'bg-red-100 text-red-800',
  vulnerability: 'bg-orange-100 text-orange-800',
  dependency: 'bg-blue-100 text-blue-800',
  compliance: 'bg-green-100 text-green-800',
  performance: 'bg-purple-100 text-purple-800',
};

const FALLBACK_COLOR = 'bg-indigo-100 text-indigo-800';

export function CategoryBadge({ category }: { category: DatasourceCategory }) {
  const colorClass = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {category}
    </span>
  );
}
