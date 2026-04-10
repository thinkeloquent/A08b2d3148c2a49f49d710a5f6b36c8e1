// Filter tree node types
export type FilterNodeType = 'filter' | 'group';

// Logical operators for groups
export type LogicalOperator = 'AND' | 'OR';

// Base filter node
export interface BaseFilterNode {
  id: string;
  type: FilterNodeType;
}

// Individual filter/condition
export interface FilterNode extends BaseFilterNode {
  type: 'filter';
  text: string;
}

// Group containing filters or nested groups
export interface GroupNode extends BaseFilterNode {
  type: 'group';
  operator: LogicalOperator;
  children: FilterTreeNode[];
}

// Union type for all tree nodes
export type FilterTreeNode = FilterNode | GroupNode;

// Root filter structure
export interface FilterTree {
  id: string;
  type: 'group';
  operator: LogicalOperator;
  children: FilterTreeNode[];
}
