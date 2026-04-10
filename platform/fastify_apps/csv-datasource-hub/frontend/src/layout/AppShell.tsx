import { createAppShell } from '@internal/page-menu-offcanvas-template-layout';
import { CsvDatasourceHubLeftNav } from './CsvDatasourceHubLeftNav';

export const AppShell = createAppShell({ activeId: 'csv-datasource-hub', LeftNav: CsvDatasourceHubLeftNav });
