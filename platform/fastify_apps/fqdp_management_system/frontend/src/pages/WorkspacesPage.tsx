/**
 * WorkspacesPage
 * Workspaces management using generic entity components
 */

import type { Workspace, CreateWorkspaceDTO, UpdateWorkspaceDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { workspaceConfig } from '@/config/entityConfigs';
import {
  useWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateWorkspaceSchema } from '@/utils/validators';
import { getWorkspaceBreadcrumbs } from '@/utils/breadcrumbs';
import { useMemo } from 'react';

export function WorkspacesPage() {
  const { data, isLoading, error } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Generate breadcrumbs with parent organization lookup
  const generateBreadcrumbs = useMemo(() => {
    return (workspace: Workspace | null) => {
      if (!workspace || !orgsData?.data) return getWorkspaceBreadcrumbs(null, null);
      const parentOrg = orgsData.data.find((org) => org.id === workspace.organizationId) || null;
      return getWorkspaceBreadcrumbs(workspace, parentOrg);
    };
  }, [orgsData]);

  return (
    <EntityPage<Workspace, CreateWorkspaceDTO, UpdateWorkspaceDTO>
      config={workspaceConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      parentEntities={orgsData?.data}
      createMutation={useCreateWorkspace()}
      updateMutation={useUpdateWorkspace()}
      deleteMutation={useDeleteWorkspace()}
      schema={CreateWorkspaceSchema}
      generateBreadcrumbs={generateBreadcrumbs}
    />
  );
}
