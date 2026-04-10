/**
 * Form Builder Page — wraps the existing builder with API persistence.
 * Loads form data from the API when an ID is present.
 * Provides a save button that persists the current form state.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Canvas from '../components/Canvas';
import PageTabs from '../components/PageTabs';
import PropertiesPanel from '../components/PropertiesPanel';
import MetaPropertiesPanel from '../components/MetaPropertiesPanel';
import MetaEditorOverlay from '../components/MetaEditorOverlay';
import TopMenu from '../components/TopMenu';
import StateDrawer from '../components/StateDrawer';
import ImportExportModal from '../components/ImportExportModal';
import ResizableSidebar from '../components/ResizableSidebar';
import { FormBuilderProvider, useFormBuilder } from '../context/FormBuilderContext';
import { useForm, useUpdateForm, useCreateForm } from '../hooks/useForms';
import { exportFormToSchema, importSchemaToForm } from '../utils/importExport';
import type { ExportableFormSchema } from '../utils/importExport';

function FormBuilderInner() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const {
    pages,
    currentPageIndex,
    formVersion,
    selectedElementId,
    cols,
    rowHeight,
    isDragging,
    dragType,
    dragSource,
    hoverElementId,
    activityLog,
    showStateDrawer,
    metadata,
    selectedMetaId,
    showMetaBoundaries,
    currentPageMetadata,
    selectedMeta,
    currentPage,
    selectedElement,
    setFormVersion,
    incrementVersion,
    addPage,
    deletePage,
    setCurrentPageIndex,
    updatePageTitle,
    updateCurrentPageTitle,
    updateCurrentPageDescription,
    addElement,
    deleteElement,
    updateElement,
    selectElement,
    updateLayout,
    setDragStart,
    setDragEnd,
    toggleStateDrawer,
    toggleElementLock,
    addMetaComponent,
    updateMetaComponent,
    deleteMetaComponent,
    updateMetaLayout,
    selectMetaComponent,
    toggleMetaBoundaries,
    toggleMetaLock,
    addElementToContainer,
    updateContainerChildLayout,
    removeElementFromContainer,
    importForm,
    elementMetadata,
    elementBounds,
    updateElementBounds,
    overlayMetaId,
    overlayMeta,
    closeMetaOverlay
  } = useFormBuilder();

  // API hooks
  const { data: formData, isLoading: isLoadingForm } = useForm(isNew ? null : id!);
  const updateForm = useUpdateForm();
  const createForm = useCreateForm();

  // Track the DB ID for the current form (null for new unsaved forms)
  const [formId, setFormId] = useState<string | null>(isNew ? null : id!);
  const [formName, setFormName] = useState('Untitled Form');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving' | 'error'>('unsaved');
  const loadedRef = useRef(false);

  // Load form from API
  useEffect(() => {
    if (formData && !loadedRef.current) {
      loadedRef.current = true;
      const form = formData.formDefinition;
      setFormName(form.name);
      setFormId(form.id);

      if (form.schema_data) {
        const schema = form.schema_data as ExportableFormSchema;
        const imported = importSchemaToForm(schema);
        importForm(imported.pages, imported.metadata, imported.elementMetadata);
        if (schema.version) {
          setFormVersion(schema.version);
        }
      }
      setSaveStatus('saved');
    }
  }, [formData, importForm, setFormVersion]);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const schemaData = exportFormToSchema(pages, metadata, elementMetadata, elementBounds, formVersion);

      if (formId) {
        await updateForm.mutateAsync({
          id: formId,
          data: {
            name: formName,
            version: formVersion,
            schema_data: schemaData
          }
        });
      } else {
        const result = await createForm.mutateAsync({
          name: formName,
          version: formVersion,
          status: 'draft',
          schema_data: schemaData
        });
        const newId = result.formDefinition.id;
        setFormId(newId);
        navigate(`/builder/${newId}`, { replace: true });
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save form:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [formId, formName, formVersion, pages, metadata, elementMetadata, elementBounds, updateForm, createForm, navigate]);

  // Modal state
  const [importExportModal, setImportExportModal] = useState<{
    isOpen: boolean;
    mode: 'import' | 'export';
  }>({ isOpen: false, mode: 'export' });

  const openImportModal = () => setImportExportModal({ isOpen: true, mode: 'import' });
  const openExportModal = () => setImportExportModal({ isOpen: true, mode: 'export' });
  const closeModal = () => setImportExportModal((prev) => ({ ...prev, isOpen: false }));

  const appState = {
    schema: { pages, currentPageIndex },
    runtime: {
      selectedElementId,
      isDragging,
      dragType,
      dragSource,
      hoverElementId,
      cols,
      rowHeight,
      selectedMetaId,
      showMetaBoundaries
    },
    metadata,
    activity: activityLog
  };

  if (!isNew && isLoadingForm) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading form...
      </div>);

  }

  return (
    <div className="app-container">
      {/* Save bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.25rem 0.75rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
        fontSize: '0.8rem'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '0.8rem' }}>

          &larr; Forms
        </button>
        <input
          value={formName}
          onChange={(e) => {setFormName(e.target.value);setSaveStatus('unsaved');}}
          style={{
            border: '1px solid transparent', padding: '0.25rem 0.5rem',
            borderRadius: 4, fontWeight: 500, fontSize: '0.85rem', flex: 1,
            maxWidth: 300
          }}
          onFocus={(e) => {e.target.style.borderColor = '#d1d5db';}}
          onBlur={(e) => {e.target.style.borderColor = 'transparent';}} />

        <span style={{ color: saveStatus === 'saved' ? '#22c55e' : saveStatus === 'error' ? '#ef4444' : '#9ca3af' }}>
          {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Error' : 'Unsaved'}
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.25rem 0.75rem', background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 4, cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem', opacity: isSaving ? 0.6 : 1
          }}>

          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <TopMenu
        cols={cols}
        rowHeight={rowHeight}
        showStateDrawer={showStateDrawer}
        onToggleStateDrawer={toggleStateDrawer}
        showMetaBoundaries={showMetaBoundaries}
        onToggleMetaBoundaries={toggleMetaBoundaries}
        onImport={openImportModal}
        onExport={openExportModal}
        formVersion={formVersion}
        onVersionChange={setFormVersion}
        onIncrementVersion={incrementVersion} />

      <PageTabs
        pages={pages}
        currentPageIndex={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onAddPage={addPage}
        onDeletePage={deletePage}
        onUpdatePageTitle={updatePageTitle} />

      <main className="app-main">
        <Canvas
          elements={currentPage.elements}
          layout={currentPage.layout}
          selectedElementId={selectedElementId}
          pageTitle={currentPage.title}
          pageDescription={currentPage.description}
          cols={cols}
          rowHeight={rowHeight}
          onLayoutChange={updateLayout}
          onAddElement={addElement}
          onSelectElement={selectElement}
          onDeleteElement={deleteElement}
          onToggleElementLock={toggleElementLock}
          onUpdatePageTitle={updateCurrentPageTitle}
          onUpdatePageDescription={updateCurrentPageDescription}
          metaComponents={currentPageMetadata.metaComponents}
          metaLayout={currentPageMetadata.metaLayout}
          selectedMetaId={selectedMetaId}
          showMetaBoundaries={showMetaBoundaries}
          pageId={currentPage.id}
          onSelectMeta={selectMetaComponent}
          onAddMetaComponent={addMetaComponent}
          onDeleteMeta={deleteMetaComponent}
          onMetaLayoutChange={updateMetaLayout}
          onToggleMetaLock={toggleMetaLock}
          onAddElementToContainer={addElementToContainer}
          onUpdateContainerChildLayout={updateContainerChildLayout}
          onRemoveElementFromContainer={removeElementFromContainer}
          onUpdateElementBounds={updateElementBounds} data-test-id="canvas-ef86aefa" />

        <ResizableSidebar defaultWidth={500} minWidth={200} maxWidth={500} data-test-id="resizablesidebar-3e1cff9d">
          {selectedElementId && selectedElement ?
          <PropertiesPanel
            element={selectedElement}
            onUpdate={updateElement}
            onClose={() => selectElement(null)}
            onDelete={deleteElement} /> :

          selectedMetaId && selectedMeta ?
          <MetaPropertiesPanel
            meta={selectedMeta}
            availableElements={currentPage.elements}
            onUpdate={updateMetaComponent}
            onClose={() => selectMetaComponent(null)}
            onDelete={deleteMetaComponent} /> :


          <Sidebar onDragStart={setDragStart} onDragEnd={setDragEnd} />
          }
        </ResizableSidebar>
      </main>
      {showStateDrawer &&
      <StateDrawer state={appState} onClose={toggleStateDrawer} />
      }
      <ImportExportModal
        isOpen={importExportModal.isOpen}
        mode={importExportModal.mode}
        onClose={closeModal}
        pages={pages}
        metadata={metadata}
        elementMetadata={elementMetadata}
        elementBounds={elementBounds}
        version={formVersion}
        onImport={importForm} />

      {overlayMetaId && overlayMeta &&
      <MetaEditorOverlay
        meta={overlayMeta}
        availableElements={currentPage.elements}
        onUpdate={updateMetaComponent}
        onClose={closeMetaOverlay}
        onDelete={deleteMetaComponent} />

      }
    </div>);

}

export default function FormBuilderPage() {
  return (
    <FormBuilderProvider>
      <FormBuilderInner />
    </FormBuilderProvider>);

}