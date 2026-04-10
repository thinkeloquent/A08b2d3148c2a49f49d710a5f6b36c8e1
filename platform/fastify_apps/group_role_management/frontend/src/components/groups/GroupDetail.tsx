/**
 * GroupDetail Component
 * Displays group information with edit/delete actions
 * Based on REQ.v002.md Section 3 (Group Management)
 */

import { Edit2, Trash2, Users } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { RoleIcon } from '@/utils/icons';
import type { Group, Role, Action, Restriction } from '@/types';
import { format } from 'date-fns';

interface GroupDetailProps {
  group: Group;
  roles: Role[]; // Roles that use this group
  actions?: Action[];
  restrictions?: Restriction[];
  onEdit: () => void;
  onDelete: () => void;
}

export function GroupDetail({ group, roles, actions = [], restrictions = [], onEdit, onDelete }: GroupDetailProps) {
  const assignedActions = actions.filter((a) => group.actions?.includes(a.id));
  const assignedRestrictions = restrictions.filter((r) => group.restrictions?.includes(r.id));
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl">
                <Users className="w-8 h-8 text-primary-600" />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                  {group.status === 'archived' &&
                  <Badge variant="gray">Archived</Badge>
                  }
                </div>
                <p className="text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {group.createdAt && <span>Created {format(new Date(group.createdAt), 'MMM d, yyyy')}</span>}
                  {group.updatedAt &&
                  <>
                      <span>•</span>
                      <span>Updated {format(new Date(group.updatedAt), 'MMM d, yyyy')}</span>
                    </>
                  }
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete} disabled={roles.length > 0}>
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Roles Using This Group */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Roles Using This Group</h3>
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
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No roles are using this group yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Assign this group to roles in the Role Management section
              </p>
            </div>
          }
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <span className="text-sm text-gray-500">{assignedActions.length} action{assignedActions.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {assignedActions.length > 0 ?
          <div className="grid grid-cols-2 gap-3">
              {assignedActions.map((action) =>
            <div
              key={action.id}
              className="p-3 bg-primary-50 border border-primary-200 rounded-lg">

                  <h4 className="font-medium text-gray-900">{action.name}</h4>
                  {action.description &&
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              }
                </div>
            )}
            </div> :

          <p className="text-gray-500 text-sm">No actions assigned</p>
          }
        </CardContent>
      </Card>

      {/* Restrictions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Restrictions</h3>
            <span className="text-sm text-gray-500">{assignedRestrictions.length} restriction{assignedRestrictions.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {assignedRestrictions.length > 0 ?
          <div className="grid grid-cols-2 gap-3">
              {assignedRestrictions.map((restriction) =>
            <div
              key={restriction.id}
              className="p-3 bg-warning-50 border border-warning-200 rounded-lg">

                  <h4 className="font-medium text-gray-900">{restriction.name}</h4>
                  {restriction.description &&
              <p className="text-sm text-gray-600 mt-1">{restriction.description}</p>
              }
                </div>
            )}
            </div> :

          <p className="text-gray-500 text-sm">No restrictions assigned</p>
          }
        </CardContent>
      </Card>

      {/* Delete Warning */}
      {roles.length > 0 &&
      <Card>
          <CardContent>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20" data-test-id="svg-d2d6742c">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-warning-900">Cannot delete group</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    This group is currently assigned to {roles.length} role{roles.length !== 1 ? 's' : ''}.
                    Remove it from all roles before deleting.
                  </p>
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
              <dt className="text-gray-500">Group ID</dt>
              <dd className="font-mono text-gray-900 mt-1">{group.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="capitalize text-gray-900 mt-1">{group.status || 'active'}</dd>
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