import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Loader2, AlertCircle, FolderTree } from 'lucide-react';
import { listFilterTrees, type FilterTreeRecord } from '@/services/api/filter-trees';

interface SidebarProps {
  selectedTreeId: string | null;
  onSelectTree: (id: string) => void;
  onNewTree: () => void;
}

function SidebarComponent({ selectedTreeId, onSelectTree, onNewTree }: SidebarProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['filter-trees'],
    queryFn: () => listFilterTrees({ limit: 100 })
  });

  const trees = data?.data ?? [];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white/60 backdrop-blur-sm border-r border-slate-200">
      {/* Sidebar header */}
      <div className="p-4 border-b border-slate-200" data-test-id="div-36f2e6a8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Saved Trees
          </h2>
        </div>
        <button
          onClick={onNewTree}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors">

          <Plus className="w-4 h-4" />
          New Tree
        </button>
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto p-2" data-test-id="div-f6462440">
        {isLoading &&
        <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        }

        {isError &&
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error instanceof Error ? error.message : 'Failed to load'}</span>
          </div>
        }

        {!isLoading && !isError && trees.length === 0 &&
        <div className="text-center py-8 text-slate-400 text-sm">
            <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No saved trees yet</p>
          </div>
        }

        {trees.map((tree: FilterTreeRecord) =>
        <button
          key={tree.id}
          onClick={() => onSelectTree(tree.id)}
          className={`
              w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-all
              ${selectedTreeId === tree.id ?
          'bg-sky-100 text-sky-800 border border-sky-200 font-medium' :
          'text-slate-600 hover:bg-slate-100 border border-transparent'}
            `
          }>

            <div className="truncate font-medium">{tree.name}</div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">
              {new Date(tree.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            </div>
          </button>
        )}
      </div>
    </aside>);

}

export const Sidebar = memo(SidebarComponent);