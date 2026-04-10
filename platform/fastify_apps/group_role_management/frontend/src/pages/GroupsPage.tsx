/**
 * GroupsPage Component
 * Main page for group management with master-detail layout
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { GroupList } from '@/components/groups/GroupList';
import { GroupDetail } from '@/components/groups/GroupDetail';
import { GroupForm } from '@/components/groups/GroupForm';
import { GroupDeleteConfirmationDialog } from '@/components/groups/GroupDeleteConfirmationDialog';
import { Button } from '@/components/ui';
import { useGroup, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { useRoles } from '@/hooks/useRoles';
import { useActions } from '@/hooks/useActions';
import { useRestrictions } from '@/hooks/useRestrictions';
import { useToast } from '@/contexts/ToastContext';
import type { Group } from '@/types';

type ViewMode = 'detail' | 'create' | 'edit';

export default function GroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch detail with roles when a group is selected
  const { data: groupDetail } = useGroup(selectedGroup?.id || '', !!selectedGroup);
  const detailGroup = groupDetail?.group || selectedGroup;
  const detailRoles = groupDetail?.roles || [];

  // Fetch all roles to calculate role count for delete dialog
  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

  // Fetch actions and restrictions for display
  const { data: actionsData } = useActions();
  const allActions = actionsData || [];
  const { data: restrictionsData } = useRestrictions();
  const allRestrictions = restrictionsData || [];

  // Mutations
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const toast = useToast();

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setSelectedGroup(null);
    setViewMode('create');
  };

  const handleEdit = () => {
    if (detailGroup) {
      setViewMode('edit');
    }
  };

  const handleDeleteRequest = () => {
    if (detailGroup) {
      setGroupToDelete(detailGroup);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    const groupName = groupToDelete.name;

    try {
      await deleteGroup.mutateAsync({ groupId: groupToDelete.id, permanent: false });
      setSelectedGroup(null);
      setGroupToDelete(null);
      setShowDeleteDialog(false);
      setViewMode('detail');
      toast.success('Group deleted', `"${groupName}" has been archived`);
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group', 'Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setGroupToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        const result = await createGroup.mutateAsync(data);
        setSelectedGroup(result);
        setViewMode('detail');
        toast.success('Group created', `"${result.name}" has been created successfully`);
      } else if (viewMode === 'edit' && detailGroup) {
        const result = await updateGroup.mutateAsync({
          groupId: detailGroup.id,
          groupData: data
        });
        setSelectedGroup(result);
        setViewMode('detail');
        toast.success('Group updated', `"${result.name}" has been updated successfully`);
      }
    } catch (error) {
      console.error('Failed to save group:', error);
      toast.error('Failed to save group', 'Please try again.');
      throw error;
    }
  };

  const handleFormCancel = () => {
    if (viewMode === 'create') {
      setSelectedGroup(null);
    }
    setViewMode('detail');
  };

  const getGroupRoleCount = (groupId: string) => {
    return allRoles.filter((role) => role.groups.includes(groupId)).length;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage groups for role organization
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add New Group
        </Button>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Group List */}
        <GroupList
          selectedGroup={selectedGroup}
          onSelectGroup={handleSelectGroup}
          onCreateNew={handleCreateNew} />


        {/* Right Panel - Detail/Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[calc(100vh-200px)]">
            {viewMode === 'detail' && detailGroup ?
            <GroupDetail
              group={detailGroup}
              roles={detailRoles}
              actions={allActions}
              restrictions={allRestrictions}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest} /> :

            viewMode === 'detail' && !detailGroup ?
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-full mb-4">
                  <svg
                  className="w-16 h-16 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24" data-test-id="svg-c17bdab5">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />

                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No group selected
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Select a group from the list to view its details, or create a new group to get started.
                </p>
              </div> :
            viewMode === 'create' || viewMode === 'edit' ?
            <GroupForm
              group={viewMode === 'edit' ? detailGroup || undefined : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createGroup.isPending || updateGroup.isPending} /> :

            null}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <GroupDeleteConfirmationDialog
        isOpen={showDeleteDialog}
        group={groupToDelete}
        roleCount={groupToDelete ? getGroupRoleCount(groupToDelete.id) : 0}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel} />

    </div>);

}