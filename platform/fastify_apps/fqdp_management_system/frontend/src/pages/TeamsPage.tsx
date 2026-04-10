/**
 * TeamsPage
 * Teams management using generic entity components
 */

import type { Team, CreateTeamDTO, UpdateTeamDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { teamConfig } from '@/config/entityConfigs';
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
} from '@/hooks/useTeams';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateTeamSchema } from '@/utils/validators';
import { getTeamBreadcrumbs } from '@/utils/breadcrumbs';
import { useMemo } from 'react';

export function TeamsPage() {
  const { data, isLoading, error } = useTeams();
  const { data: workspacesData } = useWorkspaces();
  const { data: orgsData } = useOrganizations();

  // Generate breadcrumbs with parent workspace and organization lookup
  const generateBreadcrumbs = useMemo(() => {
    return (team: Team | null) => {
      if (!team || !workspacesData?.data || !orgsData?.data) {
        return getTeamBreadcrumbs(null, null, null);
      }
      const parentWorkspace = workspacesData.data.find((ws) => ws.id === team.workspaceId) || null;
      const parentOrg = orgsData.data.find((org) => org.id === team.organizationId) || null;
      return getTeamBreadcrumbs(team, parentWorkspace, parentOrg);
    };
  }, [workspacesData, orgsData]);

  return (
    <EntityPage<Team, CreateTeamDTO, UpdateTeamDTO>
      config={teamConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      parentEntities={workspacesData?.data}
      createMutation={useCreateTeam()}
      updateMutation={useUpdateTeam()}
      deleteMutation={useDeleteTeam()}
      schema={CreateTeamSchema}
      generateBreadcrumbs={generateBreadcrumbs}
    />
  );
}
