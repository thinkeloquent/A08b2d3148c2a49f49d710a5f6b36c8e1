import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { PromptManagementLeftNav } from './PromptManagementLeftNav';

export const AppShell = createAppShell({ activeId: 'prompt-management-system', LeftNav: PromptManagementLeftNav });
