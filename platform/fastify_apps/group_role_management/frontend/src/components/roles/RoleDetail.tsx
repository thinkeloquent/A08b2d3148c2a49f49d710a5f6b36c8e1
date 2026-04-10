/**
 * RoleDetail Component
 * Displays role information with edit/delete actions
 * Based on REQ.v002.md Section 2.1 (Role Management)
 */

import { Edit2, Trash2, Copy } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardContent } from '@/components/ui';
import { RoleIcon } from '@/utils/icons';
import { getLabelColor } from '@/utils/labelColors';
import type { Role, Group, Action, Restriction } from '@/types';
import { format } from 'date-fns';

interface RoleDetailProps {
  role: Role;
  groups: Group[];
  actions?: Action[];
  restrictions?: Restriction[];
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}

export function RoleDetail({ role, groups, actions = [], restrictions = [], onEdit, onDelete, onClone }: RoleDetailProps) {
  // Get group names for this role
  const assignedGroups = groups.filter(g => role.groups.includes(g.id));
  const assignedActions = actions.filter(a => role.actions.includes(a.id));
  const assignedRestrictions = restrictions.filter(r => role.restrictions.includes(r.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl">
                <RoleIcon icon={role.icon} className="w-8 h-8 text-primary-600" />
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{role.name}</h2>
                  {role.status === 'archived' && (
                    <Badge variant="gray">Archived</Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{role.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Created {format(new Date(role.createdAt), 'MMM d, yyyy')}</span>
                  {role.updatedAt && (
                    <>
                      <span>•</span>
                      <span>Updated {format(new Date(role.updatedAt), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={onClone}>
                <Copy className="w-4 h-4" />
                Clone
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Labels Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
        </CardHeader>
        <CardContent>
          {role.labels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.labels.map(label => (
                <Badge key={label} variant={getLabelColor(label)} size="md">
                  {label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No labels assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Groups Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Assigned Groups</h3>
            <span className="text-sm text-gray-500">{assignedGroups.length} groups</span>
          </div>
        </CardHeader>
        <CardContent>
          {assignedGroups.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {assignedGroups.map(group => (
                <div
                  key={group.id}
                  className="p-3 bg-primary-50 border border-primary-200 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900">{group.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No groups assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <span className="text-sm text-gray-500">{assignedActions.length} actions</span>
          </div>
        </CardHeader>
        <CardContent>
          {assignedActions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {assignedActions.map(action => (
                <div
                  key={action.id}
                  className="p-3 bg-primary-50 border border-primary-200 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900">{action.name}</h4>
                  {action.description && (
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No actions assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Restrictions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Restrictions</h3>
            <span className="text-sm text-gray-500">{assignedRestrictions.length} restrictions</span>
          </div>
        </CardHeader>
        <CardContent>
          {assignedRestrictions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {assignedRestrictions.map(restriction => (
                <div
                  key={restriction.id}
                  className="p-3 bg-warning-50 border border-warning-200 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900">{restriction.name}</h4>
                  {restriction.description && (
                    <p className="text-sm text-gray-600 mt-1">{restriction.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No restrictions assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Details</h3>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Role ID</dt>
              <dd className="font-mono text-gray-900 mt-1">{role.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="capitalize text-gray-900 mt-1">{role.status || 'active'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Version</dt>
              <dd className="text-gray-900 mt-1">v{role.version || 1}</dd>
            </div>
            {role.metadata?.clonedFrom && (
              <div>
                <dt className="text-gray-500">Cloned From</dt>
                <dd className="font-mono text-gray-900 mt-1">{role.metadata.clonedFrom}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
