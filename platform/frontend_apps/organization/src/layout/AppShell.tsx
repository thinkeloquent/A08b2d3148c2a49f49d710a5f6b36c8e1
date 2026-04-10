import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { OrganizationLeftNav } from './OrganizationLeftNav';

export const AppShell = createAppShell({ activeId: 'organizations', LeftNav: OrganizationLeftNav });
