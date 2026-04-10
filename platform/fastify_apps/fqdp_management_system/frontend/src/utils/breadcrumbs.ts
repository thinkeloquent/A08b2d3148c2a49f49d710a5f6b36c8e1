/**
 * Breadcrumb Utilities
 * Helper functions for generating breadcrumb navigation
 */

import type { BreadcrumbItem, Organization, Workspace, Team, Application, Project, Resource } from '@/types';

/**
 * Generate breadcrumbs for organization level
 */
export function getOrganizationBreadcrumbs(organization?: Organization | null): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, entityType: 'organization' });
  }

  return items;
}

/**
 * Generate breadcrumbs for workspace level
 */
export function getWorkspaceBreadcrumbs(
  workspace?: Workspace | null,
  organization?: Organization | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, href: '/organizations', entityType: 'organization' });
  }

  items.push({ label: 'Workspaces', href: '/workspaces' });

  if (workspace) {
    items.push({ label: workspace.name, entityType: 'workspace' });
  }

  return items;
}

/**
 * Generate breadcrumbs for team level
 */
export function getTeamBreadcrumbs(
  team?: Team | null,
  workspace?: Workspace | null,
  organization?: Organization | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, href: '/organizations', entityType: 'organization' });
  }

  if (workspace) {
    items.push({ label: workspace.name, href: '/workspaces', entityType: 'workspace' });
  }

  items.push({ label: 'Teams', href: '/teams' });

  if (team) {
    items.push({ label: team.name, entityType: 'team' });
  }

  return items;
}

/**
 * Generate breadcrumbs for application level
 */
export function getApplicationBreadcrumbs(
  application?: Application | null,
  team?: Team | null,
  workspace?: Workspace | null,
  organization?: Organization | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, href: '/organizations', entityType: 'organization' });
  }

  if (workspace) {
    items.push({ label: workspace.name, href: '/workspaces', entityType: 'workspace' });
  }

  if (team) {
    items.push({ label: team.name, href: '/teams', entityType: 'team' });
  }

  items.push({ label: 'Applications', href: '/applications' });

  if (application) {
    items.push({ label: application.name, entityType: 'application' });
  }

  return items;
}

/**
 * Generate breadcrumbs for project level
 */
export function getProjectBreadcrumbs(
  project?: Project | null,
  application?: Application | null,
  team?: Team | null,
  workspace?: Workspace | null,
  organization?: Organization | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, href: '/organizations', entityType: 'organization' });
  }

  if (workspace) {
    items.push({ label: workspace.name, href: '/workspaces', entityType: 'workspace' });
  }

  if (team) {
    items.push({ label: team.name, href: '/teams', entityType: 'team' });
  }

  if (application) {
    items.push({ label: application.name, href: '/applications', entityType: 'application' });
  }

  items.push({ label: 'Projects', href: '/projects' });

  if (project) {
    items.push({ label: project.name, entityType: 'project' });
  }

  return items;
}

/**
 * Generate breadcrumbs for resource level
 */
export function getResourceBreadcrumbs(
  resource?: Resource | null,
  project?: Project | null,
  application?: Application | null,
  team?: Team | null,
  workspace?: Workspace | null,
  organization?: Organization | null
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Organizations', href: '/organizations' },
  ];

  if (organization) {
    items.push({ label: organization.name, href: '/organizations', entityType: 'organization' });
  }

  if (workspace) {
    items.push({ label: workspace.name, href: '/workspaces', entityType: 'workspace' });
  }

  if (team) {
    items.push({ label: team.name, href: '/teams', entityType: 'team' });
  }

  if (application) {
    items.push({ label: application.name, href: '/applications', entityType: 'application' });
  }

  if (project) {
    items.push({ label: project.name, href: '/projects', entityType: 'project' });
  }

  items.push({ label: 'Resources', href: '/resources' });

  if (resource) {
    items.push({ label: resource.name, entityType: 'resource' });
  }

  return items;
}
