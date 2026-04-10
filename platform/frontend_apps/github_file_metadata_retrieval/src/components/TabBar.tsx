export interface Tab {
  id: string;
  label: string;
  closable?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onTabClose?: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange, onTabClose }: TabBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-5 flex items-center gap-0 shrink-0">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'text-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {tab.closable && (
              <span
                onClick={(e) => { e.stopPropagation(); onTabClose?.(tab.id); }}
                className="ml-0.5 text-[11px] leading-none hover:text-red-400 transition-colors"
              >
                &times;
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}
