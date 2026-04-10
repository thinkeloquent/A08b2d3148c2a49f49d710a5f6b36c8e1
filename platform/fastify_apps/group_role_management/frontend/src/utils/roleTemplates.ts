/**
 * Role Templates
 * Predefined role templates for quick creation
 * Based on REQ.v002.md Section 5.2 (Role Templates)
 */

import type { RoleIconType } from '@/types';

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  icon: RoleIconType;
  labels: string[];
  category: 'common' | 'technical' | 'business';
  isPredefined: true;
}

// Predefined role templates
export const roleTemplates: RoleTemplate[] = [
  // Common Templates
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    icon: 'shield',
    labels: ['Admin', 'Critical', 'Full-Access'],
    category: 'common',
    isPredefined: true,
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can create, edit, and delete content',
    icon: 'file',
    labels: ['Editor', 'Content'],
    category: 'common',
    isPredefined: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view content',
    icon: 'eye',
    labels: ['Viewer', 'Read-Only'],
    category: 'common',
    isPredefined: true,
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Can moderate content and manage users',
    icon: 'settings',
    labels: ['Moderator', 'Important'],
    category: 'common',
    isPredefined: true,
  },

  // Technical Templates
  {
    id: 'developer',
    name: 'Developer',
    description: 'Access to development tools and code repositories',
    icon: 'code',
    labels: ['Developer', 'Technical'],
    category: 'technical',
    isPredefined: true,
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Infrastructure and deployment management',
    icon: 'database',
    labels: ['DevOps', 'Infrastructure', 'Critical'],
    category: 'technical',
    isPredefined: true,
  },
  {
    id: 'qa',
    name: 'QA Tester',
    description: 'Quality assurance and testing permissions',
    icon: 'sparkles',
    labels: ['QA', 'Testing'],
    category: 'technical',
    isPredefined: true,
  },

  // Business Templates
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Access to analytics and reporting tools',
    icon: 'chart',
    labels: ['Analyst', 'Reporting'],
    category: 'business',
    isPredefined: true,
  },
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Financial data and billing access',
    icon: 'credit',
    labels: ['Finance', 'Important'],
    category: 'business',
    isPredefined: true,
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Customer support and ticket management',
    icon: 'mail',
    labels: ['Support', 'Customer-Facing'],
    category: 'business',
    isPredefined: true,
  },
];

export const templateCategories = [
  { value: 'all', label: 'All Templates' },
  { value: 'common', label: 'Common Roles' },
  { value: 'technical', label: 'Technical Roles' },
  { value: 'business', label: 'Business Roles' },
] as const;

export function getTemplateById(templateId: string): RoleTemplate | undefined {
  return roleTemplates.find(t => t.id === templateId);
}

export function getTemplatesByCategory(category: string): RoleTemplate[] {
  if (category === 'all') return roleTemplates;
  return roleTemplates.filter(t => t.category === category);
}
