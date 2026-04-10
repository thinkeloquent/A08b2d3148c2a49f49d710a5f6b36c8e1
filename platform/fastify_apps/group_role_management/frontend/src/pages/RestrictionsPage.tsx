/**
 * RestrictionsPage Component
 * Main page for restriction management with master-detail layout
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { RestrictionList } from '@/components/restrictions/RestrictionList';
import { RestrictionDetail } from '@/components/restrictions/RestrictionDetail';
import { RestrictionForm } from '@/components/restrictions/RestrictionForm';
import { Button } from '@/components/ui';
import { useCreateRestriction, useUpdateRestriction, useDeleteRestriction } from '@/hooks/useRestrictions';
import { useToast } from '@/contexts/ToastContext';
import type { Restriction } from '@/types';

type ViewMode = 'detail' | 'create' | 'edit';

export default function RestrictionsPage() {
  const [selectedRestriction, setSelectedRestriction] = useState<Restriction | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');

  const createRestriction = useCreateRestriction();
  const updateRestriction = useUpdateRestriction();
  const deleteRestriction = useDeleteRestriction();

  const toast = useToast();

  const handleSelectRestriction = (restriction: Restriction) => {
    setSelectedRestriction(restriction);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setSelectedRestriction(null);
    setViewMode('create');
  };

  const handleEdit = () => {
    if (selectedRestriction) {
      setViewMode('edit');
    }
  };

  const handleDelete = async () => {
    if (!selectedRestriction) return;

    const restrictionName = selectedRestriction.name;

    try {
      await deleteRestriction.mutateAsync(selectedRestriction.id);
      setSelectedRestriction(null);
      setViewMode('detail');
      toast.success('Restriction deleted', `"${restrictionName}" has been deleted`);
    } catch (error) {
      console.error('Failed to delete restriction:', error);
      toast.error('Failed to delete restriction', 'It may still be in use by roles or groups.');
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        const result = await createRestriction.mutateAsync(data);
        setSelectedRestriction(result);
        setViewMode('detail');
        toast.success('Restriction created', `"${result.name}" has been created successfully`);
      } else if (viewMode === 'edit' && selectedRestriction) {
        const result = await updateRestriction.mutateAsync({
          restrictionId: selectedRestriction.id,
          restrictionData: data
        });
        setSelectedRestriction(result);
        setViewMode('detail');
        toast.success('Restriction updated', `"${result.name}" has been updated successfully`);
      }
    } catch (error) {
      console.error('Failed to save restriction:', error);
      toast.error('Failed to save restriction', 'Please try again.');
      throw error;
    }
  };

  const handleFormCancel = () => {
    if (viewMode === 'create') {
      setSelectedRestriction(null);
    }
    setViewMode('detail');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restriction Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage restrictions for roles and groups
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add New Restriction
        </Button>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Restriction List */}
        <RestrictionList
          selectedRestriction={selectedRestriction}
          onSelectRestriction={handleSelectRestriction}
          onCreateNew={handleCreateNew} />


        {/* Right Panel - Detail/Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[calc(100vh-200px)]">
            {viewMode === 'detail' && selectedRestriction ?
            <RestrictionDetail
              restriction={selectedRestriction}
              onEdit={handleEdit}
              onDelete={handleDelete} /> :

            viewMode === 'detail' && !selectedRestriction ?
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-full mb-4">
                  <svg
                  className="w-16 h-16 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24" data-test-id="svg-7102b0df">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />

                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No restriction selected
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Select a restriction from the list to view its details, or create a new restriction to get started.
                </p>
              </div> :
            viewMode === 'create' || viewMode === 'edit' ?
            <RestrictionForm
              restriction={viewMode === 'edit' ? selectedRestriction || undefined : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createRestriction.isPending || updateRestriction.isPending} /> :

            null}
          </div>
        </div>
      </div>
    </div>);

}