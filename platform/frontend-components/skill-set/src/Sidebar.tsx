import type { SidebarProps } from './types';

export function Sidebar({
  brand,
  navItems,
  activeTab,
  onTabChange,
  installedCount,
  overviewStats,
  user,
  className = '',
}: SidebarProps) {
  const b = brand ?? { logoMark: 'S', title: 'SkillSet', subtitle: 'Agent Skill Registry' };

  return (
    <aside
      className={`flex w-[220px] min-w-[220px] flex-col border-r border-[var(--border)] bg-[var(--surface)] ${className}`}
    >
      {/* Branding */}
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">
          {b.logoMark}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text-1)]">{b.title}</div>
          <div className="text-[10px] text-[var(--text-3)]">{b.subtitle}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-3">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-[var(--accent-lt)] text-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-2)] hover:bg-gray-50'
              }`}
            >
              {item.icon && (
                <span className={active ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}>
                  {item.icon}
                </span>
              )}
              {item.label}
              {item.id === 'toolbelt' && (
                <span className="ml-auto rounded-full bg-[var(--accent)] px-1.5 py-px text-[10px] font-bold text-white">
                  {installedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Overview Stats */}
      {overviewStats && overviewStats.length > 0 && (
        <div className="mx-3 mt-1 rounded-lg border border-[var(--border)] p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
            Overview
          </div>
          {overviewStats.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-[var(--text-3)]">{s.label}</span>
              <span className="text-[12px] font-semibold text-[var(--text-1)]">{s.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User footer */}
      {user && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-lt)] text-[10px] font-bold text-[var(--accent)]">
            {user.initials}
          </div>
          <div>
            <div className="text-[12px] font-medium text-[var(--text-1)]">{user.name}</div>
            <div className="text-[10px] text-[var(--text-3)]">{user.plan}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
