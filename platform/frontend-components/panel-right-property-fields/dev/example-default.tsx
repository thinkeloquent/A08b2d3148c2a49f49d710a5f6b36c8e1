import { useState } from 'react';
import { PanelRightPropertyFields } from '../src';
import type { PropertyFieldGroup } from '../src';

const VULNERABILITY_GROUPS: PropertyFieldGroup[] = [
  {
    name: 'Identity',
    fields: [{ label: 'vulnerability_id', fieldKey: 'vulnerabilityId' }],
  },
  {
    name: 'Package',
    fields: [
      { label: 'package_name', fieldKey: 'packageName' },
      { label: 'package_version', fieldKey: 'targetVersion' },
    ],
  },
  {
    name: 'Assessment',
    fields: [{ label: 'severity', fieldKey: 'severity' }],
  },
  {
    name: 'Source',
    fields: [{ label: 'repo', fieldKey: 'repo' }],
  },
  {
    name: 'Other',
    fields: [
      { label: 'ecosystem', fieldKey: 'ecosystem' },
      { label: 'cvss_score', fieldKey: 'cvss_score' },
      { label: 'title', fieldKey: 'title' },
      { label: 'fixed_version', fieldKey: 'fixed_version' },
      { label: 'manifest_path', fieldKey: 'manifest_path' },
      { label: 'status', fieldKey: 'status' },
      { label: 'published_at', fieldKey: 'published_at' },
      { label: 'detected_at', fieldKey: 'detected_at' },
    ],
  },
];

export default function ExampleDefault() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex h-screen bg-slate-100 font-['DM_Sans']">
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Main content area
      </div>
      <PanelRightPropertyFields
        title="Fields"
        titleIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-400"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
        }
        groups={VULNERABILITY_GROUPS}
        searchValue={search}
        onSearchChange={setSearch}
        onFieldClick={(field, group) =>
          console.log('Clicked:', field.label, 'in', group.name)
        }
      />
    </div>
  );
}
