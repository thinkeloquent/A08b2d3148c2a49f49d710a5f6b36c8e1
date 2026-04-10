/**
 * RolesPage Component
 * Main page for role management with master-detail layout
 * Based on REQ.v002.md Section 2 (Role Management System)
 */

import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { RoleList } from '@/components/roles/RoleList';
import { RoleDetail } from '@/components/roles/RoleDetail';
import { RoleForm } from '@/components/roles/RoleForm';
import { TemplateSelector } from '@/components/roles/TemplateSelector';
import { DeleteConfirmationDialog } from '@/components/roles/DeleteConfirmationDialog';
import { Button } from '@/components/ui';
import { useGroups } from '@/hooks/useGroups';
import { useRole, useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/useRoles';
import { useActions } from '@/hooks/useActions';
import { useRestrictions } from '@/hooks/useRestrictions';
import { useToast } from '@/contexts/ToastContext';
import type { Role } from '@/types';
import type { RoleTemplate } from '@/utils/roleTemplates';

type ViewMode = 'detail' | 'template-select' | 'create' | 'edit';

export default function RolesPage() {
  const { roleId } = useParams<{roleId: string;}>();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive edit mode from URL: /roles/:id/edit
  const isEditUrl = !!(roleId && location.pathname.endsWith('/edit'));

  const [localViewMode, setLocalViewMode] = useState<ViewMode>('detail');
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateData, setTemplateData] = useState<Partial<Role> | null>(null);

  // Fetch the selected role from URL param
  const { data: selectedRole } = useRole(roleId || '', !!roleId);

  // Effective view mode: URL /edit takes precedence, otherwise use local state
  const viewMode: ViewMode = isEditUrl ? 'edit' : localViewMode;

  // Fetch groups, actions, restrictions for display
  const { data: groupsData } = useGroups();
  const groups = groupsData?.data || [];
  const { data: actionsData } = useActions();
  const allActions = actionsData || [];
  const { data: restrictionsData } = useRestrictions();
  const allRestrictions = restrictionsData || [];

  // Mutations
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Toast notifications
  const toast = useToast();

  // Handlers
  const handleSelectRole = (role: Role) => {
    navigate(`/roles/${role.id}`);
    setLocalViewMode('detail');
  };

  const handleCreateNew = () => {
    navigate('/roles');
    setTemplateData(null);
    setLocalViewMode('template-select');
  };

  const handleSelectTemplate = (template: RoleTemplate) => {
    // Pre-fill form with template data
    setTemplateData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      labels: [...template.labels],
      groups: [], // Groups need to be selected manually
      actions: [],
      restrictions: []
    });
    setLocalViewMode('create');
  };

  const handleSkipTemplate = () => {
    setTemplateData(null);
    setLocalViewMode('create');
  };

  const handleEdit = () => {
    if (selectedRole) {
      navigate(`/roles/${selectedRole.id}/edit`);
    }
  };

  const handleClone = async () => {
    if (!selectedRole) return;

    try {
      // Create a new role based on the selected one
      const clonedData = {
        name: `${selectedRole.name} (Copy)`,
        description: selectedRole.description,
        icon: selectedRole.icon,
        labels: [...selectedRole.labels],
        groups: [...selectedRole.groups],
        actions: [...selectedRole.actions],
        restrictions: [...selectedRole.restrictions],
        metadata: {
          clonedFrom: selectedRole.id
        }
      };

      const result = await createRole.mutateAsync(clonedData);

      // Navigate to the newly cloned role
      navigate(`/roles/${result.id}`);
      setLocalViewMode('detail');
      toast.success('Role cloned successfully', `Created "${result.name}" from "${selectedRole.name}"`);
    } catch (error) {
      console.error('Failed to clone role:', error);
      toast.error('Failed to clone role', 'Please try again.');
    }
  };

  const handleDeleteRequest = () => {
    if (selectedRole) {
      setRoleToDelete(selectedRole);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    const roleName = roleToDelete.name;

    try {
      await deleteRole.mutateAsync({ roleId: roleToDelete.id, permanent: false });

      // Clear selection
      navigate('/roles');
      setRoleToDelete(null);
      setShowDeleteDialog(false);
      setLocalViewMode('detail');
      toast.success('Role deleted', `"${roleName}" has been archived`);
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role', 'Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setRoleToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        const result = await createRole.mutateAsync(data);
        navigate(`/roles/${result.id}`);
        setLocalViewMode('detail');
        toast.success('Role created', `"${result.name}" has been created successfully`);
      } else if (viewMode === 'edit' && selectedRole) {
        const result = await updateRole.mutateAsync({
          roleId: selectedRole.id,
          roleData: data,
          version: selectedRole.version
        });
        navigate(`/roles/${selectedRole.id}`);
        setLocalViewMode('detail');
        toast.success('Role updated', `"${result.name}" has been updated successfully`);
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      toast.error('Failed to save role', 'Please try again.');
      throw error; // Re-throw to let form handle it
    }
  };

  const handleFormCancel = () => {
    if (viewMode === 'create') {
      navigate('/roles');
      setTemplateData(null);
    } else if (viewMode === 'edit' && roleId) {
      navigate(`/roles/${roleId}`);
    }
    setLocalViewMode('detail');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage roles for your organization
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add New Role
        </Button>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Role List */}
        <RoleList
          selectedRole={selectedRole || null}
          onSelectRole={handleSelectRole}
          onCreateNew={handleCreateNew} />


        {/* Right Panel - Detail/Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[calc(100vh-200px)]">
            {viewMode === 'detail' && selectedRole ?
            <RoleDetail
              role={selectedRole}
              groups={groups}
              actions={allActions}
              restrictions={allRestrictions}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onClone={handleClone} /> :

            viewMode === 'detail' && !selectedRole ?
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-full mb-4">
                  <svg
                  className="w-16 h-16 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24" data-test-id="svg-f656bd6a">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No role selected
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Select a role from the list to view its details, or create a new role to get started.
                </p>
              </div> :
            viewMode === 'template-select' ?
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onSkip={handleSkipTemplate} /> :

            viewMode === 'create' || viewMode === 'edit' ?
            <RoleForm
              role={viewMode === 'edit' ? selectedRole || undefined : templateData as any}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createRole.isPending || updateRole.isPending} /> :

            null}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        role={roleToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteRole.isPending} />

    </div>);

}