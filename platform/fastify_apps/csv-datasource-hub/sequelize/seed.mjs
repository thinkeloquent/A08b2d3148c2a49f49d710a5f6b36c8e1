import { sequelize, SCHEMA, CsvDatasource, CsvDatasourceTag, CsvDatasourceLabel, CsvInstance, CsvPayload } from './models/index.mjs';

async function seed() {
  try {
    await sequelize.authenticate();

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Create tags
    const [secTag] = await CsvDatasourceTag.findOrCreate({ where: { name: 'security' }, defaults: { name: 'security', color: '#ef4444' } });
    const [depTag] = await CsvDatasourceTag.findOrCreate({ where: { name: 'dependencies' }, defaults: { name: 'dependencies', color: '#3b82f6' } });
    const [compTag] = await CsvDatasourceTag.findOrCreate({ where: { name: 'compliance' }, defaults: { name: 'compliance', color: '#22c55e' } });

    // Create a datasource
    const ds = await CsvDatasource.create({
      name: 'Sample Vulnerability Report',
      description: 'A sample vulnerability scan export for testing.',
      category: 'vulnerability',
      status: 'active',
      metadata: { source: 'sample-scanner', version: '1.0' },
    });
    await ds.setTags([secTag, depTag]);

    // Add labels
    await CsvDatasourceLabel.create({ datasource_id: ds.id, key: 'environment', value: 'production' });
    await CsvDatasourceLabel.create({ datasource_id: ds.id, key: 'team', value: 'platform' });

    // Create an instance with sample payloads
    const instance = await CsvInstance.create({
      datasource_id: ds.id,
      label: 'March 2026 Scan',
      file_name: 'vuln-scan-2026-03.csv',
      file_size_bytes: 2048,
      row_count: 3,
      column_count: 4,
      instance_date: '2026-03-01',
      status: 'ready',
      column_headers: ['cve_id', 'severity', 'package', 'description'],
    });

    await CsvPayload.bulkCreate([
      { instance_id: instance.id, row_index: 0, data: { cve_id: 'CVE-2026-0001', severity: 'high', package: 'lodash', description: 'Prototype pollution' } },
      { instance_id: instance.id, row_index: 1, data: { cve_id: 'CVE-2026-0002', severity: 'medium', package: 'express', description: 'Open redirect' } },
      { instance_id: instance.id, row_index: 2, data: { cve_id: 'CVE-2026-0003', severity: 'low', package: 'chalk', description: 'ReDoS vulnerability' } },
    ]);

    // Create a second datasource
    const ds2 = await CsvDatasource.create({
      name: 'Compliance Audit Q1',
      description: 'Quarterly compliance audit results.',
      category: 'compliance',
      status: 'active',
    });
    await ds2.setTags([compTag]);

    console.log('Seed complete.');
  } finally {
    await sequelize.close();
  }
}

seed();
