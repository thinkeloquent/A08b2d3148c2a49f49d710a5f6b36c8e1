import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { AskAiLeftNav } from './AskAiLeftNav';

export const AppShell = createAppShell({ activeId: 'ai-ask-v2', LeftNav: AskAiLeftNav });
