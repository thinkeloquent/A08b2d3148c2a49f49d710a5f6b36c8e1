import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { FqdpLeftNav } from './FqdpLeftNav';

export const AppShell = createAppShell({ activeId: 'fqdp-management-system', LeftNav: FqdpLeftNav });
