/**
 * App shell that provides the shared top nav and icon rail,
 * WITHOUT a left offcanvas panel — the HierarchicalNavigation
 * is rendered directly in the main content area instead.
 */

import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { PageMenuOffcanvasTemplateLayout } from '@internal/page-menu-offcanvas-template-layout';
import type { ActionItem } from '@internal/page-menu-offcanvas-template-layout';

import { SHELL_GROUPS, SHELL_THEME, APP_SLUG_MAP } from '../../../../common/config/page-navigation-menu-items.mjs';
import { icons, SHELL_TRAILING_TABS, SHELL_RAIL_BOTTOM, SHELL_USER } from '../../../../common/config/page-navigation-menu-items.jsx';

const ACTIVE_ID = 'figma-file-navigator';

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleActiveChange = useCallback((id: string) => {
    if (id === ACTIVE_ID) return;
    const slug = (APP_SLUG_MAP as Record<string, string>)[id] ?? id;
    window.location.href = `/apps/${slug}`;
  }, []);

  const actions: ActionItem[] = [
    { id: 'notifications', icon: icons.bell, ariaLabel: 'Notifications', showDot: true },
    { id: 'drawer-toggle', icon: icons.panelRight, ariaLabel: 'Toggle drawer', onClick: () => setDrawerOpen((o) => !o) },
  ];

  return (
    <PageMenuOffcanvasTemplateLayout
      groups={SHELL_GROUPS}
      activeId={ACTIVE_ID}
      onActiveChange={handleActiveChange}
      user={SHELL_USER}
      actions={actions}
      trailingTabs={SHELL_TRAILING_TABS}
      theme={SHELL_THEME}
      railBottomItems={SHELL_RAIL_BOTTOM}
      menuIcon={icons.panelRightClose}
      closeIcon={icons.panelLeftClose}
      defaultLeftOpen={false}
      drawerTitle="Properties"
      drawerCloseIcon={icons.closeSm}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
    >
      {children}
    </PageMenuOffcanvasTemplateLayout>
  );
}
