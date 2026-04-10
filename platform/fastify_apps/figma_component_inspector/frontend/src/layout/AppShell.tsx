import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { FigmaInspectorLeftNav } from './FigmaInspectorLeftNav';

export const AppShell = createAppShell({ activeId: 'figma-component-inspector', LeftNav: FigmaInspectorLeftNav });
