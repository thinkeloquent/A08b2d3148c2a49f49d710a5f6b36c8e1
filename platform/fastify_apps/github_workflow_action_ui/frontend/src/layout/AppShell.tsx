import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { GitHubActionsLeftNav } from './GitHubActionsLeftNav';

export const AppShell = createAppShell({ activeId: 'github-workflow-action-ui', LeftNav: GitHubActionsLeftNav });
