/**
 * WorkspaceDetail Component
 * Display detailed information about a workspace with parent organization link
 */

import type { Workspace } from '@/types';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { FolderOpen, Edit, Trash2, Users, Calendar, User, Building, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useOrganizations } from '@/hooks/useOrganizations';

export interface WorkspaceDetailProps {
  workspace: Workspace;
  onEdit: () => void;
  onDelete: () => void;
  onViewTeams: () => void;
  onNavigateToOrg: (orgId: string) => void;
}

export function WorkspaceDetail({
  workspace,
  onEdit,
  onDelete,
  onViewTeams,
  onNavigateToOrg
}: WorkspaceDetailProps) {
  // Fetch organizations to display parent org
  const { data: orgsData } = useOrganizations();
  const parentOrg = orgsData?.data.find((org) => org.id === workspace.organizationId);

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 rounded-lg bg-primary-100 p-3">
                <FolderOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {workspace.name}
                </h2>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {workspace.slug}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={onEdit} variant="secondary" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={onDelete} variant="danger" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Parent Organization */}
            {parentOrg &&
            <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Parent Organization
                </label>
                <button
                onClick={() => onNavigateToOrg(parentOrg.id)}
                className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">

                  <span className="font-medium">{parentOrg.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {parentOrg.slug}
                </p>
              </div>
            }

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-2">
                <Badge status={workspace.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-2 text-gray-900">
                {workspace.description ||
                <span className="text-gray-400 italic">No description provided</span>
                }
              </p>
            </div>

            {/* Metadata */}
            {workspace.metadata.tags && workspace.metadata.tags.length > 0 &&
            <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {workspace.metadata.tags.map((tag, index) =>
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">

                      {tag}
                    </span>
                )}
                </div>
              </div>
            }

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(workspace.createdAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {workspace.createdBy}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(workspace.updatedAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {workspace.updatedBy}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-400" data-test-id="users-93cbdc67" />
              Teams
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              This workspace has{' '}
              <span className="font-semibold text-gray-900">
                {workspace.teamCount}
              </span>{' '}
              {workspace.teamCount === 1 ? 'team' : 'teams'}
            </p>
            <Button onClick={onViewTeams} variant="secondary" size="sm">
              View Teams
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

}