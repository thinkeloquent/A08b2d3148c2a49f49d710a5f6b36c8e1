import { useState } from 'react';
import type { SkillSetProps } from './types';
import { Sidebar } from './Sidebar';
import { RegistryView } from './RegistryView';
import { ToolbeltView } from './ToolbeltView';
import { DocsView } from './DocsView';
import { GridIcon, BagIcon, BookIcon } from './icons';

const CSS_TOKENS = `
  :root {
    --bg:          #F5F6F8;
    --surface:     #FFFFFF;
    --border:      #E5E7EB;
    --border-md:   #D1D5DB;
    --text-1:      #111827;
    --text-2:      #4B5563;
    --text-3:      #9CA3AF;
    --accent:      #4F46E5;
    --accent-lt:   #EEF2FF;
    --accent-mid:  #C7D2FE;
    --accent-hover:#4338CA;
    --ok:          #059669;
    --ok-bg:       #ECFDF5;
    --warn:        #D97706;
    --warn-bg:     #FFFBEB;
    --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
  }
  .line2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const DEFAULT_NAV = [
  { id: 'registry', label: 'Registry', icon: <GridIcon size={16} /> },
  { id: 'toolbelt', label: 'Toolbelt', icon: <BagIcon size={16} /> },
  { id: 'docs', label: 'Docs', icon: <BookIcon size={16} /> },
];

export function SkillSet({
  skills,
  tagColors,
  navItems,
  brand,
  user,
  overviewStats,
  installedIds: controlledInstalled,
  onInstallToggle: controlledToggle,
  defaultTab = 'registry',
  cliCommands,
  schemaText,
  installCommandPrefix = 'skillset install',
  className = '',
}: SkillSetProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [internalInstalled, setInternalInstalled] = useState<Set<string | number>>(new Set());

  // Use controlled state if provided, otherwise internal
  const installedIds = controlledInstalled ?? internalInstalled;
  const handleToggle = controlledToggle ?? ((id: string | number) => {
    setInternalInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  });

  const nav = navItems ?? DEFAULT_NAV;

  return (
    <>
      <style>{CSS_TOKENS}</style>
      <div
        className={`flex h-screen w-screen overflow-hidden bg-[var(--bg)] font-sans text-[var(--text-1)] ${className}`}
      >
        <Sidebar
          brand={brand}
          navItems={nav}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          installedCount={installedIds.size}
          overviewStats={overviewStats}
          user={user}
        />

        {activeTab === 'registry' && (
          <RegistryView
            skills={skills}
            tagColors={tagColors}
            installedIds={installedIds}
            onInstallToggle={handleToggle}
            installCommandPrefix={installCommandPrefix}
          />
        )}

        {activeTab === 'toolbelt' && (
          <ToolbeltView
            skills={skills}
            installedIds={installedIds}
            onInstallToggle={handleToggle}
            tagColors={tagColors}
          />
        )}

        {activeTab === 'docs' && (
          <DocsView cliCommands={cliCommands} schemaText={schemaText} />
        )}
      </div>
    </>
  );
}
