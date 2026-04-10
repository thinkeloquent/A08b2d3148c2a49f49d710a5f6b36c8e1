import type { Category } from '@/types';

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryItem({ category, isSelected, onClick }: CategoryItemProps) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isSelected
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <Icon
        className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`}
      />
      <span className="flex-1 text-left font-medium text-sm">{category.name}</span>
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isSelected
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {category.count}
      </span>
    </button>
  );
}
