import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { RuleTreeLeftNav } from './RuleTreeLeftNav';

export const AppShell = createAppShell({ activeId: 'rule-tree-table', LeftNav: RuleTreeLeftNav });
