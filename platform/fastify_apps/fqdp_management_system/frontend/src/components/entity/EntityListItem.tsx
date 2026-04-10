/**
 * EntityListItem - Generic list item component
 * Works for any entity type with configuration
 */

import type { BaseEntity } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { Badge } from '@/components/ui';
import { cn } from '@/utils/cn';

export interface EntityListItemProps<T extends BaseEntity> {
  entity: T;
  config: EntityConfig<any>;
  isSelected?: boolean;
  onClick: () => void;
  parentName?: string; // For displaying parent entity name
}

export function EntityListItem<T extends BaseEntity>({
  entity,
  config,
  isSelected = false,
  onClick,
  parentName,
}: EntityListItemProps<T>) {
  const Icon = config.icon;
  const childCount = config.child ? ((entity as any)[config.child.countKey] as number) : undefined;
  const ChildIcon = config.child?.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left transition-colors border-b border-gray-200',
        'hover:bg-gray-50 focus:outline-none',
        isSelected && 'bg-primary-50 border-l-4 border-l-primary-500'
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <Icon
            className={cn(
              'h-5 w-5',
              isSelected ? 'text-primary-600' : 'text-gray-400'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Entity name */}
          <h3
            className={cn(
              'font-medium truncate',
              isSelected ? 'text-primary-900' : 'text-gray-900'
            )}
          >
            {entity.name}
          </h3>

          {/* Parent name (for non-root entities) */}
          {parentName && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {parentName}
            </p>
          )}

          {/* Slug */}
          <p className="text-sm text-gray-500 font-mono truncate mt-1">
            {(entity as { slug?: string }).slug}
          </p>

          {/* Status and child count */}
          <div className="mt-3 flex items-center justify-between">
            <Badge status={entity.status} size="sm" />

            {childCount !== undefined && ChildIcon && (
              <div className="flex items-center text-xs text-gray-500">
                <ChildIcon className="h-3.5 w-3.5 mr-1" />
                <span>
                  {childCount} {childCount === 1 ? config.child!.label.singular : config.child!.label.plural}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
