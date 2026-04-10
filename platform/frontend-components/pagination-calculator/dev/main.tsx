import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import './styles.css';
import { PaginationCalculator } from '../src';

const layersIcon = (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

function Demo() {
  const [offset, setOffset] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-[DM_Sans]">
      <h1 className="text-lg font-bold text-slate-700 mb-6">PaginationCalculator — Dev</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Compact — left panel style */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Left Panel (w-64)</span>
          <div className="w-64">
            <PaginationCalculator
              total={247}
              offset={offset}
              pageSize={25}
              icon={layersIcon}
              onOffsetChange={setOffset}
            />
          </div>
        </div>

        {/* Large dataset */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Large Dataset</span>
          <div className="w-64">
            <PaginationCalculator
              total={12450}
              pageSize={100}
              title="Results"
            />
          </div>
        </div>

        {/* Small / single page */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Single Page</span>
          <div className="w-64">
            <PaginationCalculator total={10} pageSize={25} />
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Demo />);
