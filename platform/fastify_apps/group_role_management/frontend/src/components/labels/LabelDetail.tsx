/**
 * LabelDetail Component
 * Displays label information with edit/delete actions and usage statistics
 * Based on REQ.v002.md Section 4 (Label System)
 */

import { Edit2, Trash2, Tag, TrendingUp } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { RoleIcon } from '@/utils/icons';
import { getLabelColor } from '@/utils/labelColors';
import type { Label, Role } from '@/types';

interface LabelDetailProps {
  label: Label;
  roles: Role[]; // Roles that use this label
  onEdit: () => void;
  onDelete: () => void;
  onMerge?: () => void;
}

export function LabelDetail({ label, roles, onEdit, onDelete, onMerge }: LabelDetailProps) {
  const isPredefined = !label.customCreated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl">
                <Tag className="w-8 h-8 text-primary-600" />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getLabelColor(label.name)} size="lg">
                    {label.name}
                  </Badge>
                  {isPredefined &&
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Predefined
                    </span>
                  }
                </div>
                {label.description &&
                <p className="text-gray-600 mt-1">{label.description}</p>
                }
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Color: {label.color}</span>
                  <span>•</span>
                  <span>{roles.length} role{roles.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              {onMerge &&
              <Button variant="secondary" size="sm" onClick={onMerge}>
                  <TrendingUp className="w-4 h-4" />
                  Merge
                </Button>
              }
              <Button
                variant="danger"
                size="sm"
                onClick={onDelete}
                disabled={isPredefined || roles.length > 0}>

                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{roles.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Roles</div>
            </div>
            <div className="p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {roles.filter((r) => r.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Roles</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {roles.filter((r) => r.status === 'archived').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Archived Roles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Using This Label */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Roles Using This Label</h3>
            <span className="text-sm text-gray-500">{roles.length} role{roles.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {roles.length > 0 ?
          <div className="grid grid-cols-2 gap-3">
              {roles.map((role) =>
            <div
              key={role.id}
              className="p-3 bg-primary-50 border border-primary-200 rounded-lg">

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary-100 rounded">
                      <RoleIcon icon={role.icon} className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{role.name}</h4>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{role.description}</p>
                    </div>
                  </div>
                </div>
            )}
            </div> :

          <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No roles are using this label yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Assign this label to roles in the Role Management section
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* Delete Warning */}
      {(isPredefined || roles.length > 0) &&
      <Card>
          <CardContent>
            <div className={`border rounded-lg p-4 ${
          isPredefined ?
          'bg-blue-50 border-blue-200' :
          'bg-warning-50 border-warning-200'}`
          }>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className={`w-5 h-5 ${isPredefined ? 'text-blue-600' : 'text-warning-600'}`} fill="currentColor" viewBox="0 0 20 20" data-test-id="svg-700c1d83">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  {isPredefined ?
                <>
                      <h4 className="text-sm font-medium text-blue-900">Predefined Label</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This is a predefined system label and cannot be deleted. You can edit its color and description.
                      </p>
                    </> :

                <>
                      <h4 className="text-sm font-medium text-warning-900">Cannot delete label</h4>
                      <p className="text-sm text-warning-700 mt-1">
                        This label is currently assigned to {roles.length} role{roles.length !== 1 ? 's' : ''}.
                        Remove it from all roles before deleting.
                      </p>
                    </>
                }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Metadata */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Details</h3>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Label Name</dt>
              <dd className="font-medium text-gray-900 mt-1">{label.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Color</dt>
              <dd className="mt-1">
                <Badge variant={getLabelColor(label.name)} size="sm">
                  {label.color}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900 mt-1">{isPredefined ? 'Predefined' : 'Custom'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Usage Count</dt>
              <dd className="text-gray-900 mt-1">{roles.length} role{roles.length !== 1 ? 's' : ''}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>);

}