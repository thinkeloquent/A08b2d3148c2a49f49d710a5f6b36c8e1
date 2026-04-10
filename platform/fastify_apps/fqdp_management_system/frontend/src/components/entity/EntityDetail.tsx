/**
 * EntityDetail - Generic detail view component
 * Works for any entity type with configuration
 */

import { useState } from 'react';
import type { BaseEntity, EntityType, Reference } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { Card, CardHeader, CardContent, Button, Badge, Input, Modal, ModalFooter } from '@/components/ui';
import { Edit, Trash2, Calendar, User, ArrowRight, Building, Link, Plus, ExternalLink, X, Copy, Check, Code } from 'lucide-react';
import { format } from 'date-fns';
import { useEntityReferences, useCreateReference, useDeleteReference } from '@/hooks/useReferences';

export interface EntityDetailProps<T extends BaseEntity> {
  entity: T;
  config: EntityConfig<any>;
  onEdit: () => void;
  onDelete: () => void;
  onViewChildren?: () => void;
  onNavigateToParent?: (parentId: string) => void;
  onNavigateToGrandparent?: (grandparentId: string) => void;
  parentEntities?: Map<string, BaseEntity>; // Map of parent IDs to parent entities
}

function IntegrationCard({ entityType, entityId, label }: { entityType: string; entityId: string; label: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const apiBase = '/~/api/fqdp_management_system';
  const endpoint = `${apiBase}/${entityType}s/${entityId}`;

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
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Code className="h-5 w-5 mr-2 text-gray-400" />
          Integration
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* REST endpoint */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              REST API — Get {label}
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
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{curlCmd}</pre>
              <div className="absolute top-1.5 right-1.5">
                <CopyBtn text={curlCmd} id="curl" />
              </div>
            </div>
          </div>

          {/* Fetch */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">JavaScript (fetch)</label>
            <div className="mt-1.5 relative rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{fetchCmd}</pre>
              <div className="absolute top-1.5 right-1.5">
                <CopyBtn text={fetchCmd} id="fetch" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EntityDetail<T extends BaseEntity>({
  entity,
  config,
  onEdit,
  onDelete,
  onViewChildren,
  onNavigateToParent,
  parentEntities
}: EntityDetailProps<T>) {
  const Icon = config.icon;
  const childCount = config.child ? (entity as any)[config.child.countKey] as number : undefined;
  const ChildIcon = config.child?.icon;

  // Inline references
  const entityType = config.type as EntityType;
  const { data: refsData, isLoading: refsLoading } = useEntityReferences(entityType, entity.id);
  const createRef = useCreateReference();
  const deleteRef = useDeleteReference();
  const [showRefForm, setShowRefForm] = useState(false);
  const [refForm, setRefForm] = useState({ name: '', link: '', type: '', externalUid: '' });
  const references = (refsData?.data || []) as Reference[];

  const handleAddRef = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRef.mutateAsync({
      entityType,
      entityId: entity.id,
      ...refForm
    });
    setRefForm({ name: '', link: '', type: '', externalUid: '' });
    setShowRefForm(false);
  };

  const handleDeleteRef = async (refId: string) => {
    await deleteRef.mutateAsync(refId);
  };

  // Get parent entity if applicable
  const parentId = config.parent ? (entity as any)[config.parent.idKey] as string : undefined;
  const parentEntity = parentId && parentEntities ? parentEntities.get(parentId) : undefined;

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 rounded-lg ${config.colors.bg} p-3`}>
                <Icon className={`h-8 w-8 ${config.colors.primary}`} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {entity.name}
                </h2>
                <p className="text-sm font-mono mt-1">
                  {(entity as {slug?: string;}).slug?.split('>>').map((part, i, arr) =>
                  <span key={i}>
                      <span className="text-gray-700">{part}</span>
                      {i < arr.length - 1 && <span className="text-gray-400 mx-0.5">{'>>'}</span>}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={onEdit} variant="secondary" size="sm" data-testid="edit-button">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={onDelete} variant="danger" size="sm" data-testid="delete-button">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Parent Navigation (if not root) */}
            {config.parent && parentEntity && onNavigateToParent &&
            <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {config.parent.label.singular}
                </label>
                <button
                onClick={() => onNavigateToParent(parentEntity.id)}
                className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">

                  <span className="font-medium">{parentEntity.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            }

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-2">
                <Badge status={entity.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-2 text-gray-900">
                {entity.description ||
                <span className="text-gray-400 italic">No description provided</span>
                }
              </p>
            </div>

            {/* Metadata Tags */}
            {entity.metadata?.tags && entity.metadata.tags.length > 0 &&
            <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {entity.metadata.tags.map((tag, index) =>
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">

                      {tag}
                    </span>
                )}
                </div>
              </div>
            }

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(entity.createdAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {entity.createdBy}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(entity.updatedAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {entity.updatedBy}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Card (if not a leaf node) */}
      {config.child && childCount !== undefined &&
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                {ChildIcon && <ChildIcon className="h-5 w-5 mr-2 text-gray-400" />}
                {config.child.label.plural}
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                This {config.label.singular.toLowerCase()} has{' '}
                <span className="font-semibold text-gray-900">
                  {childCount}
                </span>{' '}
                {childCount === 1 ? config.child.label.singular : config.child.label.plural}
              </p>
              {onViewChildren &&
            <Button onClick={onViewChildren} variant="secondary" size="sm">
                  View {config.child.label.plural}
                </Button>
            }
            </div>
          </CardContent>
        </Card>
      }

      {/* Inline References */}
      {entityType !== 'reference' &&
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Link className="h-5 w-5 mr-2 text-gray-400" data-test-id="link-2107f78d" />
                References
                {references.length > 0 &&
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {references.length}
                  </span>
              }
              </h3>
              <Button onClick={() => setShowRefForm(true)} variant="secondary" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {refsLoading ?
          <p className="text-sm text-gray-500">Loading references...</p> :
          references.length === 0 ?
          <p className="text-sm text-gray-400 italic">No references linked to this {config.label.singular.toLowerCase()}</p> :

          <div className="space-y-2">
                {references.map((ref) =>
            <div key={ref.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="rounded bg-teal-100 p-1.5">
                        <Link className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{ref.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="inline-flex items-center rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-600">{ref.type}</span>
                          <span className="mx-1.5 text-gray-300">|</span>
                          <span className="font-mono">{ref.externalUid}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <a href={ref.link} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => handleDeleteRef(ref.id)} className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
            )}
              </div>
          }
          </CardContent>
        </Card>
      }

      {/* Integration / API Section */}
      <IntegrationCard entityType={config.type} entityId={entity.id} label={config.label.singular} />

      {/* Add Reference Modal */}
      <Modal isOpen={showRefForm} onClose={() => setShowRefForm(false)} title="Add Reference" size="sm">
        <form onSubmit={handleAddRef} className="space-y-3">
          <Input
            label="Name"
            required
            value={refForm.name}
            onChange={(e) => setRefForm({ ...refForm, name: e.target.value })}
            placeholder="e.g., Design Tokens Repo" data-test-id="input-d3840e66" />

          <Input
            label="Link"
            required
            value={refForm.link}
            onChange={(e) => setRefForm({ ...refForm, link: e.target.value })}
            placeholder="https://..." data-test-id="input-7d2d38de" />

          <Input
            label="Type"
            required
            value={refForm.type}
            onChange={(e) => setRefForm({ ...refForm, type: e.target.value })}
            placeholder="e.g., service, page, component, repository" data-test-id="input-a269116a" />

          <Input
            label="External UID"
            required
            value={refForm.externalUid}
            onChange={(e) => setRefForm({ ...refForm, externalUid: e.target.value })}
            placeholder="Unique identifier in external system" data-test-id="input-cbe20e07" />

          <ModalFooter data-test-id="modalfooter-dd2b2849">
            <Button type="button" variant="secondary" onClick={() => setShowRefForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createRef.isPending}>
              Add Reference
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>);

}