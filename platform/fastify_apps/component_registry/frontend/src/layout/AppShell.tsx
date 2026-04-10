import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { ComponentRegistryLeftNav } from './ComponentRegistryLeftNav';

export const AppShell = createAppShell({ activeId: 'component-registry', LeftNav: ComponentRegistryLeftNav });
