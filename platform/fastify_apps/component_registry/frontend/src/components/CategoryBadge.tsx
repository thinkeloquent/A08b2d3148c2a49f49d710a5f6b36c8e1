interface CategoryBadgeProps {
  category: string;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200">
      {category}
    </span>
  );
}
