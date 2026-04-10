import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { TaskGraphLeftNav } from './TaskGraphLeftNav';

export const AppShell = createAppShell({ activeId: 'task-graph', LeftNav: TaskGraphLeftNav });
