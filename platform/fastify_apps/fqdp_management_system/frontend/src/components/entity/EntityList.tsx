/**
 * EntityList - Generic list component with search and filters
 * Works for any entity type with configuration
 */

import { useState, useMemo } from 'react';
import type { BaseEntity, EntityStatus } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { EntityListItem } from './EntityListItem';
import { Input, Button, Spinner, Modal, ModalFooter } from '@/components/ui';
import { Plus, AlertCircle, Code, Copy, Check } from 'lucide-react';

export interface EntityListProps<T extends BaseEntity> {
  entities: T[] | undefined;
  config: EntityConfig<any>;
  selectedId?: string;
  onSelect: (entity: BaseEntity) => void;
  onCreateClick: () => void;
  isLoading?: boolean;
  error?: Error | null;
  parentEntities?: BaseEntity[]; // For parent filter dropdown
  parentFilter?: string; // Pre-selected parent filter
}

export function EntityList<T extends BaseEntity>({
  entities,
  config,
  selectedId,
  onSelect,
  onCreateClick,
  isLoading = false,
  error = null,
  parentEntities,
  parentFilter,
}: EntityListProps<T>) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [parentIdFilter, setParentIdFilter] = useState<string>(parentFilter || 'all');
  const [integrationOpen, setIntegrationOpen] = useState(false);

  // Client-side filtering
  const filtered = useMemo(() => {
    if (!entities) return [];

    let result = [...entities];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (entity) =>
          entity.name.toLowerCase().includes(searchLower) ||
          (entity as { slug?: string }).slug?.toLowerCase().includes(searchLower) ||
          entity.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((entity) => entity.status === statusFilter);
    }

    // Parent filter (if applicable)
    if (parentIdFilter !== 'all' && config.parent) {
      result = result.filter((entity) => (entity as any)[config.parent!.idKey] === parentIdFilter);
    }

    return result;
  }, [entities, search, statusFilter, parentIdFilter, config.parent]);

  // Get parent name for list items
  const getParentName = (entity: T): string | undefined => {
    if (!config.parent) return undefined;
    return (entity as any)[config.parent.nameKey] as string;
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{config.label.plural}</h2>
          <button
            onClick={() => setIntegrationOpen(true)}
            className="rounded-md p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="API Integration"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <Input
          placeholder={`Search ${config.label.plural.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Parent filter (if not root entity and has parent entities) */}
        {config.parent && parentEntities && !parentFilter && (
          <div>
            <label htmlFor="parent-filter" className="sr-only">
              Filter by {config.parent.label.singular}
            </label>
            <select
              id="parent-filter"
              value={parentIdFilter}
              onChange={(e) => setParentIdFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All {config.parent.label.plural}</option>
              {parentEntities.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EntityStatus | 'all')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="work-in-progress">Work in Progress</option>
            <option value="archive">Archive</option>
            <option value="locked">Locked</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>

        {/* Create button */}
        <Button onClick={onCreateClick} className="w-full" size="md" data-testid="create-button">
          <Plus className="mr-2 h-4 w-4" />
          Create {config.label.singular}
        </Button>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load {config.label.plural.toLowerCase()}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            {search || statusFilter !== 'all' || parentIdFilter !== 'all'
              ? `No ${config.label.plural.toLowerCase()} match your filters`
              : `No ${config.label.plural.toLowerCase()} yet`}
          </div>
        )}

        {!isLoading &&
          !error &&
          filtered.map((entity) => (
            <EntityListItem
              key={entity.id}
              entity={entity}
              config={config}
              isSelected={entity.id === selectedId}
              onClick={() => onSelect(entity)}
              parentName={getParentName(entity)}
            />
          ))}
      </div>

      {/* Footer with count */}
      {!isLoading && !error && (
        <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          Showing {filtered.length} of {entities?.length || 0} {config.label.plural.toLowerCase()}
        </div>
      )}

      {/* Integration Modal */}
      <ListIntegrationModal
        isOpen={integrationOpen}
        onClose={() => setIntegrationOpen(false)}
        entityType={config.type}
        label={config.label}
      />
    </div>
  );
}

/* ── List-All Integration Modal ─────────────────────────────── */

function ListIntegrationModal({
  isOpen,
  onClose,
  entityType,
  label,
}: {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  label: { singular: string; plural: string };
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const apiBase = '/~/api/fqdp_management_system';
  const endpoint = `${apiBase}/${entityType}s`;

  const curlCmd = `curl -s ${window.location.origin}${endpoint} | jq .`;
  const fetchCmd = `const res = await fetch('${endpoint}');\nconst { data } = await res.json();`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      title="Copy to clipboard"
    >
      {copied === id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${label.plural} API`} size="md">
      <div className="space-y-4 py-2">
        {/* REST endpoint */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            REST API — List all {label.plural}
          </label>
          <div className="mt-1.5 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <code className="text-sm text-gray-800 truncate">
              <span className="text-emerald-600 font-semibold">GET</span>{' '}
              {endpoint}
            </code>
            <CopyBtn text={endpoint} id="endpoint" />
          </div>
        </div>

        {/* cURL */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">cURL</label>
          <div className="mt-1.5 relative rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono pr-8">{curlCmd}</pre>
            <div className="absolute top-1.5 right-1.5">
              <CopyBtn text={curlCmd} id="curl" />
            </div>
          </div>
        </div>

        {/* Fetch */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">JavaScript (fetch)</label>
          <div className="mt-1.5 relative rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono pr-8">{fetchCmd}</pre>
            <div className="absolute top-1.5 right-1.5">
              <CopyBtn text={fetchCmd} id="fetch" />
            </div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}
