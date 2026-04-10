import { useState } from 'react';
import { TemplateManagePresents } from '../src';
import type { TemplatePreset } from '../src';

const SAMPLE_PRESETS: TemplatePreset[] = [
  {
    id: 'p1',
    slug: 'rest-api-service',
    name: 'REST API Service',
    description: 'Production-ready REST API with authentication, rate limiting, and OpenAPI documentation.',
    category: 'Backend',
    version: '2.4.0',
    template: 'node-service',
    templateVersion: '3.1.0',
    uses: 847,
    successRate: 99.2,
    status: 'published',
    featured: true,
    tags: ['api', 'rest', 'node', 'production'],
  },
  {
    id: 'p2',
    slug: 'react-dashboard',
    name: 'React Dashboard',
    description: 'Full-featured dashboard with charting, data tables, filtering, and responsive layout.',
    category: 'Frontend',
    version: '1.8.0',
    template: 'react-app',
    templateVersion: '2.0.0',
    uses: 523,
    successRate: 97.8,
    status: 'published',
    tags: ['react', 'dashboard', 'tailwind'],
  },
  {
    id: 'p3',
    slug: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline with schema validation, retry logic, and monitoring dashboards.',
    category: 'Data',
    version: '1.2.0',
    template: 'python-pipeline',
    templateVersion: '1.5.0',
    uses: 234,
    status: 'published',
    tags: ['etl', 'python', 'pipeline'],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  backend: 'blue',
  frontend: 'purple',
  data: 'amber',
};

export default function ExampleCatalogOnly() {
  const [selected, setSelected] = useState<TemplatePreset | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-['DM_Sans',sans-serif]">
      <div className="max-w-5xl mx-auto">
        {selected ? (
          <TemplateManagePresents.PresetDetail
            preset={selected}
            categoryColors={CATEGORY_COLORS}
            onBack={() => setSelected(null)}
            onGenerate={() => console.log('Generate from:', selected.name)}
          />
        ) : (
          <TemplateManagePresents.Catalog
            presets={SAMPLE_PRESETS}
            categories={['Backend', 'Frontend', 'Data']}
            categoryColors={CATEGORY_COLORS}
            onSelect={setSelected}
          />
        )}
      </div>
    </div>
  );
}
