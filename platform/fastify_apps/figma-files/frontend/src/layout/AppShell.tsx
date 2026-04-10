import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { FigmaFilesLeftNav } from './FigmaFilesLeftNav';

export const AppShell = createAppShell({ activeId: 'figma-files', LeftNav: FigmaFilesLeftNav });
