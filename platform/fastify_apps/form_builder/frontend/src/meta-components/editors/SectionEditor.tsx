import { SectionMetaComponent } from '../../types';
import { MetaComponentEditor } from '../types';

export const SectionEditor: MetaComponentEditor = ({
  meta,
  onUpdate,
  availableElements,
}) => {
  const section = meta as SectionMetaComponent;

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) =>
            onUpdate({ ...section, title: e.target.value })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="collapsible"
          checked={section.collapsible}
          onChange={(e) =>
            onUpdate({ ...section, collapsible: e.target.checked })
          }
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="collapsible" className="ml-2 block text-sm text-gray-700">
          Collapsible
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Order</label>
        <input
          type="number"
          value={section.order}
          onChange={(e) =>
            onUpdate({ ...section, order: parseInt(e.target.value, 10) || 0 })
          }
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Member Elements ({section.memberElementIds.length})
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
          {availableElements.map((el) => {
            const isMember = section.memberElementIds.includes(el.id);
            return (
              <label key={el.id} className="flex items-center gap-2 p-1">
                <input
                  type="checkbox"
                  checked={isMember}
                  onChange={(e) => {
                    const newMembers = e.target.checked
                      ? [...section.memberElementIds, el.id]
                      : section.memberElementIds.filter((id) => id !== el.id);
                    onUpdate({ ...section, memberElementIds: newMembers });
                  }}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {el.label} <span className="text-gray-400">({el.type})</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
