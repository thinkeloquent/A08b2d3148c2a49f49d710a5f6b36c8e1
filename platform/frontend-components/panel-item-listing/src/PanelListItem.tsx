import type { PanelListItemProps } from './types';

/**
 * Pre-built list item component with icon, title, subtitle, description, and badge.
 * Use inside PanelItemListing's renderItem for a consistent card appearance.
 */
export function PanelListItem({
  title,
  subtitle,
  description,
  isSelected = false,
  onClick,
  icon,
  badge,
  className,
}: PanelListItemProps) {
  const baseClass = [
    'w-full p-4 text-left transition-colors border-b border-gray-200',
    'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" onClick={onClick} className={baseClass}>
      <div className="flex items-start space-x-3 min-w-0">
        {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      {badge && <div className="mt-3 flex items-center">{badge}</div>}
    </button>
  );
}
