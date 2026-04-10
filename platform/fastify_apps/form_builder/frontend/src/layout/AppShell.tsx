import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { FormBuilderLeftNav } from './FormBuilderLeftNav';

export const AppShell = createAppShell({ activeId: 'form-builder', LeftNav: FormBuilderLeftNav });
