import { X } from 'lucide-react';
import { MetaComponent, FormElement } from '../types';
import { getMetaComponentByMetaType } from '../meta-components';

interface MetaEditorOverlayProps {
  meta: MetaComponent;
  availableElements: FormElement[];
  onUpdate: (meta: MetaComponent) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const MetaEditorOverlay = ({
  meta,
  availableElements,
  onUpdate,
  onClose,
  onDelete,
}: MetaEditorOverlayProps) => {
  const config = getMetaComponentByMetaType(meta.type);
  if (!config) return null;

  const Editor = config.editor;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto py-8">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <config.icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{meta.name}</h2>
              <p className="text-sm text-gray-500">{config.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Editor
            meta={meta}
            onUpdate={onUpdate}
            onDelete={() => {
              onDelete(meta.id);
              onClose();
            }}
            availableElements={availableElements.map((el) => ({
              id: el.id,
              label: el.label,
              type: el.type,
            }))}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onDelete(meta.id);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaEditorOverlay;
