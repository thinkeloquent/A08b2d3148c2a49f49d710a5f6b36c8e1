import { createRoot } from 'react-dom/client';
import './styles.css';
import { TaskProgressBarTrackerWidget } from '../src';
import type { ProgressStep } from '../src';

const SAMPLE_STEPS: ProgressStep[] = [
  { id: 1, label: "Data Ingestion",      description: "Pull raw records from source APIs",              status: "completed",   duration: "2m 14s" },
  { id: 2, label: "Schema Validation",    description: "Validate structure against data contract v3.2",  status: "completed",   duration: "1m 08s" },
  { id: 3, label: "Deduplication",        description: "Remove duplicate entries across shards",         status: "completed",   duration: "3m 41s" },
  { id: 4, label: "Enrichment",           description: "Append geo and firmographic metadata",           status: "in-progress", duration: null },
  { id: 5, label: "Quality Gate",         description: "Run anomaly detection and drift checks",         status: "pending",     duration: null },
  { id: 6, label: "Publish to Warehouse", description: "Write final dataset to destination table",       status: "pending",     duration: null },
];

createRoot(document.getElementById('root')!).render(
  <TaskProgressBarTrackerWidget
    steps={SAMPLE_STEPS}
    modalFooter={
      <span className="text-xs font-semibold text-indigo-600">Open Task Manager</span>
    }
  />,
);
