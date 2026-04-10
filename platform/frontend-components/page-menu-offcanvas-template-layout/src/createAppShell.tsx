/**
 * Factory that creates a fully-wired AppShell component.
 *
 * Centralizes all the boilerplate shared across every app integration:
 * navigation groups, slug map, theme, icons, drawer, and cross-app routing.
 *
 * Usage:
 *   import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
 *   export const AppShell = createAppShell({ activeId: 'task-graph', LeftNav: TaskGraphLeftNav });
 */

import { useCallback, useState } from 'react';
import type { ReactNode, ComponentType } from 'react';
import { PageMenuOffcanvasTemplateLayout } from './PageMenuOffcanvasTemplateLayout';
import type { ActionItem, ComponentRegistryMap, RegionConfig, BaseBlockProps } from './types';

import { SHELL_THEME, APP_SLUG_MAP } from '../../../common/config/page-navigation-menu-items.mjs';
import { icons, SHELL_GROUPS, SHELL_TRAILING_TABS, SHELL_SEARCH, SHELL_RAIL_BOTTOM, SHELL_USER, SHELL_ORG } from '../../../common/config/page-navigation-menu-items.jsx';
import type { OrgConfig } from './useOrgLoader';

export interface CreateAppShellOptions {
  /** The nav item id that identifies this app in SHELL_GROUPS */
  activeId: string;
  /** Left nav panel component for this app */
  LeftNav: ComponentType<BaseBlockProps>;
}

const SHELL_ORG_CONFIG: OrgConfig = {
  endpoint: '/~/api/fqdp_management_system/organizations',
  createHref: '/apps/fqdp_management_system/organizations/new',
  manageHref: '/apps/fqdp_management_system/organizations/',
};

export function createAppShell({ activeId, LeftNav }: CreateAppShellOptions) {
  const registryKey = `${activeId}-left-nav`;

  const REGISTRY: ComponentRegistryMap = Object.freeze({
    [registryKey]: LeftNav,
  });

  const REGIONS: RegionConfig = {
    left: [{ id: 'left-nav', type: registryKey }],
  };

  function AppShell({ children }: { children: ReactNode }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleActiveChange = useCallback((id: string) => {
      if (id === activeId) return;
      const slug = APP_SLUG_MAP[id] ?? id;
      window.location.href = `/apps/${slug}`;
    }, []);

    const actions: ActionItem[] = [
      { id: 'notifications', icon: icons.bell, ariaLabel: 'Notifications', showDot: true },
      { id: 'drawer-toggle', icon: icons.panelRight, ariaLabel: 'Toggle drawer', onClick: () => setDrawerOpen((o) => !o) },
    ];

    return (
      <PageMenuOffcanvasTemplateLayout
        groups={SHELL_GROUPS}
        activeId={activeId}
        onActiveChange={handleActiveChange}
        org={SHELL_ORG}
        orgConfig={SHELL_ORG_CONFIG}
        search={SHELL_SEARCH}
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
        registry={REGISTRY}
        regions={REGIONS}
      >
        {children}
      </PageMenuOffcanvasTemplateLayout>
    );
  }

  AppShell.displayName = `AppShell(${activeId})`;

  return AppShell;
}
