/**
 * ProjectsPage
 * Projects management using generic entity components
 */

import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { projectConfig } from '@/config/entityConfigs';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { useApplications } from '@/hooks/useApplications';
import { useTeams } from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateProjectSchema } from '@/utils/validators';
import { getProjectBreadcrumbs } from '@/utils/breadcrumbs';
import { useMemo } from 'react';

export function ProjectsPage() {
  const { data, isLoading, error } = useProjects();
  const { data: applicationsData } = useApplications();
  const { data: teamsData } = useTeams();
  const { data: workspacesData } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Generate breadcrumbs with parent application, team, workspace, and organization lookup
  const generateBreadcrumbs = useMemo(() => {
    return (project: Project | null) => {
      if (
        !project ||
        !applicationsData?.data ||
        !teamsData?.data ||
        !workspacesData?.data ||
        !orgsData?.data
      ) {
        return getProjectBreadcrumbs(null, null, null, null, null);
      }
      const parentApp = applicationsData.data.find((a) => a.id === project.applicationId) || null;
      const parentTeam = teamsData.data.find((t) => t.id === project.teamId) || null;
      const parentWorkspace = workspacesData.data.find((ws) => ws.id === project.workspaceId) || null;
      const parentOrg = orgsData.data.find((org) => org.id === project.organizationId) || null;
      return getProjectBreadcrumbs(project, parentApp, parentTeam, parentWorkspace, parentOrg);
    };
  }, [applicationsData, teamsData, workspacesData, orgsData]);

  return (
    <EntityPage<Project, CreateProjectDTO, UpdateProjectDTO>
      config={projectConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      parentEntities={applicationsData?.data}
      createMutation={useCreateProject()}
      updateMutation={useUpdateProject()}
      deleteMutation={useDeleteProject()}
      schema={CreateProjectSchema}
      generateBreadcrumbs={generateBreadcrumbs}
    />
  );
}
