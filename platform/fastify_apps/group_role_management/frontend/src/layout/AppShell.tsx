import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { GroupRoleLeftNav } from './GroupRoleLeftNav';

export const AppShell = createAppShell({ activeId: 'group-role-management', LeftNav: GroupRoleLeftNav });
