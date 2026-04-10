/**
 * LabelsPage Component
 * Main page for label management with master-detail layout
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { LabelList } from '@/components/labels/LabelList';
import { LabelDetail } from '@/components/labels/LabelDetail';
import { LabelForm } from '@/components/labels/LabelForm';
import { LabelMergeDialog } from '@/components/labels/LabelMergeDialog';
import { Button } from '@/components/ui';
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from '@/hooks/useLabels';
import { useRoles } from '@/hooks/useRoles';
import { useToast } from '@/contexts/ToastContext';
import type { Label } from '@/types';

type ViewMode = 'detail' | 'create' | 'edit';

export default function LabelsPage() {
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  // Fetch labels
  const { data: labelsData } = useLabels();
  const allLabels = labelsData || [];

  // Fetch all roles to show which roles use a label
  const { data: rolesData } = useRoles();
  const allRoles = rolesData?.data || [];

  // Roles that use the selected label
  const labelRoles = selectedLabel ?
  allRoles.filter((role) => role.labels.includes(selectedLabel.name)) :
  [];

  // Mutations
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();

  const toast = useToast();

  const handleSelectLabel = (label: Label) => {
    setSelectedLabel(label);
    setViewMode('detail');
  };

  const handleCreateNew = () => {
    setSelectedLabel(null);
    setViewMode('create');
  };

  const handleEdit = () => {
    if (selectedLabel) {
      setViewMode('edit');
    }
  };

  const handleDelete = async () => {
    if (!selectedLabel) return;

    const labelName = selectedLabel.name;

    try {
      await deleteLabel.mutateAsync(labelName);
      setSelectedLabel(null);
      setViewMode('detail');
      toast.success('Label deleted', `"${labelName}" has been deleted`);
    } catch (error) {
      console.error('Failed to delete label:', error);
      toast.error('Failed to delete label', 'It may still be in use by roles.');
    }
  };

  const handleMerge = () => {
    if (selectedLabel) {
      setShowMergeDialog(true);
    }
  };

  const handleMergeConfirm = async (sourceLabel: Label, targetLabel: Label) => {
    // Merge is a UI concept: reassign roles from source to target, then delete source
    toast.info('Merge', `Merging "${sourceLabel.name}" into "${targetLabel.name}" — not yet implemented`);
    setShowMergeDialog(false);
  };

  const handleMergeCancel = () => {
    setShowMergeDialog(false);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (viewMode === 'create') {
        const result = await createLabel.mutateAsync(data);
        setSelectedLabel(result);
        setViewMode('detail');
        toast.success('Label created', `"${result.name}" has been created successfully`);
      } else if (viewMode === 'edit' && selectedLabel) {
        const result = await updateLabel.mutateAsync({
          labelName: selectedLabel.name,
          labelData: data
        });
        setSelectedLabel(result);
        setViewMode('detail');
        toast.success('Label updated', `"${result.name}" has been updated successfully`);
      }
    } catch (error) {
      console.error('Failed to save label:', error);
      toast.error('Failed to save label', 'Please try again.');
      throw error;
    }
  };

  const handleFormCancel = () => {
    if (viewMode === 'create') {
      setSelectedLabel(null);
    }
    setViewMode('detail');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Label Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage labels for role categorization
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add New Label
        </Button>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6">
        {/* Left Panel - Label List */}
        <LabelList
          selectedLabel={selectedLabel}
          onSelectLabel={handleSelectLabel}
          onCreateNew={handleCreateNew} />


        {/* Right Panel - Detail/Form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[calc(100vh-200px)]">
            {viewMode === 'detail' && selectedLabel ?
            <LabelDetail
              label={selectedLabel}
              roles={labelRoles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMerge={handleMerge} /> :

            viewMode === 'detail' && !selectedLabel ?
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-full mb-4">
                  <svg
                  className="w-16 h-16 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24" data-test-id="svg-c4c7f37c">

                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />

                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No label selected
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Select a label from the list to view its details, or create a new label to get started.
                </p>
              </div> :
            viewMode === 'create' || viewMode === 'edit' ?
            <LabelForm
              label={viewMode === 'edit' ? selectedLabel || undefined : undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isLoading={createLabel.isPending || updateLabel.isPending} /> :

            null}
          </div>
        </div>
      </div>

      {/* Merge Dialog */}
      <LabelMergeDialog
        isOpen={showMergeDialog}
        sourceLabel={selectedLabel}
        availableLabels={allLabels.filter((l) => l.name !== selectedLabel?.name)}
        onConfirm={handleMergeConfirm}
        onCancel={handleMergeCancel} />

    </div>);

}