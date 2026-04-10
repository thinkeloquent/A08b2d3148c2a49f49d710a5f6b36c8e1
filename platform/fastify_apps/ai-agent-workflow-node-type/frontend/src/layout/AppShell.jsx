import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { NodeTypeLeftNav } from './NodeTypeLeftNav';

export const AppShell = createAppShell({ activeId: 'ai-agent-workflow-node-type', LeftNav: NodeTypeLeftNav });
