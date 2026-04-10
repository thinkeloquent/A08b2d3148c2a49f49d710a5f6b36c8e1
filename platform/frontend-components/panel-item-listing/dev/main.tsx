import { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { PanelItemListing, PanelListItem } from '../src';
import type { FilterOption } from '../src';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import type { DevEnvUrlSwitcherLink } from '@internal/dev-env-url-switcher';
import { DevEnvUrlSwitcherNav } from '@internal/dev-env-url-switcher-nav';

/* ------------------------------------------------------------------ */
/*  Dev environment links                                              */
/* ------------------------------------------------------------------ */
const DEV_LINKS: DevEnvUrlSwitcherLink[] = [
  { url: 'http://localhost:5228', name: 'This Dev Server' },
  { url: 'http://localhost:51000', name: 'Fastify API' },
  { url: 'http://localhost:52000', name: 'FastAPI Server' },
  { url: 'https://github.com', name: 'GitHub' },
  { url: 'https://figma.com', name: 'Figma' },
];

/* ------------------------------------------------------------------ */
/*  Shared SVG icons                                                    */
/* ------------------------------------------------------------------ */
function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared badge component                                              */
/* ------------------------------------------------------------------ */
function StatusBadge({ status, colorMap }: { status: string; colorMap?: Record<string, string> }) {
  const defaultColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    archived: 'bg-orange-100 text-orange-800',
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800',
    member: 'bg-blue-100 text-blue-800',
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800',
  };
  const colors = colorMap ?? defaultColors;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ================================================================== */
/*  EXAMPLE 1 — Organizations (original)                               */
/* ================================================================== */
interface OrgItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
}

const ORG_ITEMS: OrgItem[] = [
  { id: '1', name: 'Think Eloquent', slug: 'think-eloquent', status: 'active' },
  { id: '2', name: 'API Create mnj8h21r_qkfe', slug: 'api-create-mnj8h21rqkfe', description: 'Created via API test', status: 'active' },
  { id: '3', name: 'API Update mnj8h21z_axd1', slug: 'api-update-mnj8h21zaxd1', description: 'Will be updated', status: 'active' },
  { id: '4', name: 'UI Create mnj8h21z_axd1', slug: 'ui-create-mnj8h21zaxd1', description: 'Automated test organization', status: 'active' },
  { id: '5', name: 'probe_update_1775240676', slug: 'probeupdate1775240676', description: 'test', status: 'inactive' },
  { id: '6', name: 'Archived Project', slug: 'archived-project', description: 'No longer maintained', status: 'archived' },
];

const ORG_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

function OrganizationsExample() {
  const [selectedId, setSelectedId] = useState<string>('1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = ORG_ITEMS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q),
      );
    }
    if (filter !== 'all') {
      result = result.filter((i) => i.status === filter);
    }
    return result;
  }, [search, filter]);

  const selected = ORG_ITEMS.find((i) => i.id === selectedId);

  return (
    <PanelItemListing
      title="Organizations"
      items={filtered}
      getItemKey={(item) => item.id}
      selectedKey={selectedId}
      onItemSelect={(item) => setSelectedId(item.id)}
      searchPlaceholder="Search organizations..."
      searchValue={search}
      onSearchChange={setSearch}
      searchIcon={<SearchIcon />}
      filterOptions={ORG_FILTERS}
      filterValue={filter}
      onFilterChange={setFilter}
      actionLabel="Create Organization"
      actionIcon={<PlusIcon />}
      onActionClick={() => alert('Create clicked')}
      totalCount={ORG_ITEMS.length}
      itemLabel="organizations"
      renderItem={(item, isSelected) => (
        <PanelListItem
          title={item.name}
          subtitle={item.slug}
          description={item.description}
          isSelected={isSelected}
          icon={<DocIcon />}
          badge={<StatusBadge status={item.status} />}
        />
      )}
    >
      {selected ? (
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <DocIcon />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
              <p className="text-sm text-gray-500">{selected.slug}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className="mt-1"><StatusBadge status={selected.status} /></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-gray-600 italic">{selected.description || 'No description provided'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">Select an item from the list</p>
        </div>
      )}
    </PanelItemListing>
  );
}

/* ================================================================== */
/*  EXAMPLE 2 — Team Members (no filter, custom empty state)            */
/* ================================================================== */
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'online' | 'offline';
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 't1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', status: 'online' },
  { id: 't2', name: 'Bob Williams', email: 'bob@example.com', role: 'member', status: 'online' },
  { id: 't3', name: 'Carol Davis', email: 'carol@example.com', role: 'member', status: 'offline' },
  { id: 't4', name: 'Dave Martin', email: 'dave@example.com', role: 'admin', status: 'offline' },
];

function TeamMembersExample() {
  const [selectedId, setSelectedId] = useState<string>('t1');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return TEAM_MEMBERS;
    const q = search.toLowerCase();
    return TEAM_MEMBERS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [search]);

  const selected = TEAM_MEMBERS.find((m) => m.id === selectedId);

  return (
    <PanelItemListing
      title="Team Members"
      items={filtered}
      getItemKey={(m) => m.id}
      selectedKey={selectedId}
      onItemSelect={(m) => setSelectedId(m.id)}
      searchPlaceholder="Search members..."
      searchValue={search}
      onSearchChange={setSearch}
      searchIcon={<SearchIcon />}
      actionLabel="Invite Member"
      actionIcon={<PlusIcon />}
      onActionClick={() => alert('Invite clicked')}
      totalCount={TEAM_MEMBERS.length}
      itemLabel="members"
      emptyContent={
        <div className="text-center">
          <UserIcon />
          <p className="mt-2 text-sm text-gray-500">No members match your search</p>
        </div>
      }
      renderItem={(member, isSelected) => (
        <PanelListItem
          title={member.name}
          subtitle={member.email}
          isSelected={isSelected}
          icon={<UserIcon />}
          badge={
            <div className="flex gap-1.5">
              <StatusBadge status={member.role} />
              <StatusBadge status={member.status} />
            </div>
          }
        />
      )}
    >
      {selected ? (
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {selected.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
              <p className="text-sm text-gray-500">{selected.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={selected.role} />
            <StatusBadge status={selected.status} />
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">Select a member</p>
        </div>
      )}
    </PanelItemListing>
  );
}

/* ================================================================== */
/*  EXAMPLE 3 — Services (loading & error states)                       */
/* ================================================================== */
interface ServiceItem {
  id: string;
  name: string;
  endpoint: string;
  health: 'healthy' | 'degraded' | 'down';
}

const SERVICE_ITEMS: ServiceItem[] = [
  { id: 's1', name: 'Auth Service', endpoint: '/api/auth', health: 'healthy' },
  { id: 's2', name: 'User Service', endpoint: '/api/users', health: 'healthy' },
  { id: 's3', name: 'Payment Gateway', endpoint: '/api/payments', health: 'degraded' },
  { id: 's4', name: 'Notification Service', endpoint: '/api/notifications', health: 'down' },
  { id: 's5', name: 'Search Index', endpoint: '/api/search', health: 'healthy' },
];

const HEALTH_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Health' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'down', label: 'Down' },
];

function ServicesExample() {
  const [selectedId, setSelectedId] = useState<string>('s1');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'all') return SERVICE_ITEMS;
    return SERVICE_ITEMS.filter((s) => s.health === filter);
  }, [filter]);

  const selected = SERVICE_ITEMS.find((s) => s.id === selectedId);

  return (
    <div>
      <div className="flex gap-2 mb-2 px-1">
        <button
          onClick={() => setIsLoading((v) => !v)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${isLoading ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          Toggle Loading
        </button>
        <button
          onClick={() => setShowError((v) => !v)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${showError ? 'bg-red-100 border-red-300 text-red-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          Toggle Error
        </button>
      </div>
      <PanelItemListing
        title="Services"
        items={filtered}
        getItemKey={(s) => s.id}
        selectedKey={selectedId}
        onItemSelect={(s) => setSelectedId(s.id)}
        filterOptions={HEALTH_FILTERS}
        filterValue={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
        error={showError ? { message: 'Failed to fetch service health data' } : null}
        totalCount={SERVICE_ITEMS.length}
        itemLabel="services"
        renderItem={(service, isSelected) => (
          <PanelListItem
            title={service.name}
            subtitle={service.endpoint}
            isSelected={isSelected}
            icon={<ServerIcon />}
            badge={<StatusBadge status={service.health} />}
          />
        )}
      >
        {selected && !isLoading && !showError ? (
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <ServerIcon />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selected.name}</h1>
                <p className="text-sm text-gray-500 font-mono">{selected.endpoint}</p>
              </div>
            </div>
            <StatusBadge status={selected.health} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400">Select a service to view details</p>
          </div>
        )}
      </PanelItemListing>
    </div>
  );
}

/* ================================================================== */
/*  EXAMPLE 4 — Minimal (bare minimum props)                            */
/* ================================================================== */
const MINIMAL_ITEMS = [
  { id: 'a', label: 'First item' },
  { id: 'b', label: 'Second item' },
  { id: 'c', label: 'Third item' },
];

function MinimalExample() {
  const [selectedId, setSelectedId] = useState<string>('a');
  const selected = MINIMAL_ITEMS.find((i) => i.id === selectedId);

  return (
    <PanelItemListing
      title="Minimal"
      items={MINIMAL_ITEMS}
      getItemKey={(i) => i.id}
      selectedKey={selectedId}
      onItemSelect={(i) => setSelectedId(i.id)}
      renderItem={(item, isSelected) => (
        <PanelListItem title={item.label} isSelected={isSelected} />
      )}
    >
      {selected ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-lg text-gray-700 font-medium">Selected: {selected.label}</p>
        </div>
      ) : null}
    </PanelItemListing>
  );
}

/* ================================================================== */
/*  Root App — tab switcher for all examples                            */
/* ================================================================== */
const EXAMPLE_NAV_LINKS = [
  { url: 'orgs', name: 'Organizations' },
  { url: 'team', name: 'Team Members' },
  { url: 'services', name: 'Services' },
  { url: 'minimal', name: 'Minimal' },
];

type ExampleKey = 'orgs' | 'team' | 'services' | 'minimal';

function App() {
  const [active, setActive] = useState<ExampleKey>('orgs');

  return (
    <div className="h-screen flex flex-col font-['DM_Sans']">
      <DevEnvUrlSwitcherNav
        links={EXAMPLE_NAV_LINKS}
        activeUrl={active}
        onNavigate={(url) => setActive(url as ExampleKey)}
        label="Examples:"
      />

      {/* Active example */}
      <div className="flex-1 overflow-hidden">
        {active === 'orgs' && <OrganizationsExample />}
        {active === 'team' && <TeamMembersExample />}
        {active === 'services' && <ServicesExample />}
        {active === 'minimal' && <MinimalExample />}
      </div>

      {/* DevEnvUrlSwitcher — floating overlay */}
      <DevEnvUrlSwitcher
        links={DEV_LINKS}
        triggerLabel="Dev Links"
        title="Dev Environment"
        searchPlaceholder="Search dev links..."
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
