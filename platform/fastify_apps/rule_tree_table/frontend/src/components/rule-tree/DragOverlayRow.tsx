import {
  GripVertical,
  FolderOpen,
  Folder,
  Group,
  FileText,
} from 'lucide-react';
import type { RuleItem, RuleGroup, RuleFolder, RuleStructural, RuleCondition } from '../../types/rule.types';

interface DragOverlayRowProps {
  item: RuleItem;
}

export function DragOverlayRow({ item }: DragOverlayRowProps) {
  return (
    <table className="w-full bg-white shadow-card-hover rounded-xl border border-slate-200 opacity-80">
      <tbody>
        <tr className={item.type === 'group' ? 'bg-slate-50' : item.type === 'structural' ? 'bg-violet-50/30' : item.type === 'folder' ? 'bg-indigo-50/30' : 'bg-white'}>
          <td className="py-3 px-1 w-8">
            <GripVertical className="w-4 h-4 text-slate-300" />
          </td>
          <td className="py-3 px-2 w-12">
            {item.type === 'group' ? (
              (item as RuleGroup).expanded ? (
                <FolderOpen className="w-5 h-5 text-amber-500" />
              ) : (
                <Folder className="w-5 h-5 text-amber-500" />
              )
            ) : item.type === 'structural' ? (
              <FileText className="w-5 h-5 text-violet-500" />
            ) : item.type === 'folder' ? (
              <Group className="w-5 h-5 text-indigo-400" />
            ) : (
              <FileText className="w-5 h-5 text-slate-400" />
            )}
          </td>
          <td className="py-3 px-4">
            <span className="text-sm font-medium text-slate-700">
              {item.type === 'group'
                ? `${(item as RuleGroup).logic}: ${(item as RuleGroup).name}`
                : item.type === 'structural'
                  ? `${(item as RuleStructural).nodeType}: ${(item as RuleStructural).parentScope || (item as RuleStructural).name}`
                  : item.type === 'folder'
                    ? (item as RuleFolder).name
                    : `${(item as RuleCondition).field} ${(item as RuleCondition).operator} ${(item as RuleCondition).value}`}
            </span>
          </td>
          <td className="py-3 px-4 w-24">
            {item.enabled ? (
              <span className="pill bg-emerald-50 text-emerald-700">
                Active
              </span>
            ) : (
              <span className="pill bg-slate-100 text-slate-500">
                Disabled
              </span>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
