/**
 * ApplicationsPage
 * Applications management using generic entity components
 */

import type { Application, CreateApplicationDTO, UpdateApplicationDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { applicationConfig } from '@/config/entityConfigs';
import {
  useApplications,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
} from '@/hooks/useApplications';
import { useTeams } from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateApplicationSchema } from '@/utils/validators';
import { getApplicationBreadcrumbs } from '@/utils/breadcrumbs';
import { useMemo } from 'react';

export function ApplicationsPage() {
  const { data, isLoading, error } = useApplications();
  const { data: teamsData } = useTeams();
  const { data: workspacesData } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Generate breadcrumbs with parent team, workspace, and organization lookup
  const generateBreadcrumbs = useMemo(() => {
    return (application: Application | null) => {
      if (!application || !teamsData?.data || !workspacesData?.data || !orgsData?.data) {
        return getApplicationBreadcrumbs(null, null, null, null);
      }
      const parentTeam = teamsData.data.find((t) => t.id === application.teamId) || null;
      const parentWorkspace = workspacesData.data.find((ws) => ws.id === application.workspaceId) || null;
      const parentOrg = orgsData.data.find((org) => org.id === application.organizationId) || null;
      return getApplicationBreadcrumbs(application, parentTeam, parentWorkspace, parentOrg);
    };
  }, [teamsData, workspacesData, orgsData]);

  return (
    <EntityPage<Application, CreateApplicationDTO, UpdateApplicationDTO>
      config={applicationConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      parentEntities={teamsData?.data}
      createMutation={useCreateApplication()}
      updateMutation={useUpdateApplication()}
      deleteMutation={useDeleteApplication()}
      schema={CreateApplicationSchema}
      generateBreadcrumbs={generateBreadcrumbs}
    />
  );
}
