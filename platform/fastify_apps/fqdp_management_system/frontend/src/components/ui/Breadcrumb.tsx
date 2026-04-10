/**
 * Breadcrumb Component
 * Navigation breadcrumb showing hierarchy path
 * Based on: REQ.v002.jsx Section 7 (UX-008)
 */

import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/utils/cn';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  // Truncate breadcrumbs if more than 5 items (show first 2 + last 2)
  const shouldTruncate = items.length > 5;
  const displayItems = shouldTruncate
    ? [...items.slice(0, 2), { label: '...', href: undefined }, ...items.slice(-2)]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      {displayItems.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}

          {item.label === '...' ? (
            <span className="text-gray-400">...</span>
          ) : item.href && index < items.length - 1 ? (
            <a
              href={item.href}
              className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="font-semibold text-gray-900">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
