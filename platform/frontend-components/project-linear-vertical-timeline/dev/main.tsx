import { createRoot } from 'react-dom/client';
import './styles.css';
import { ProjectLinearVerticalTimeline } from '../src';
import type { TimelineItem } from '../src';

const ToothIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2C9.5 2 7.5 3.5 7 6c-.3 1.5 0 3 .5 4.5.5 1.5 1 3 1 4.5 0 2 .5 4 1.5 5 .5.5 1 .5 1.5.5s1 0 1.5-.5c.5-.5 1-1.5 1-3 0-.5.5-1 1-1s1 .5 1 1c0 1.5.5 2.5 1 3 .5.5 1 .5 1.5.5s1 0 1.5-.5c1-1 1.5-3 1.5-5 0-1.5.5-3 1-4.5S22 7.5 22 6c-.5-2.5-2.5-4-5-4-1 0-2 .5-2.5 1-.5-.5-1.5-1-2.5-1z" />
  </svg>
);

const SAMPLE_ITEMS: TimelineItem[] = [
  {
    id: 1,
    dateLabel: 'MEI',
    dateValue: '03',
    columns: [
      { label: 'Condition', value: 'Caries' },
      { label: 'Treatment', value: 'Tooth filling' },
      { label: 'Dentist', value: 'Drg Soap Mactavish' },
    ],
    status: { type: 'done', label: 'Done' },
    tags: [{ text: 'Advanced Decay' }],
  },
  {
    id: 2,
    dateLabel: 'APR',
    dateValue: '12',
    columns: [
      { label: 'Condition', value: 'Caries' },
      { label: 'Treatment', value: 'Tooth filling' },
      { label: 'Dentist', value: 'Drg Soap Mactavish' },
    ],
    status: { type: 'pending', label: 'Pending' },
    banner: { message: 'Reason: Not enough time' },
    tags: [{ text: 'Decay in pulp' }],
  },
];

createRoot(document.getElementById('root')!).render(
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-8 font-sans antialiased">
    <ProjectLinearVerticalTimeline
      items={SAMPLE_ITEMS}
      header={{
        icon: <ToothIcon />,
        badge: '22',
        title: 'Maxillary Left Lateral Incisor',
        subtitle: 'Treatment History \u2022 2 Records',
      }}
      onAddClick={() => alert('Add treatment record')}
      addButtonLabel="Add Treatment Record"
    />
  </div>,
);
