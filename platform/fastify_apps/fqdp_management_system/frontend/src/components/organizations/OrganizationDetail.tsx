/**
 * OrganizationDetail Component
 * Display detailed information about an organization
 */

import type { Organization } from '@/types';
import { Card, CardHeader, CardContent, Button, Badge } from '@/components/ui';
import { Building, Edit, Trash2, FolderOpen, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export interface OrganizationDetailProps {
  organization: Organization;
  onEdit: () => void;
  onDelete: () => void;
  onViewWorkspaces: () => void;
}

export function OrganizationDetail({
  organization,
  onEdit,
  onDelete,
  onViewWorkspaces
}: OrganizationDetailProps) {
  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 rounded-lg bg-primary-100 p-3">
                <Building className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {organization.name}
                </h2>
                <p className="text-sm text-gray-500 font-mono mt-1">
                  {organization.slug}
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
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-2">
                <Badge status={organization.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-2 text-gray-900">
                {organization.description ||
                <span className="text-gray-400 italic">No description provided</span>
                }
              </p>
            </div>

            {/* Metadata */}
            {organization.metadata.tags && organization.metadata.tags.length > 0 &&
            <div>
                <label className="text-sm font-medium text-gray-500">Tags</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {organization.metadata.tags.map((tag, index) =>
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
                  {format(new Date(organization.createdAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {organization.createdBy}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(organization.updatedAt), 'PPP')}
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {organization.updatedBy}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspaces Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-gray-400" data-test-id="folderopen-5a4248cc" />
              Workspaces
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              This organization has{' '}
              <span className="font-semibold text-gray-900">
                {organization.workspaceCount}
              </span>{' '}
              {organization.workspaceCount === 1 ? 'workspace' : 'workspaces'}
            </p>
            <Button onClick={onViewWorkspaces} variant="secondary" size="sm">
              View Workspaces
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

}