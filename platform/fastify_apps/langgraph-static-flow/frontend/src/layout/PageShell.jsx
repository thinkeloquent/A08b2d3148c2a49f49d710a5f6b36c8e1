import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { LanggraphLeftNav } from './LanggraphLeftNav';

export const PageShell = createAppShell({ activeId: 'langgraph-static-flow', LeftNav: LanggraphLeftNav });
