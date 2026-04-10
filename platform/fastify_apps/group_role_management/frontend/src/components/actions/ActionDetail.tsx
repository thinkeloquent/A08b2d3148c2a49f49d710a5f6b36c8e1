/**
 * ActionDetail Component
 * Displays action information with edit/delete actions
 */

import { Edit2, Trash2, Zap } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '@/components/ui';
import type { Action } from '@/types';
import { format } from 'date-fns';

interface ActionDetailProps {
  action: Action;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionDetail({ action, onEdit, onDelete }: ActionDetailProps) {
  const totalUsage = (action.roleCount || 0) + (action.groupCount || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">{action.name}</h2>
                {action.description &&
                <p className="text-gray-600 mt-1">{action.description}</p>
                }
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {action.createdAt && <span>Created {format(new Date(action.createdAt), 'MMM d, yyyy')}</span>}
                  {action.updatedAt &&
                  <>
                      <span>•</span>
                      <span>Updated {format(new Date(action.updatedAt), 'MMM d, yyyy')}</span>
                    </>
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onDelete}
                disabled={totalUsage > 0}>

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
              <div className="text-2xl font-bold text-primary-600">{totalUsage}</div>
              <div className="text-sm text-gray-600 mt-1">Total Usages</div>
            </div>
            <div className="p-4 bg-success-50 rounded-lg">
              <div className="text-2xl font-bold text-success-600">{action.roleCount || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Roles</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{action.groupCount || 0}</div>
              <div className="text-sm text-gray-600 mt-1">Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Warning */}
      {totalUsage > 0 &&
      <Card>
          <CardContent>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20" data-test-id="svg-f41ad826">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-warning-900">Cannot delete action</h4>
                  <p className="text-sm text-warning-700 mt-1">
                    This action is currently assigned to {action.roleCount || 0} role(s) and {action.groupCount || 0} group(s).
                    Remove it from all roles and groups before deleting.
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
              <dt className="text-gray-500">Action ID</dt>
              <dd className="font-mono text-gray-900 mt-1">{action.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Usage Count</dt>
              <dd className="text-gray-900 mt-1">{totalUsage} total</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>);

}