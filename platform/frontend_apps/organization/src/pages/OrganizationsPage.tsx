import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Organization, EntityStatus } from '@/types';
import type { FilterOption } from '@internal/panel-item-listing';
import { PanelItemListing, PanelListItem } from '@internal/panel-item-listing';
import { useOrganizations } from '@/hooks/useOrganizations';
import { OrganizationDetail } from '@/components/organizations/OrganizationDetail';
import { OrganizationForm } from '@/components/organizations/OrganizationForm';
import { DeleteConfirmationDialog } from '@/components/organizations/DeleteConfirmationDialog';
import { Badge, Spinner } from '@/components/ui';
import { Building, Plus, Search } from 'lucide-react';

const STATUS_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'work-in-progress', label: 'Work in Progress' },
  { value: 'archived', label: 'Archived' },
];

export function OrganizationsPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrganizations();

  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | undefined>();
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const organizations = data?.data || [];

  const filtered = useMemo(() => {
    let result = organizations;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (org) =>
          org.name.toLowerCase().includes(q) ||
          org.slug.toLowerCase().includes(q) ||
          org.description?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((org) => org.status === statusFilter);
    }
    return result;
  }, [organizations, search, statusFilter]);

  const selectedOrg = organizations.find((org) => org.id === id);

  const handleSelect = useCallback(
    (org: Organization) => {
      navigate(`/${org.id}`);
    },
    [navigate]
  );

  const handleCreate = useCallback(() => {
    setEditingOrg(undefined);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedOrg) {
      setEditingOrg(selectedOrg);
      setShowForm(true);
    }
  }, [selectedOrg]);

  const handleDelete = useCallback(() => {
    if (selectedOrg) setDeletingOrg(selectedOrg);
  }, [selectedOrg]);

  const handleDeleteSuccess = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingOrg(undefined);
  }, []);

  return (
    <>
      <PanelItemListing<Organization>
        title="Organizations"
        items={filtered}
        getItemKey={(org) => org.id}
        selectedKey={id}
        onItemSelect={handleSelect}
        searchPlaceholder="Search organizations..."
        searchValue={search}
        onSearchChange={setSearch}
        searchIcon={<Search className="h-4 w-4" />}
        filterOptions={STATUS_FILTERS}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        actionLabel="Create Organization"
        actionIcon={<Plus className="h-4 w-4" />}
        onActionClick={handleCreate}
        isLoading={isLoading}
        error={error}
        loadingElement={<Spinner size="md" />}
        totalCount={organizations.length}
        itemLabel="organizations"
        renderItem={(org, isSelected) => (
          <PanelListItem
            title={org.name}
            subtitle={org.slug}
            description={org.description}
            isSelected={isSelected}
            icon={<Building className="h-5 w-5 text-gray-400" />}
            badge={<Badge status={org.status} size="sm" />}
          />
        )}
      >
        {selectedOrg ? (
          <div className="p-6">
            <OrganizationDetail
              organization={selectedOrg}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Building className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No organization selected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Select an organization from the list or create a new one.
              </p>
            </div>
          </div>
        )}
      </PanelItemListing>

      {/* Modals */}
      <OrganizationForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingOrg(undefined); }}
        organization={editingOrg}
        onSuccess={handleFormSuccess}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingOrg}
        onClose={() => setDeletingOrg(null)}
        organization={deletingOrg}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
