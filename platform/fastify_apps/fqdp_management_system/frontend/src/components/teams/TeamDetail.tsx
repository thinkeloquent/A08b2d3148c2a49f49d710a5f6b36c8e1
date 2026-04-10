/**
 * TeamDetail Component
 * Display detailed information about a team with parent workspace/organization links
 */

import type { Team } from '@/types';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { Users, Edit, Trash2, Box, Calendar, User, FolderOpen, Building, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export interface TeamDetailProps {
  team: Team;
  onEdit: () => void;
  onDelete: () => void;
  onViewApplications: () => void;
  onNavigateToWorkspace: (workspaceId: string) => void;
  onNavigateToOrg: (orgId: string) => void;
}

export function TeamDetail({
  team,
  onEdit,
  onDelete,
  onViewApplications,
  onNavigateToWorkspace,
  onNavigateToOrg
}: TeamDetailProps) {
  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 rounded-lg bg-primary-100 p-3">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {team.name}
                </h2>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {team.slug}
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
            {/* Parent Hierarchy */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Organization
                </label>
                <button
                  onClick={() => onNavigateToOrg(team.organizationId)}
                  className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">

                  <span className="font-medium">{team.organizationName}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Workspace
                </label>
                <button
                  onClick={() => onNavigateToWorkspace(team.workspaceId)}
                  className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">

                  <span className="font-medium">{team.workspaceName}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-2">
                <Badge status={team.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-2 text-gray-900">
                {team.description ||
                <span className="text-gray-400 italic">No description provided</span>
                }
              </p>
            </div>

            {/* Metadata */}
            {team.metadata.tags && team.metadata.tags.length > 0 &&
            <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team.metadata.tags.map((tag, index) =>
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
                  {format(new Date(team.createdAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {team.createdBy}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(team.updatedAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {team.updatedBy}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Box className="h-5 w-5 mr-2 text-gray-400" data-test-id="box-5b6f603c" />
              Applications
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              This team has{' '}
              <span className="font-semibold text-gray-900">
                {team.applicationCount}
              </span>{' '}
              {team.applicationCount === 1 ? 'application' : 'applications'}
            </p>
            <Button onClick={onViewApplications} variant="secondary" size="sm">
              View Applications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

}