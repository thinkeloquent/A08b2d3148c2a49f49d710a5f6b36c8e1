import { memo } from 'react';
import { Plus } from 'lucide-react';
import { OperatorBadge } from './OperatorBadge';
import { FilterPill } from './FilterPill';
import { ConnectorLine } from './ConnectorLine';
import type { GroupNode, FilterTreeNode, LogicalOperator } from '@/types';

interface FilterGroupProps {
  group: GroupNode;
  depth?: number;
  onUpdate: (updatedGroup: GroupNode) => void;
  onRemove?: () => void;
}

function FilterGroupComponent({ group, depth = 0, onUpdate }: FilterGroupProps) {

  const handleOperatorChange = (newOperator: LogicalOperator) => {
    onUpdate({ ...group, operator: newOperator });
  };

  const handleChildUpdate = (childId: string, updatedChild: FilterTreeNode) => {
    const newChildren = group.children.map((child) =>
      child.id === childId ? updatedChild : child
    );
    onUpdate({ ...group, children: newChildren });
  };

  const handleChildRemove = (childId: string) => {
    const newChildren = group.children.filter((child) => child.id !== childId);
    onUpdate({ ...group, children: newChildren });
  };

  const handleAddFilter = () => {
    const newFilter: FilterTreeNode = {
      id: `filter-${Date.now()}`,
      type: 'filter',
      text: 'New filter condition - double click to edit',
    };
    onUpdate({ ...group, children: [...group.children, newFilter] });
  };

  const handleAddGroup = () => {
    const newGroup: FilterTreeNode = {
      id: `group-${Date.now()}`,
      type: 'group',
      operator: 'AND',
      children: [],
    };
    onUpdate({ ...group, children: [...group.children, newGroup] });
  };

  const handleFilterTextUpdate = (filterId: string, newText: string) => {
    const newChildren = group.children.map((child) =>
      child.id === filterId && child.type === 'filter'
        ? { ...child, text: newText }
        : child
    );
    onUpdate({ ...group, children: newChildren });
  };

  const isRoot = depth === 0;

  return (
    <div className={`relative ${depth > 0 ? 'ml-8' : ''}`}>
      <div
        className={`relative ${depth > 0 ? 'pl-6 py-4' : ''}`}
        style={
          depth > 0
            ? {
                borderLeft: `4px solid ${group.operator === 'AND' ? '#bae6fd' : '#fde68a'}`,
                borderRadius: '4px',
              }
            : {}
        }
      >
        {/* Operator badge for nested groups - positioned at top */}
        {depth > 0 && (
          <div className="absolute -left-12 top-4 z-10">
            <OperatorBadge
              operator={group.operator}
              onChange={handleOperatorChange}
              isNested={true}
            />
          </div>
        )}

        {/* Operator badge for root with multiple children - positioned at top-left */}
        {isRoot && group.children.length > 1 && (
          <div className="absolute -left-12 top-3">
            <OperatorBadge operator={group.operator} onChange={handleOperatorChange} />
          </div>
        )}

        {/* Children */}
        <div className="space-y-3">
          {group.children.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Connector lines for multiple children */}
              {group.children.length > 1 && (
                <ConnectorLine
                  isFirst={index === 0}
                  isLast={index === group.children.length - 1}
                  operator={group.operator}
                />
              )}

              <div className={group.children.length > 1 ? 'ml-16' : ''}>
                {child.type === 'filter' ? (
                  <FilterPill
                    filter={child}
                    onRemove={() => handleChildRemove(child.id)}
                    onUpdate={(newText) => handleFilterTextUpdate(child.id, newText)}
                  />
                ) : (
                  <FilterGroup
                    group={child}
                    depth={depth + 1}
                    onUpdate={(updated) => handleChildUpdate(child.id, updated)}
                    onRemove={() => handleChildRemove(child.id)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add buttons */}
        <div
          className={`
            flex items-center gap-4 mt-4
            ${group.children.length > 1 ? 'ml-16' : ''}
            ${depth > 0 ? 'pl-2' : ''}
          `}
        >
          <button
            onClick={handleAddFilter}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add filter
          </button>
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add inner group
          </button>
        </div>
      </div>

    </div>
  );
}

export const FilterGroup = memo(FilterGroupComponent);
