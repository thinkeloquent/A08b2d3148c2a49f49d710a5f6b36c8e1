import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DevEnvUrlSwitcher } from '@internal/dev-env-url-switcher';
import './styles.css';
import { PanelLeftSidebarSearch, FuzzyHighlight, fuzzy } from '../src';
import type { FacetMap } from '../src';

/* ── Sample data ────────────────────────────────────────────── */

interface Resource {
  id: number;
  name: string;
  type: string;
  status: string;
  owner: string;
  team: string;
  tags: string[];
  updated: string;
  desc: string;
}

const FACETS: FacetMap = {
  type:   { label: 'Type',   icon: '◆', accent: '#0d9488', values: ['Document', 'Project', 'Task', 'Person', 'Link', 'Snippet'] },
  status: { label: 'Status', icon: '●', accent: '#f59e0b', values: ['Active', 'Archived', 'Draft', 'Completed', 'Paused'] },
  owner:  { label: 'Owner',  icon: '◉', accent: '#6366f1', values: ['Sarah Chen', 'Marcus Rivera', 'Aisha Patel', 'James Okonkwo', 'Lena Mueller'] },
  tag:    { label: 'Tag',    icon: '▪', accent: '#ec4899', values: ['Urgent', 'Q2-Planning', 'Design', 'Engineering', 'Finance', 'Marketing', 'Research'] },
  team:   { label: 'Team',   icon: '◫', accent: '#0ea5e9', values: ['Marketing', 'Engineering', 'Design', 'Product', 'Sales', 'Operations'] },
};

const RESOURCES: Resource[] = [
  { id: 1,  name: 'Q2 Marketing Strategy Deck',    type: 'Document', status: 'Active',    owner: 'Sarah Chen',     team: 'Marketing',   tags: ['Q2-Planning', 'Marketing'],  updated: '2h ago',  desc: 'Comprehensive go-to-market plan for Q2 product launches' },
  { id: 2,  name: 'Design System v3 Migration',     type: 'Project',  status: 'Active',    owner: 'Lena Mueller',   team: 'Design',      tags: ['Design', 'Engineering'],     updated: '45m ago', desc: 'Migrate all components to the new token-based design system' },
  { id: 3,  name: 'Sprint 14 Retrospective',        type: 'Document', status: 'Completed', owner: 'Marcus Rivera',  team: 'Engineering', tags: ['Engineering'],               updated: '1d ago',  desc: 'Retro notes and action items from sprint 14' },
  { id: 4,  name: 'Customer Onboarding Flow Audit', type: 'Task',     status: 'Active',    owner: 'Aisha Patel',    team: 'Product',     tags: ['Research', 'Design'],        updated: '3h ago',  desc: 'Audit the current onboarding funnel for drop-off points' },
  { id: 5,  name: 'Sarah Chen',                     type: 'Person',   status: 'Active',    owner: 'Sarah Chen',     team: 'Marketing',   tags: ['Marketing'],                 updated: '',        desc: 'VP of Marketing - SF Office' },
  { id: 6,  name: 'Competitor Analysis - Acme Corp', type: 'Document', status: 'Draft',     owner: 'James Okonkwo',  team: 'Sales',       tags: ['Research', 'Q2-Planning'],   updated: '5h ago',  desc: 'Detailed feature comparison and pricing analysis' },
  { id: 7,  name: 'CI/CD Pipeline Optimization',    type: 'Project',  status: 'Active',    owner: 'Marcus Rivera',  team: 'Engineering', tags: ['Engineering'],               updated: '20m ago', desc: 'Reduce build times by 40% with caching and parallelization' },
  { id: 8,  name: 'Brand Guidelines 2025',          type: 'Link',     status: 'Active',    owner: 'Lena Mueller',   team: 'Design',      tags: ['Design', 'Marketing'],       updated: '2d ago',  desc: 'Brand guidelines and asset library' },
  { id: 9,  name: 'Revenue Dashboard SQL Query',    type: 'Snippet',  status: 'Active',    owner: 'Aisha Patel',    team: 'Operations',  tags: ['Finance'],                   updated: '1d ago',  desc: 'Monthly revenue rollup query' },
  { id: 10, name: 'Quarterly OKR Review Template',  type: 'Document', status: 'Active',    owner: 'James Okonkwo',  team: 'Product',     tags: ['Q2-Planning'],               updated: '4h ago',  desc: 'Standardized template for cross-functional OKR scoring' },
  { id: 11, name: 'Fix: Payment webhook timeout',   type: 'Task',     status: 'Completed', owner: 'Marcus Rivera',  team: 'Engineering', tags: ['Urgent', 'Engineering'],     updated: '6h ago',  desc: 'Stripe webhook failing after 30s on large batch events' },
  { id: 12, name: 'Deprecate Legacy Auth Module',   type: 'Task',     status: 'Paused',    owner: 'Marcus Rivera',  team: 'Engineering', tags: ['Engineering'],               updated: '3d ago',  desc: 'Replace OAuth 1.0 flow with PKCE - blocked by compliance review' },
];

const TYPE_META: Record<string, { icon: string; bg: string; ring: string }> = {
  Document: { icon: '📄', bg: 'bg-teal-50',    ring: 'ring-teal-200' },
  Project:  { icon: '🗂️', bg: 'bg-violet-50',  ring: 'ring-violet-200' },
  Task:     { icon: '☑️', bg: 'bg-amber-50',   ring: 'ring-amber-200' },
  Person:   { icon: '👤', bg: 'bg-sky-50',     ring: 'ring-sky-200' },
  Link:     { icon: '🔗', bg: 'bg-rose-50',    ring: 'ring-rose-200' },
  Snippet:  { icon: '✦',  bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
};

const STATUS_DOT: Record<string, string> = {
  Active: 'bg-emerald-500', Completed: 'bg-blue-400', Draft: 'bg-gray-400',
  Paused: 'bg-amber-400', Archived: 'bg-gray-300',
};

const HINTS = [
  { syntax: 'type:document', desc: 'Filter by resource type' },
  { syntax: 'owner:sarah',   desc: 'Filter by owner name' },
  { syntax: 'status:active', desc: 'Filter by status' },
  { syntax: 'tag:urgent',    desc: 'Filter by tag' },
  { syntax: 'team:engineering', desc: 'Filter by team' },
];

/* ── Render helpers ─────────────────────────────────────────── */

function ResourceCard({ resource, queryText, index }: { resource: Resource; queryText: string; index: number }) {
  const tm = TYPE_META[resource.type] || TYPE_META.Document;
  const nameMatch = queryText ? fuzzy(resource.name, queryText) : { hit: true, score: 0, idx: [] as number[] };
  const descMatch = queryText ? fuzzy(resource.desc, queryText) : { hit: false, score: 0, idx: [] as number[] };

  return (
    <div
      key={resource.id}
      className="group relative flex items-start gap-3.5 px-4 py-3.5 rounded-xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm hover:shadow-gray-100 transition-all duration-200 cursor-pointer"
    >
      <div className={`w-9 h-9 rounded-xl ${tm.bg} ring-1 ${tm.ring} flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
        {tm.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-gray-900 truncate">
            <FuzzyHighlight text={resource.name} idx={nameMatch.idx} />
          </span>
          {resource.status && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[resource.status] || 'bg-gray-300'}`} />
              <span className="text-[10px] text-gray-400 font-medium">{resource.status}</span>
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mb-1.5 leading-relaxed">
          {descMatch.hit ? <FuzzyHighlight text={resource.desc} idx={descMatch.idx} /> : resource.desc}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {resource.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">{tag}</span>
          ))}
          <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">
            {resource.owner}{resource.updated ? ` · ${resource.updated}` : ''}
          </span>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-teal-100 flex items-center justify-center text-gray-400 hover:text-teal-600 transition-colors cursor-pointer text-xs">
          →
        </div>
      </div>
    </div>
  );
}

/* ── Examples ───────────────────────────────────────────────── */

const EXAMPLES = [
  { name: 'Full Example', path: '/' },
  { name: 'Minimal (no grouping)', path: '/minimal' },
];

function FullExample() {
  return (
    <div className="h-screen bg-stone-50 flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="w-[400px] border-r border-gray-200 bg-stone-50 p-4">
        <PanelLeftSidebarSearch<Resource>
          items={RESOURCES}
          facets={FACETS}
          getSearchableFields={(r) => ({ name: r.name, description: r.desc, tags: r.tags })}
          getFacetValue={(r, key) => key === 'tag' ? r.tags.join(' ') : (r as any)[key] || ''}
          renderItem={(r, queryText, i) => <ResourceCard key={r.id} resource={r} queryText={queryText} index={i} />}
          getGroupKey={(r) => r.type}
          groupByLabel="Group by type"
          renderGroupHeader={(type, count) => (
            <div className="flex items-center gap-2 mb-2 px-2">
              <span className="text-sm">{TYPE_META[type]?.icon || '◆'}</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{type}s</span>
              <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">{count}</span>
              <div className="flex-1 h-px bg-gray-200/60 ml-2" />
            </div>
          )}
          title="Resource Search"
          subtitle="Fuzzy search + structured filters"
          headerIcon={
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="2" />
                <path d="M13.5 13.5L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          }
          hints={HINTS}
          footer={
            <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2 py-2">
              {RESOURCES.length} resources indexed
            </div>
          }
        />
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Main content area
      </div>
    </div>
  );
}

function MinimalExample() {
  return (
    <div className="h-screen bg-stone-50 flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="w-[360px] border-r border-gray-200 bg-white p-4">
        <PanelLeftSidebarSearch<Resource>
          items={RESOURCES.slice(0, 6)}
          facets={{ status: FACETS.status, owner: FACETS.owner }}
          getSearchableFields={(r) => ({ name: r.name, description: r.desc })}
          getFacetValue={(r, key) => (r as any)[key] || ''}
          renderItem={(r, queryText, i) => (
            <div key={r.id} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <FuzzyHighlight text={r.name} idx={queryText ? fuzzy(r.name, queryText).idx : []} />
            </div>
          )}
          placeholder="Search..."
        />
      </div>
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Main content area
      </div>
    </div>
  );
}

function DevNav() {
  const navigate = useNavigate();
  return (
    <DevEnvUrlSwitcher
      links={EXAMPLES.map((e) => ({ name: e.name, url: e.path }))}
      onNavigate={(url) => navigate(url)}
      triggerLabel="Examples"
      title="Component Examples"
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <DevNav />
    <Routes>
      <Route path="/" element={<FullExample />} />
      <Route path="/minimal" element={<MinimalExample />} />
    </Routes>
  </BrowserRouter>,
);
