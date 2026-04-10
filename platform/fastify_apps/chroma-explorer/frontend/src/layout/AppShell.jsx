import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { ChromaExplorerLeftNav } from './ChromaExplorerLeftNav';

export const AppShell = createAppShell({ activeId: 'chroma-explorer', LeftNav: ChromaExplorerLeftNav });
