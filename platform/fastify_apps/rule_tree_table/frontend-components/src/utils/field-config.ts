/**
 * Field definitions and operator configurations shared across frontend and admin
 */

import {
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Folder,
  Settings,
} from 'lucide-react';

// Field definitions with icons (admin uses icons, frontend can ignore them)
export const availableFields = [
  { value: 'user_id', label: 'User ID', type: 'string' as const, icon: Hash },
  { value: 'email', label: 'Email', type: 'string' as const, icon: Type },
  { value: 'age', label: 'Age', type: 'number' as const, icon: Hash },
  { value: 'created_at', label: 'Created Date', type: 'date' as const, icon: Calendar },
  { value: 'is_active', label: 'Is Active', type: 'boolean' as const, icon: ToggleLeft },
  { value: 'department', label: 'Department', type: 'string' as const, icon: Folder },
  { value: 'salary', label: 'Salary', type: 'number' as const, icon: Hash },
  { value: 'last_login', label: 'Last Login', type: 'date' as const, icon: Calendar },
  { value: 'role', label: 'Role', type: 'string' as const, icon: Settings },
  { value: 'country', label: 'Country', type: 'string' as const, icon: Type },
];

// Operator definition with symbol for compact display
export interface OperatorDef {
  value: string;
  label: string;
  symbol: string;
}

// Operators grouped by data type (includes symbols for admin's compact display)
export const operatorsByType: Record<string, OperatorDef[]> = {
  string: [
    { value: 'equals', label: 'equals', symbol: '=' },
    { value: 'not_equals', label: 'not equals', symbol: '\u2260' },
    { value: 'contains', label: 'contains', symbol: '\u2283' },
    { value: 'not_contains', label: 'does not contain', symbol: '\u2285' },
    { value: 'starts_with', label: 'starts with', symbol: '^...' },
    { value: 'ends_with', label: 'ends with', symbol: '...$' },
    { value: 'regex', label: 'matches regex', symbol: '.*' },
    { value: 'in', label: 'in list', symbol: '\u2208' },
    { value: 'not_in', label: 'not in list', symbol: '\u2209' },
  ],
  number: [
    { value: 'equals', label: 'equals', symbol: '=' },
    { value: 'not_equals', label: 'not equals', symbol: '\u2260' },
    { value: 'greater_than', label: 'greater than', symbol: '>' },
    { value: 'greater_or_equal', label: 'greater or equal', symbol: '\u2265' },
    { value: 'less_than', label: 'less than', symbol: '<' },
    { value: 'less_or_equal', label: 'less or equal', symbol: '\u2264' },
    { value: 'between', label: 'between', symbol: '\u27E8\u27E9' },
    { value: 'not_between', label: 'not between', symbol: '!\u27E8\u27E9' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true', symbol: '\u2713' },
    { value: 'is_false', label: 'is false', symbol: '\u2717' },
    { value: 'is_null', label: 'is null', symbol: '\u2205' },
    { value: 'is_not_null', label: 'is not null', symbol: '!\u2205' },
  ],
  date: [
    { value: 'equals', label: 'on', symbol: '=' },
    { value: 'before', label: 'before', symbol: '<' },
    { value: 'after', label: 'after', symbol: '>' },
    { value: 'between', label: 'between', symbol: '\u27E8\u27E9' },
    { value: 'in_last', label: 'in last', symbol: '\u21A9' },
    { value: 'not_in_last', label: 'not in last', symbol: '!\u21A9' },
    { value: 'is_today', label: 'is today', symbol: '\uD83D\uDCC5' },
    { value: 'is_yesterday', label: 'is yesterday', symbol: '\u25C1' },
  ],
};
