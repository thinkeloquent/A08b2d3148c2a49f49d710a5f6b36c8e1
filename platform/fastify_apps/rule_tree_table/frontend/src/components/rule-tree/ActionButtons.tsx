import { Plus, FolderPlus, Group, Copy, Trash2, MoreVertical } from 'lucide-react';

interface ActionButtonsProps {
  isContainer: boolean;
  showActions: boolean;
  onAddCondition?: () => void;
  onAddGroup?: () => void;
  onAddFolder?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ActionButtons({
  isContainer,
  showActions,
  onAddCondition,
  onAddGroup,
  onAddFolder,
  onDuplicate,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div
      className={`flex items-center gap-0.5 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}
    >
      {isContainer && (
        <>
          <button
            onClick={onAddCondition}
            className="p-1.5 hover:bg-accent-50 text-accent-500 rounded-md transition-colors"
            title="Add Condition"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onAddGroup}
            className="p-1.5 hover:bg-emerald-50 text-emerald-500 rounded-md transition-colors"
            title="Add Group"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={onAddFolder}
            className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-md transition-colors"
            title="Add Folder"
          >
            <Group className="w-4 h-4" />
          </button>
        </>
      )}
      <button
        onClick={onDuplicate}
        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
        title="More Options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
