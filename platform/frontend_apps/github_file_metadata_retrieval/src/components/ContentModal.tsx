import { useEffect, useRef } from 'react';
import { formatSize } from '@/utils/format';

interface ContentModalProps {
  name: string;
  content: string;
  size: number;
  lang: string;
  onClose: () => void;
}

export function ContentModal({ name, content, size, lang, onClose }: ContentModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const lines = content.split('\n');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{ width: 'min(90vw, 960px)', height: 'min(85vh, 720px)' }}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-slate-800">{name}</span>
            <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono">{lang}</span>
            <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-mono">{formatSize(size)}</span>
            <span className="text-[11px] text-slate-400">{lines.length.toLocaleString()} lines</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1 transition-colors">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <table className="w-full text-[12.5px] font-mono leading-[1.6]">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-indigo-50/40">
                  <td className="text-right text-slate-300 select-none px-3 py-0 align-top whitespace-nowrap border-r border-slate-200 bg-white w-1">
                    {i + 1}
                  </td>
                  <td className="px-4 py-0 whitespace-pre text-slate-700 overflow-x-auto">
                    {line || '\u00A0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
