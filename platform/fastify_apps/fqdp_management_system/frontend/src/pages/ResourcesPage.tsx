/**
 * ResourcesPage
 * Resources management using generic entity components
 */

import type { Resource, CreateResourceDTO, UpdateResourceDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { resourceConfig } from '@/config/entityConfigs';
import {
  useResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from '@/hooks/useResources';
import { useProjects } from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { useTeams } from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateResourceSchema } from '@/utils/validators';
import { getResourceBreadcrumbs } from '@/utils/breadcrumbs';
import { useMemo } from 'react';

export function ResourcesPage() {
  const { data, isLoading, error } = useResources();
  const { data: projectsData } = useProjects();
  const { data: applicationsData } = useApplications();
  const { data: teamsData } = useTeams();
  const { data: workspacesData } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Generate breadcrumbs with all parent entities lookup
  const generateBreadcrumbs = useMemo(() => {
    return (resource: Resource | null) => {
      if (
        !resource ||
        !projectsData?.data ||
        !applicationsData?.data ||
        !teamsData?.data ||
        !workspacesData?.data ||
        !orgsData?.data
      ) {
        return getResourceBreadcrumbs(null, null, null, null, null, null);
      }
      const parentProject = projectsData.data.find((p) => p.id === resource.projectId) || null;
      const parentApp = applicationsData.data.find((a) => a.id === resource.applicationId) || null;
      const parentTeam = teamsData.data.find((t) => t.id === resource.teamId) || null;
      const parentWorkspace = workspacesData.data.find((ws) => ws.id === resource.workspaceId) || null;
      const parentOrg = orgsData.data.find((org) => org.id === resource.organizationId) || null;
      return getResourceBreadcrumbs(resource, parentProject, parentApp, parentTeam, parentWorkspace, parentOrg);
    };
  }, [projectsData, applicationsData, teamsData, workspacesData, orgsData]);

  return (
    <EntityPage<Resource, CreateResourceDTO, UpdateResourceDTO>
      config={resourceConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      parentEntities={projectsData?.data}
      createMutation={useCreateResource()}
      updateMutation={useUpdateResource()}
      deleteMutation={useDeleteResource()}
      schema={CreateResourceSchema}
      generateBreadcrumbs={generateBreadcrumbs}
    />
  );
}
