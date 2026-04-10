import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { CodeRepositoriesLeftNav } from './CodeRepositoriesLeftNav';

export const AppShell = createAppShell({ activeId: 'code-repositories', LeftNav: CodeRepositoriesLeftNav });
