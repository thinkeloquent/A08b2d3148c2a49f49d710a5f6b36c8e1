/**
 * EntityPage - Generic master-detail page component
 * Works for any entity type with configuration
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BaseEntity, BreadcrumbItem } from '@/types';
import type { EntityConfig } from '@/config/entityConfigs';
import { MainLayout } from '@/components/layout';
import { EntityList } from './EntityList';
import { EntityDetail } from './EntityDetail';
import { EntityForm } from './EntityForm';
import { EntityDeleteDialog } from './EntityDeleteDialog';
import type { ZodSchema } from 'zod';
import type { UseMutationResult } from '@tanstack/react-query';

export interface EntityPageProps<T extends BaseEntity, CreateDTO, UpdateDTO> {
  config: EntityConfig<T>;
  entities: T[] | undefined;
  isLoading?: boolean;
  error?: Error | null;

  // Parent entities for filters and selectors
  parentEntities?: BaseEntity[];

  // CRUD hooks
  createMutation: UseMutationResult<T, Error, CreateDTO>;
  updateMutation: UseMutationResult<T, Error, { id: string; updates: UpdateDTO }>;
  deleteMutation: UseMutationResult<void, Error, string>;

  // Form schema
  schema: ZodSchema<any>;

  // Breadcrumb generator
  generateBreadcrumbs: (entity: T | null) => BreadcrumbItem[];

  // Optional: Pre-selected entity ID or parent filter
  defaultSelectedId?: string;
  parentFilter?: string;
}

export function EntityPage<T extends BaseEntity, CreateDTO, UpdateDTO>({
  config,
  entities,
  isLoading,
  error,
  parentEntities,
  createMutation,
  updateMutation,
  deleteMutation,
  schema,
  generateBreadcrumbs,
  defaultSelectedId,
  parentFilter,
}: EntityPageProps<T, CreateDTO, UpdateDTO>) {
  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id?: string }>();
  const Icon = config.icon;

  const [selectedEntity, setSelectedEntity] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Wrapper for type-safe entity selection — also updates URL
  const handleSelectEntity = (entity: BaseEntity) => {
    setSelectedEntity(entity as T);
    navigate(`/${config.type}s/${entity.id}`, { replace: true });
  };

  // Sync selection from URL param
  useEffect(() => {
    if (!entities) return;
    if (urlId) {
      const entity = entities.find((e) => e.id === urlId);
      if (entity) setSelectedEntity(entity);
    }
  }, [urlId, entities]);

  // Auto-select entity if defaultSelectedId is provided
  useEffect(() => {
    if (!defaultSelectedId || !entities) return;

    const entity = entities.find((e) => e.id === defaultSelectedId);
    if (entity) {
      setSelectedEntity(entity);
    }
  }, [defaultSelectedId, entities]);

  // Keep the selected entity reference in sync with the latest entities data
  useEffect(() => {
    if (!entities) return;

    setSelectedEntity((current) => {
      if (!current) return current;
      const updated = entities.find((entity) => entity.id === current.id);
      return updated ?? current;
    });
  }, [entities]);

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(selectedEntity);
  }, [selectedEntity, generateBreadcrumbs]);

  // Create parent entity map for detail view
  const parentEntityMap = useMemo(() => {
    if (!parentEntities) return undefined;
    const map = new Map<string, BaseEntity>();
    parentEntities.forEach((entity) => map.set(entity.id, entity));
    return map;
  }, [parentEntities]);

  // Handlers
  const handleCreateClick = () => {
    setEditMode(false);
    setFormOpen(true);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setFormOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      console.log(`[EntityPage] ${editMode ? 'Updating' : 'Creating'} ${config.label.singular}:`, data);

      let result: T | null = null;

      if (editMode && selectedEntity) {
        result = await updateMutation.mutateAsync({
          id: selectedEntity.id,
          updates: data as unknown as UpdateDTO,
        });
        console.log(`[EntityPage] Successfully updated ${config.label.singular}:`, result);
      } else {
        result = await createMutation.mutateAsync(data as CreateDTO);
        console.log(`[EntityPage] Successfully created ${config.label.singular}:`, result);
      }

      if (result) {
        setSelectedEntity(result);
      }

      setFormOpen(false);
    } catch (error) {
      console.error(`[EntityPage] Failed to ${editMode ? 'update' : 'create'} ${config.label.singular}:`, error);
      // Error will be displayed in the form via mutation.error
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntity) return;
    await deleteMutation.mutateAsync(selectedEntity.id);
    setSelectedEntity(null);
    setDeleteDialogOpen(false);
    navigate(`/${config.type}s`, { replace: true });
  };

  const handleViewChildren = () => {
    if (!config.child || !selectedEntity) return;
    navigate(config.child.type === 'workspace' ? '/workspaces' :
             config.child.type === 'team' ? '/teams' :
             config.child.type === 'application' ? '/applications' :
             config.child.type === 'project' ? '/projects' : '/resources');
  };

  const handleNavigateToParent = (parentId: string) => {
    if (!config.parent) return;
    navigate(config.parent.type === 'organization' ? '/organizations' :
             config.parent.type === 'workspace' ? '/workspaces' :
             config.parent.type === 'team' ? '/teams' :
             config.parent.type === 'application' ? '/applications' :
             config.parent.type === 'project' ? '/projects' : '/resources',
             { state: { selectedId: parentId } });
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="flex h-full bg-gray-50">
        {/* Left Panel - List (30%) */}
        <div className="w-1/3 flex flex-col bg-white border-r border-gray-200">
          <EntityList
            entities={entities}
            config={config}
            selectedId={selectedEntity?.id}
            onSelect={handleSelectEntity}
            onCreateClick={handleCreateClick}
            isLoading={isLoading}
            error={error}
            parentEntities={parentEntities}
            parentFilter={parentFilter}
          />
        </div>

        {/* Right Panel - Detail (70%) */}
        <div className="flex-1 overflow-auto">
          {selectedEntity ? (
            <div className="p-6">
              <EntityDetail
                entity={selectedEntity}
                config={config}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onViewChildren={config.child ? handleViewChildren : undefined}
                onNavigateToParent={config.parent ? handleNavigateToParent : undefined}
                parentEntities={parentEntityMap}
                data-testid="entity-detail"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.colors.bg}`}>
                  <Icon className={`h-8 w-8 ${config.colors.primary}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No {config.label.singular.toLowerCase()} selected
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a {config.label.singular.toLowerCase()} from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <EntityForm
          entity={editMode ? selectedEntity || undefined : undefined}
          config={config}
          schema={schema}
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error || updateMutation.error}
          parentEntities={parentEntities}
        />

        <EntityDeleteDialog
          entity={selectedEntity}
          config={config}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
          error={deleteMutation.error}
        />
      </div>
    </MainLayout>
  );
}
