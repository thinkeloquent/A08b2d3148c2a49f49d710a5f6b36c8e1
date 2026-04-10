/**
 * OrganizationsPage
 * Organizations management using generic entity components
 */

import type { Organization, CreateOrganizationDTO, UpdateOrganizationDTO } from '@/types';
import { EntityPage } from '@/components/entity';
import { organizationConfig } from '@/config/entityConfigs';
import {
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from '@/hooks/useOrganizations';
import { CreateOrganizationSchema } from '@/utils/validators';
import { getOrganizationBreadcrumbs } from '@/utils/breadcrumbs';

export function OrganizationsPage() {
  const { data, isLoading, error } = useOrganizations();

  return (
    <EntityPage<Organization, CreateOrganizationDTO, UpdateOrganizationDTO>
      config={organizationConfig}
      entities={data?.data}
      isLoading={isLoading}
      error={error}
      createMutation={useCreateOrganization()}
      updateMutation={useUpdateOrganization()}
      deleteMutation={useDeleteOrganization()}
      schema={CreateOrganizationSchema}
      generateBreadcrumbs={getOrganizationBreadcrumbs}
    />
  );
}
