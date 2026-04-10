import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { TemplateLeftNav } from './TemplateLeftNav';

export const AppShell = createAppShell({ activeId: 'prompt-oneshot-template', LeftNav: TemplateLeftNav });
