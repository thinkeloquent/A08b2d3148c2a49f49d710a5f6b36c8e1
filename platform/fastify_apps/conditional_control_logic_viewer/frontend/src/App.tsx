import { useState, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { TreeItems } from 'dnd-kit-sortable-tree';
import { Sidebar, SortableFilterTree } from '@/components';
import type { SaveStatus } from '@/components/SortableFilterTree';
import { getFilterTree, createFilterTree, updateFilterTree } from '@/services/api/filter-trees';
import { useDropdownOptionsQuery, FieldOptionsContext } from '@/hooks/useDropdownOptions';
import type { TreeItemData } from '@/types';

function App() {
  const queryClient = useQueryClient();
  const { data: dropdownOptions } = useDropdownOptionsQuery();
  const fieldOptions = useMemo(
    () => (dropdownOptions ?? []).map((o) => ({ value: o.value, label: o.label })),
    [dropdownOptions]
  );

  const [items, setItems] = useState<TreeItems<TreeItemData>>([]);
  const [savedTreeId, setSavedTreeId] = useState<string | null>(null);
  const [_treeName, setTreeName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const markUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus((prev) => prev === 'saved' ? 'idle' : prev);
  }, []);

  const handleItemsChanged = useCallback(
    (newItems: TreeItems<TreeItemData>) => {
      setItems(newItems);
      markUnsaved();
    },
    [markUnsaved]
  );

  const confirmIfUnsaved = useCallback((): boolean => {
    if (!hasUnsavedChanges) return true;
    return window.confirm('You have unsaved changes. Discard them?');
  }, [hasUnsavedChanges]);

  const handleSelectTree = useCallback(
    async (id: string) => {
      if (id === savedTreeId) return;
      if (!confirmIfUnsaved()) return;

      try {
        const tree = await getFilterTree(id);
        setItems(tree.tree_data?.children ?? []);
        setSavedTreeId(tree.id);
        setTreeName(tree.name);
        setHasUnsavedChanges(false);
        setSaveStatus('idle');
        setSaveError(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to load tree');
      }
    },
    [savedTreeId, confirmIfUnsaved]
  );

  const handleNewTree = useCallback(() => {
    if (!confirmIfUnsaved()) return;
    setItems([]);
    setSavedTreeId(null);
    setTreeName(null);
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
    setSaveError(null);
  }, [confirmIfUnsaved]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setSaveError(null);

    const treePayload = {
      id: 'root',
      type: 'group',
      operator: 'AND',
      children: items
    };

    try {
      let saved;
      if (savedTreeId) {
        saved = await updateFilterTree(savedTreeId, { tree_data: treePayload });
      } else {
        const name = `Filter Tree ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
        saved = await createFilterTree({
          name,
          description: 'Saved from Conditional Control Logic Viewer',
          tree_data: treePayload
        });
      }

      setSavedTreeId(saved.id);
      setTreeName(saved.name);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);

      queryClient.invalidateQueries({ queryKey: ['filter-trees'] });

      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    }
  }, [items, savedTreeId, queryClient]);

  const handleReset = useCallback(() => {
    setItems([]);
    setSavedTreeId(null);
    setTreeName(null);
    markUnsaved();
  }, [markUnsaved]);

  return (
    <FieldOptionsContext.Provider value={fieldOptions}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 font-sans flex">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100 rounded-full opacity-40 blur-3xl" />
        </div>

        {/* Sidebar */}
        <Sidebar
          selectedTreeId={savedTreeId}
          onSelectTree={handleSelectTree}
          onNewTree={handleNewTree} />


        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
          <div className="relative max-w-4xl mx-auto" data-test-id="div-494b2418">
            <SortableFilterTree
              items={items}
              onItemsChanged={handleItemsChanged}
              onSave={handleSave}
              onReset={handleReset}
              saveStatus={saveStatus}
              saveError={saveError}
              hasUnsavedChanges={hasUnsavedChanges}
              savedTreeId={savedTreeId} />

          </div>
        </main>
      </div>
    </FieldOptionsContext.Provider>);

}

export default App;