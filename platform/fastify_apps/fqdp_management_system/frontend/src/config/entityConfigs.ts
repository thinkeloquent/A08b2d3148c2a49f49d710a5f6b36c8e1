/**
 * Entity Configuration System
 * Central configuration for all entity types in the hierarchy
 */

import type { LucideIcon } from 'lucide-react';
import { Building, FolderOpen, Users, Box, FolderGit, FileText, Link } from 'lucide-react';
import type { EntityType, BaseEntity, Organization, Workspace, Team, Application, Project, Resource, Reference } from '@/types';

/**
 * Configuration for an entity type
 */
export interface EntityConfig<T extends BaseEntity = BaseEntity> {
  /** Entity type identifier */
  type: EntityType;

  /** Display icon */
  icon: LucideIcon;

  /** Display labels */
  label: {
    singular: string;
    plural: string;
  };

  /** Child entity info (if not a leaf node) */
  child?: {
    type: EntityType;
    label: {
      singular: string;
      plural: string;
    };
    countKey: keyof T; // e.g., 'workspaceCount', 'teamCount'
    icon: LucideIcon;
  };

  /** Parent entity info (if not root) */
  parent?: {
    type: EntityType;
    label: {
      singular: string;
      plural: string;
    };
    idKey: keyof T; // e.g., 'organizationId'
    nameKey: keyof T; // e.g., 'organizationName'
  };

  /** Route path */
  route: string;

  /** Color scheme for icons/badges */
  colors: {
    primary: string; // Tailwind color class
    bg: string; // Tailwind bg class
  };
}

/**
 * Organization configuration (Level 1 - Root)
 */
export const organizationConfig: EntityConfig<Organization> = {
  type: 'organization',
  icon: Building,
  label: {
    singular: 'Organization',
    plural: 'Organizations',
  },
  child: {
    type: 'workspace',
    label: {
      singular: 'workspace',
      plural: 'workspaces',
    },
    countKey: 'workspaceCount',
    icon: FolderOpen,
  },
  route: '/organizations',
  colors: {
    primary: 'text-blue-600',
    bg: 'bg-blue-100',
  },
};

/**
 * Workspace configuration (Level 2)
 */
export const workspaceConfig: EntityConfig<Workspace> = {
  type: 'workspace',
  icon: FolderOpen,
  label: {
    singular: 'Workspace',
    plural: 'Workspaces',
  },
  parent: {
    type: 'organization',
    label: {
      singular: 'organization',
      plural: 'organizations',
    },
    idKey: 'organizationId',
    nameKey: 'organizationName',
  },
  child: {
    type: 'team',
    label: {
      singular: 'team',
      plural: 'teams',
    },
    countKey: 'teamCount',
    icon: Users,
  },
  route: '/workspaces',
  colors: {
    primary: 'text-green-600',
    bg: 'bg-green-100',
  },
};

/**
 * Team configuration (Level 3)
 */
export const teamConfig: EntityConfig<Team> = {
  type: 'team',
  icon: Users,
  label: {
    singular: 'Team',
    plural: 'Teams',
  },
  parent: {
    type: 'workspace',
    label: {
      singular: 'workspace',
      plural: 'workspaces',
    },
    idKey: 'workspaceId',
    nameKey: 'workspaceName',
  },
  child: {
    type: 'application',
    label: {
      singular: 'application',
      plural: 'applications',
    },
    countKey: 'applicationCount',
    icon: Box,
  },
  route: '/teams',
  colors: {
    primary: 'text-purple-600',
    bg: 'bg-purple-100',
  },
};

/**
 * Application configuration (Level 4)
 */
export const applicationConfig: EntityConfig<Application> = {
  type: 'application',
  icon: Box,
  label: {
    singular: 'Application',
    plural: 'Applications',
  },
  parent: {
    type: 'team',
    label: {
      singular: 'team',
      plural: 'teams',
    },
    idKey: 'teamId',
    nameKey: 'teamName',
  },
  child: {
    type: 'project',
    label: {
      singular: 'project',
      plural: 'projects',
    },
    countKey: 'projectCount',
    icon: FolderGit,
  },
  route: '/applications',
  colors: {
    primary: 'text-orange-600',
    bg: 'bg-orange-100',
  },
};

/**
 * Project configuration (Level 5)
 */
export const projectConfig: EntityConfig<Project> = {
  type: 'project',
  icon: FolderGit,
  label: {
    singular: 'Project',
    plural: 'Projects',
  },
  parent: {
    type: 'application',
    label: {
      singular: 'application',
      plural: 'applications',
    },
    idKey: 'applicationId',
    nameKey: 'applicationName',
  },
  child: {
    type: 'resource',
    label: {
      singular: 'resource',
      plural: 'resources',
    },
    countKey: 'resourceCount',
    icon: FileText,
  },
  route: '/projects',
  colors: {
    primary: 'text-pink-600',
    bg: 'bg-pink-100',
  },
};

/**
 * Resource configuration (Level 6 - Leaf)
 */
export const resourceConfig: EntityConfig<Resource> = {
  type: 'resource',
  icon: FileText,
  label: {
    singular: 'Resource',
    plural: 'Resources',
  },
  parent: {
    type: 'project',
    label: {
      singular: 'project',
      plural: 'projects',
    },
    idKey: 'projectId',
    nameKey: 'projectName',
  },
  route: '/resources',
  colors: {
    primary: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
};

/**
 * Reference configuration
 */
export const referenceConfig: EntityConfig<any> = {
  type: 'reference',
  icon: Link,
  label: {
    singular: 'Reference',
    plural: 'References',
  },
  route: '/references',
  colors: {
    primary: 'text-teal-600',
    bg: 'bg-teal-100',
  },
};

/**
 * Entity configuration registry
 * Maps entity types to their configurations
 */
export const entityConfigs: Record<EntityType, EntityConfig<any>> = {
  organization: organizationConfig,
  workspace: workspaceConfig,
  team: teamConfig,
  application: applicationConfig,
  project: projectConfig,
  resource: resourceConfig,
  reference: referenceConfig,
};

/**
 * Get configuration for an entity type
 */
export function getEntityConfig(type: EntityType): EntityConfig<any> {
  return entityConfigs[type];
}

/**
 * Get all entity configurations in hierarchy order
 */
export function getAllEntityConfigs(): EntityConfig<any>[] {
  return [
    organizationConfig,
    workspaceConfig,
    teamConfig,
    applicationConfig,
    projectConfig,
    resourceConfig,
  ];
}
