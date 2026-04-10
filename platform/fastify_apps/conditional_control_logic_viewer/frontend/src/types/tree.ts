import type { TreeItemComponentProps } from 'dnd-kit-sortable-tree';
import type { LogicalOperator } from './filters';

export type ItemType = 'filter' | 'group';

export interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

export interface TreeItemData {
  id: string;
  type: ItemType;
  text?: string; // For simple filter display
  condition?: FilterCondition; // For structured filter with selectors
  operator?: LogicalOperator; // For group items
  canHaveChildren?: boolean;
}

export type FilterTreeItemProps = TreeItemComponentProps<TreeItemData>;
