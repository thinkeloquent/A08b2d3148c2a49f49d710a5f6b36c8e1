import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { PersonaEditorLeftNav } from './PersonaEditorLeftNav';

export const AppShell = createAppShell({ activeId: 'persona-editor', LeftNav: PersonaEditorLeftNav });
