import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { ProcessChecklistLeftNav } from './ProcessChecklistLeftNav';

export const AppShell = createAppShell({ activeId: 'process-checklist', LeftNav: ProcessChecklistLeftNav });
