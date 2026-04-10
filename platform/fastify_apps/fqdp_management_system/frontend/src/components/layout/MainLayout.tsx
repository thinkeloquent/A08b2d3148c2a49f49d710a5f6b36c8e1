/**
 * MainLayout Component
 * Main application layout with sidebar and content area
 */

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import type { BreadcrumbItem } from '@/types';
import { Breadcrumb } from '@/components/ui';

export interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}

export function MainLayout({ children, breadcrumbs = [], showBreadcrumbs = true }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
