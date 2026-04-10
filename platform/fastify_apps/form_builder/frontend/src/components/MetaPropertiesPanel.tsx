import { X, Trash2 } from 'lucide-react';
import { MetaComponent, FormElement } from '../types';
import { getMetaComponentByMetaType } from '../meta-components';

interface MetaPropertiesPanelProps {
  meta: MetaComponent;
  availableElements: FormElement[];
  onUpdate: (meta: MetaComponent) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const MetaPropertiesPanel = ({
  meta,
  availableElements,
  onUpdate,
  onClose,
  onDelete
}: MetaPropertiesPanelProps) => {
  const config = getMetaComponentByMetaType(meta.type);
  if (!config) return null;

  const Editor = config.editor;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">
          <span className="text-purple-600" data-test-id="span-5ba3c700">{config.type}</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors">

          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Editor
          meta={meta}
          onUpdate={onUpdate}
          onDelete={() => onDelete(meta.id)}
          availableElements={availableElements.map((el) => ({
            id: el.id,
            label: el.label,
            type: el.type
          }))} />

      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onDelete(meta.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">

          <Trash2 className="w-4 h-4" />
          Delete {config.type}
        </button>
      </div>
    </div>);

};

export default MetaPropertiesPanel;