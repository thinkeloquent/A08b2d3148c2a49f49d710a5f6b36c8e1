/**
 * ActionsPage Component
 * Main page for action management with master-detail layout
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ActionList } from '@/components/actions/ActionList';
import { ActionDetail } from '@/components/actions/ActionDetail';
import { ActionForm } from '@/components/actions/ActionForm';
import { Button } from '@/components/ui';
import { useCreateAction, useUpdateAction, useDeleteAction } from '@/hooks/useActions';
import { useToast } from '@/contexts/ToastContext';
import type { Action } from '@/types';

type ViewMode = 'detail' | 'create' | 'edit';

export default function ActionsPage() {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');

  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const deleteAction = useDeleteAction();

  const toast = useToast();

  const handleSelectAction = (action: Action) => {
    setSelectedAction(action);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setSelectedAction(null);
    setViewMode('create');
  };

  const handleEdit = () => {
    if (selectedAction) {
      setViewMode('edit');
    }
  };

  const handleDelete = async () => {
    if (!selectedAction) return;

    const actionName = selectedAction.name;

    try {
      await deleteAction.mutateAsync(selectedAction.id);
      setSelectedAction(null);
      setViewMode('detail');
      toast.success('Action deleted', `"${actionName}" has been deleted`);
    } catch (error) {
      console.error('Failed to delete action:', error);
      toast.error('Failed to delete action', 'It may still be in use by roles or groups.');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        const result = await createAction.mutateAsync(data);
        setSelectedAction(result);
        setViewMode('detail');
        toast.success('Action created', `"${result.name}" has been created successfully`);
      } else if (viewMode === 'edit' && selectedAction) {
        const result = await updateAction.mutateAsync({
          actionId: selectedAction.id,
          actionData: data
        });
        setSelectedAction(result);
        setViewMode('detail');
        toast.success('Action updated', `"${result.name}" has been updated successfully`);
      }
    } catch (error) {
      console.error('Failed to save action:', error);
      toast.error('Failed to save action', 'Please try again.');
      throw error;
    }
  };

  const handleFormCancel = () => {
    if (viewMode === 'create') {
      setSelectedAction(null);
    }
    setViewMode('detail');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Action Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage actions for roles and groups
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add New Action
        </Button>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Action List */}
        <ActionList
          selectedAction={selectedAction}
          onSelectAction={handleSelectAction}
          onCreateNew={handleCreateNew} />


        {/* Right Panel - Detail/Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[calc(100vh-200px)]">
            {viewMode === 'detail' && selectedAction ?
            <ActionDetail
              action={selectedAction}
              onEdit={handleEdit}
              onDelete={handleDelete} /> :

            viewMode === 'detail' && !selectedAction ?
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-full mb-4">
                  <svg
                  className="w-16 h-16 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24" data-test-id="svg-0ecec9da">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />

                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No action selected
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Select an action from the list to view its details, or create a new action to get started.
                </p>
              </div> :
            viewMode === 'create' || viewMode === 'edit' ?
            <ActionForm
              action={viewMode === 'edit' ? selectedAction || undefined : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createAction.isPending || updateAction.isPending} /> :

            null}
          </div>
        </div>
      </div>
    </div>);

}