/**
 * Dashboard Page
 * Overview and statistics
 */

import { useNavigate } from 'react-router-dom';
import { Plus, UserCircle, Users, Tag } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { useGroups } from '@/hooks/useGroups';
import { useLabels } from '@/hooks/useLabels';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  const navigate = useNavigate();

  // Fetch statistics
  const { data: rolesData } = useRoles({ status: 'active' });
  const { data: groupsData } = useGroups();
  const { data: labelsData } = useLabels();

  const totalRoles = rolesData?.pagination.total || 0;
  const totalGroups = groupsData?.pagination.total || 0;
  const totalLabels = labelsData?.length || 0;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your role management system</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Quick Actions</h2>
            <p className="text-gray-600 text-sm">Get started with common tasks</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/roles')}
            >
              <Plus className="w-4 h-4" />
              Create New Role
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/groups')}
            >
              <Plus className="w-4 h-4" />
              Create New Group
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/roles')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Roles</h3>
            <div className="bg-primary-100 p-2 rounded-lg">
              <UserCircle className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalRoles}</p>
          <p className="text-xs text-gray-500 mt-2">Active roles in the system</p>
        </div>

        <div
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/groups')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Groups</h3>
            <div className="bg-success-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-success-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalGroups}</p>
          <p className="text-xs text-gray-500 mt-2">Groups available for assignment</p>
        </div>

        <div
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/labels')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Labels</h3>
            <div className="bg-info-100 p-2 rounded-lg">
              <Tag className="w-5 h-5 text-info-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalLabels}</p>
          <p className="text-xs text-gray-500 mt-2">Labels for role organization</p>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Activity tracking will be implemented in later phases</p>
        </div>
      </div>
    </div>
  );
}
