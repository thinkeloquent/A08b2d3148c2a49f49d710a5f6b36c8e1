/**
 * DashboardPage
 * Home/dashboard page showing overview statistics
 */

import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { Building, FolderOpen, Users, Box, FolderGit, FileText, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useTeams } from '@/hooks/useTeams';
import { useApplications } from '@/hooks/useApplications';
import { useProjects } from '@/hooks/useProjects';
import { useResources } from '@/hooks/useResources';
import { useReferences } from '@/hooks/useReferences';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: orgsData } = useOrganizations();
  const { data: workspacesData } = useWorkspaces();
  const { data: teamsData } = useTeams();
  const { data: appsData } = useApplications();
  const { data: projectsData } = useProjects();
  const { data: resourcesData } = useResources();
  const { data: referencesData } = useReferences();

  const stats = [
    {
      name: 'Organizations',
      value: orgsData?.data?.length || 0,
      icon: Building,
      href: '/organizations',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Workspaces',
      value: workspacesData?.data?.length || 0,
      icon: FolderOpen,
      href: '/workspaces',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Teams',
      value: teamsData?.data?.length || 0,
      icon: Users,
      href: '/teams',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Applications',
      value: appsData?.data?.length || 0,
      icon: Box,
      href: '/applications',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Projects',
      value: projectsData?.data?.length || 0,
      icon: FolderGit,
      href: '/projects',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      name: 'Resources',
      value: resourcesData?.data?.length || 0,
      icon: FileText,
      href: '/resources',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      name: 'References',
      value: referencesData?.data?.length || 0,
      icon: Link,
      href: '/references',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  return (
    <MainLayout breadcrumbs={[{ label: 'Dashboard' }]} showBreadcrumbs={false}>
      <div className="h-full overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your FQDP hierarchy and design assets
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <button
                key={stat.name}
                onClick={() => navigate(stat.href)}
                className="text-left transition-transform hover:scale-105"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`rounded-lg ${stat.bgColor} p-3`}>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => navigate('/organizations')}
                    className="flex items-center rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <Building className="mr-3 h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Manage Organizations</p>
                      <p className="text-sm text-gray-500">Create and organize your teams</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/workspaces')}
                    className="flex items-center rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <FolderOpen className="mr-3 h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Browse Workspaces</p>
                      <p className="text-sm text-gray-500">Access your design workspaces</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
