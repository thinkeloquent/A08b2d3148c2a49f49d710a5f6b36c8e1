import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { CategoriesLeftNav } from './CategoriesLeftNav';

export const AppShell = createAppShell({ activeId: 'categories', LeftNav: CategoriesLeftNav });
