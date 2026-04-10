/**
 * ReferencesPage
 * Standalone page for browsing and managing all references
 */

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardContent, Button, Badge, Modal, ModalFooter, Input, Textarea } from '@/components/ui';
import { Link, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';
import {
  useReferences,
  useCreateReference,
  useUpdateReference,
  useDeleteReference } from
'@/hooks/useReferences';
import type { Reference, CreateReferenceDTO } from '@/types';

export function ReferencesPage() {
  const { data, isLoading } = useReferences();
  const createMutation = useCreateReference();
  const updateMutation = useUpdateReference();
  const deleteMutation = useDeleteReference();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Reference | null>(null);
  const [selectedRef, setSelectedRef] = useState<Reference | null>(null);

  const [formData, setFormData] = useState({
    entityType: 'organization' as string,
    entityId: '',
    name: '',
    link: '',
    type: '',
    externalUid: '',
    description: '',
    status: 'active' as string
  });

  const references = data?.data || [];

  const openCreate = () => {
    setEditingRef(null);
    setFormData({
      entityType: 'organization',
      entityId: '',
      name: '',
      link: '',
      type: '',
      externalUid: '',
      description: '',
      status: 'active'
    });
    setIsFormOpen(true);
  };

  const openEdit = (ref: Reference) => {
    setEditingRef(ref);
    setFormData({
      entityType: ref.entityType,
      entityId: ref.entityId,
      name: ref.name,
      link: ref.link,
      type: ref.type,
      externalUid: ref.externalUid,
      description: ref.description || '',
      status: ref.status
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRef) {
      await updateMutation.mutateAsync({ id: editingRef.id, updates: formData });
    } else {
      await createMutation.mutateAsync(formData as CreateReferenceDTO);
    }
    setIsFormOpen(false);
    setSelectedRef(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reference?')) {
      await deleteMutation.mutateAsync(id);
      if (selectedRef?.id === id) setSelectedRef(null);
    }
  };

  return (
    <MainLayout breadcrumbs={[{ label: 'References' }]}>
      <div className="h-full overflow-auto bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">References</h1>
              <p className="mt-1 text-sm text-gray-600">
                External items that reference FQDP entities
              </p>
            </div>
            <Button onClick={openCreate} data-testid="create-button">
              <Plus className="mr-2 h-4 w-4" />
              Create Reference
            </Button>
          </div>

          {isLoading ?
          <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div> :
          references.length === 0 ?
          <Card>
              <CardContent className="py-12 text-center">
                <Link className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No references yet</h3>
                <p className="mt-2 text-sm text-gray-500">Create a reference to link external items to FQDP entities.</p>
              </CardContent>
            </Card> :

          <div className="space-y-3">
              {references.map((ref) =>
            <Card key={ref.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <button
                    onClick={() => setSelectedRef(selectedRef?.id === ref.id ? null : ref)}
                    className="flex-1 text-left">

                        <div className="flex items-center space-x-3">
                          <div className="rounded-lg bg-teal-100 p-2">
                            <Link className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ref.name}</p>
                            <p className="text-sm text-gray-500">
                              <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                                {ref.type}
                              </span>
                              <span className="mx-2 text-gray-300">|</span>
                              {ref.entityType}
                              <span className="mx-2 text-gray-300">|</span>
                              <span className="font-mono text-xs">{ref.externalUid}</span>
                            </p>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center space-x-2">
                        <Badge status={ref.status as any} />
                        <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(ref)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(ref.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {selectedRef?.id === ref.id &&
                <div className="mt-4 border-t pt-4 text-sm text-gray-600 space-y-2">
                        {ref.description && <p>{ref.description}</p>}
                        <p><span className="font-medium">Entity ID:</span> <span className="font-mono text-xs">{ref.entityId}</span></p>
                        <p><span className="font-medium">Link:</span> <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{ref.link}</a></p>
                      </div>
                }
                  </CardContent>
                </Card>
            )}
            </div>
          }

          {/* Create/Edit Modal */}
          <Modal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            title={editingRef ? 'Edit Reference' : 'Create Reference'}
            size="md">

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Reference name"
                data-testid="name-input" data-test-id="input-5384f741" />


              <div data-test-id="div-fc20b881">
                <label className="mb-2 block text-sm font-medium text-gray-700">Entity Type <span className="text-red-500">*</span></label>
                <select
                  value={formData.entityType}
                  onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">

                  <option value="organization">Organization</option>
                  <option value="workspace">Workspace</option>
                  <option value="team">Team</option>
                  <option value="application">Application</option>
                  <option value="project">Project</option>
                  <option value="resource">Resource</option>
                </select>
              </div>

              <Input
                label="Entity ID"
                required
                value={formData.entityId}
                onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                placeholder="UUID of the entity" data-test-id="input-a1bf8308" />


              <Input
                label="Link"
                required
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..." data-test-id="input-bf9dd099" />


              <Input
                label="Type"
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., service, page, component, repository" data-test-id="input-f154b24c" />


              <Input
                label="External UID"
                required
                value={formData.externalUid}
                onChange={(e) => setFormData({ ...formData, externalUid: e.target.value })}
                placeholder="Unique identifier in external system" data-test-id="input-af93ab69" />


              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..." data-test-id="textarea-35c3658d" />


              <div data-test-id="div-26f479eb">
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  data-testid="status-select">

                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <ModalFooter data-test-id="modalfooter-581be111">
                <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} data-testid="submit-button">
                  {editingRef ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </div>
      </div>
    </MainLayout>);

}