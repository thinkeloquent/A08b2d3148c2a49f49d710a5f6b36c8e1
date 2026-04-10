import { createRoot } from 'react-dom/client';
import './styles.css';
import { AuditLog } from '../src';
import type { AuditLogEntry } from '../src';

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: 1,
    action: 'update',
    performer: 'admin',
    timestamp: '2024-04-23T12:35:00',
    tags: {
      type: 'customer.email',
      key_path: 'email',
      value: 'job.bob@example.com',
    },
  },
  {
    id: 2,
    action: 'create',
    performer: 'admin',
    timestamp: '2024-04-23T12:15:00',
    tags: {
      type: 'billing.address',
      key_path: 'version',
      diffs: { value: '435 dim St.' },
    },
  },
  {
    id: 3,
    action: 'create',
    performer: 'admin',
    timestamp: '2024-04-23T12:15:00',
    tags: {
      type: 'customer.name',
      key_path: 'version',
      diffs: { key_path: 'dkey.Alice' },
    },
  },
  {
    id: 4,
    action: 'delete',
    performer: 'admin',
    timestamp: '2024-04-23T12:00:00',
    tags: null,
  },
  {
    id: 5,
    action: 'restore',
    performer: 'admin',
    timestamp: '2024-04-23T11:45:00',
    tags: null,
  },
  {
    id: 6,
    action: 'create',
    performer: 'admin',
    timestamp: '2024-04-23T11:30:00',
    tags: {
      type: 'order.id',
      key_path: 'version',
      diffs: { value: '1001' },
    },
  },
  {
    id: 7,
    action: 'create',
    performer: 'admin',
    timestamp: '2024-04-23T11:50:00',
    tags: {
      type: 'order.id',
      key_value: '1001',
    },
  },
];

createRoot(document.getElementById('root')!).render(
  <AuditLog logs={SAMPLE_LOGS} />,
);
