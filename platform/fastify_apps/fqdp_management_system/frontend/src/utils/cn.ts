/**
 * Utility for merging Tailwind CSS class names
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names with conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
