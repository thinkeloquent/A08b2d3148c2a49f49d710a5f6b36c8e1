import { useState } from 'react';
import type { BaseBlockProps } from '../../src';

export const PropertiesDrawer = (_props: BaseBlockProps) => {
  const [toggles, setToggles] = useState({ autoLayout: true, snapGrid: true, showGuides: false, darkMode: false });
  return (
    <>
      {[
        { section: 'Layout', items: ['Display', 'Direction', 'Gap', 'Padding'] },
        { section: 'Typography', items: ['Font Size', 'Weight', 'Line Height'] },
        { section: 'Appearance', items: ['Background', 'Border Radius', 'Shadow', 'Opacity'] },
      ].map((g) => (
        <details key={g.section} open className="mb-3 group">
          <summary className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none list-none">
            {g.section}
          </summary>
          <div className="pl-2 pr-1 pb-2 space-y-3">
            {g.items.map((item) => (
              <div key={item}>
                <label className="text-[11px] text-gray-500 mb-1 block">{item}</label>
                <div className="h-6 bg-gray-50 rounded-lg border border-gray-200" />
              </div>
            ))}
          </div>
        </details>
      ))}
      <div className="mt-4 border-t border-gray-100 pt-4 space-y-3 px-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Toggles</p>
        {(['autoLayout', 'snapGrid', 'showGuides', 'darkMode'] as const).map((k) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
            <button
              onClick={() => setToggles((p) => ({ ...p, [k]: !p[k] }))}
              className="relative w-9 h-5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: toggles[k] ? '#3B82F6' : '#D1D5DB' }}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${toggles[k] ? 'translate-x-4' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
