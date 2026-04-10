import { useState, useMemo } from 'react';
import { Search, Plus, Grid3X3, List } from 'lucide-react';
import { CategoryItem } from './CategoryItem';
import { ComponentCard } from './ComponentCard';
import { FilterDropdown } from './FilterDropdown';
import { RegisterModal } from './RegisterModal';
import { ComponentDetailPanel } from './ComponentDetailPanel';
import { useComponents, useCreateComponent, useCategories } from '@/hooks/useComponents';
import { resolveIcon } from '@/data/categories';
import type {
  Component,
  FilterOptions,
  RegisterFormData,
  Category,
} from '@/types';

export function ComponentRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({ status: null, author: null });

  const { data: componentsData, isLoading } = useComponents({
    limit: 100,
    search: searchQuery || undefined,
    status: filters.status || undefined,
    category: selectedCategory || undefined,
    author: filters.author || undefined,
    sort: 'downloads',
    order: 'desc'
  });

  const { data: apiCategories = [] } = useCategories();

  const createComponent = useCreateComponent();

  const components = componentsData?.data ?? [];

  const categories: Category[] = useMemo(() => {
    return apiCategories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      icon: resolveIcon(cat.icon),
      count: cat.count,
    }));
  }, [apiCategories]);

  const totalCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.count, 0);
  }, [categories]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return 'All Components';
    return categories.find((c) => c.slug === selectedCategory)?.name ?? 'All Components';
  }, [selectedCategory, categories]);

  const handleRegister = (data: RegisterFormData) => {
    createComponent.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative flex h-screen">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
          {/* Register Button */}
          <div className="p-4" data-test-id="div-e7e68043">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              Register Component
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto px-4 pb-4" data-test-id="div-86e20135">
            <div className="mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                !selectedCategory ?
                'bg-indigo-50 text-indigo-700' :
                'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`
                }>
                <Grid3X3
                  className={`w-5 h-5 ${!selectedCategory ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="flex-1 text-left font-medium text-sm">All Components</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  !selectedCategory ?
                  'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-600'}`
                  }>
                  {totalCount}
                </span>
              </button>
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              Categories
            </p>
            <div className="space-y-0.5">
              {categories.map((category) =>
              <CategoryItem
                key={category.slug}
                category={category}
                isSelected={selectedCategory === category.slug}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.slug ? null : category.slug
                )} />
              )}
            </div>
          </div>

        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 ${
          selectedComponent ? 'mr-[480px]' : ''}`
          }>

          <div className="p-8" data-test-id="div-9f028613">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedCategoryName}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Browse and discover UI components
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`
                    }>
                    <Grid3X3 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`
                    }>
                    <List className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search components by name, tag, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-colors" />
              </div>
              <FilterDropdown filters={filters} onFiltersChange={setFilters} />
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {isLoading ?
                'Loading...' :
                <>
                    Showing{' '}
                    <span className="font-medium text-gray-700">
                      {components.length}
                    </span>{' '}
                    components
                  </>
                }
              </p>
            </div>

            {/* Components Grid */}
            <div
              className={`grid gap-4 ${
              viewMode === 'grid' ?
              'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' :
              'grid-cols-1'}`
              }>
              {components.map((component) =>
              <ComponentCard
                key={component.id}
                component={component}
                onSelect={setSelectedComponent} />
              )}
            </div>

            {!isLoading && components.length === 0 &&
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">
                  No components found
                </h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            }
          </div>
        </main>

        {/* Component Detail Panel */}
        <ComponentDetailPanel
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)} />

      </div>

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister} />

    </div>);

}
