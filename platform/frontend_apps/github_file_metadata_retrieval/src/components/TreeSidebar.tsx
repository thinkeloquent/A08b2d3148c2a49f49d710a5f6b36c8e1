import { useState } from 'react';
import type { TreeNode as TreeNodeType } from '@/types';
import { ChevronRight, FileIcon } from '@/components/icons';

interface TreeNodeProps {
  name: string;
  node: TreeNodeType;
  depth: number;
  currentPath: string[];
  onNavigate: (path: string[]) => void;
}

function TreeNodeItem({ name, node, depth, currentPath, onNavigate }: TreeNodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.type === 'dir';
  const isActive = currentPath.includes(name);

  return (
    <div>
      <div
        onClick={() => { if (isDir) setOpen(o => !o); }}
        className={`flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer group select-none mx-1.5 transition-colors ${
          isActive && isDir ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <span className="text-slate-400 transition-transform inline-flex" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
            <ChevronRight size={9} />
          </span>
        ) : <span className="w-[9px]" />}
        <FileIcon type={node.type} lang={node.type === 'file' ? node.lang : undefined} />
        <span
          className={`text-[12.5px] ml-1 truncate transition-colors ${
            isActive && isDir ? 'text-indigo-700 font-medium' : 'text-slate-600 group-hover:text-slate-800'
          }`}
        >
          {name}{isDir ? '/' : ''}
        </span>
      </div>
      {isDir && open && node.items && Object.entries(node.items).map(([k, v]) => (
        <TreeNodeItem key={k} name={k} node={v} depth={depth + 1} currentPath={currentPath} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

interface TreeSidebarProps {
  tree: Record<string, TreeNodeType>;
  currentPath: string[];
  onNavigate: (path: string[]) => void;
}

export function TreeSidebar({ tree, currentPath, onNavigate }: TreeSidebarProps) {
  return (
    <div className="w-[230px] min-w-[230px] bg-white border-r border-slate-200 overflow-y-auto py-3">
      <div className="px-4 pb-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Files</div>
      {Object.entries(tree).map(([k, v]) => (
        <TreeNodeItem key={k} name={k} node={v} depth={0} currentPath={currentPath} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
