/**
 * Label Color Utilities
 * Based on REQ.v002.md Section 4.3 (Label System)
 */

import type { LabelColor } from '@/types';

// Predefined label suggestions with colors
export const labelSuggestions: Array<{ name: string; color: LabelColor }> = [
  { name: 'Critical', color: 'red' },
  { name: 'Admin', color: 'purple' },
  { name: 'Read-Only', color: 'green' },
  { name: 'Limited', color: 'yellow' },
  { name: 'Full Access', color: 'blue' },
  { name: 'API', color: 'indigo' },
  { name: 'Dashboard', color: 'cyan' },
  { name: 'Reporting', color: 'orange' },
  { name: 'System', color: 'gray' },
  { name: 'Custom', color: 'pink' },
];

/**
 * Get color for a label (with fallback to gray)
 */
export function getLabelColor(labelName: string): LabelColor {
  const suggestion = labelSuggestions.find(s => s.name === labelName);
  return suggestion?.color || 'gray';
}

/**
 * Get all available label colors
 */
export function getAllLabelColors(): LabelColor[] {
  return ['red', 'purple', 'green', 'yellow', 'blue', 'indigo', 'cyan', 'orange', 'gray', 'pink'];
}
