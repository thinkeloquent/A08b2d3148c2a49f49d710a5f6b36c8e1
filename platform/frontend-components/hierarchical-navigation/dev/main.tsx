import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { HierarchicalNavigation } from '../src';
import type { NavigationNode } from '../src';
import type { ReactNode } from 'react';

const FolderIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
const HomeIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const SettingsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const StarIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const UserIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const BellIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const GridIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>;
const FileIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>;

const SAMPLE_DATA: NavigationNode = {
  id: 'root',
  title: 'Main Menu',
  icon: HomeIcon,
  children: [
    {
      id: 'workspace',
      title: 'Workspace',
      icon: FolderIcon,
      children: [
        {
          id: 'projects',
          title: 'Projects',
          icon: GridIcon,
          children: [
            {
              id: 'project-a',
              title: 'Project Alpha',
              icon: StarIcon,
              children: [
                {
                  id: 'sprint-1',
                  title: 'Sprint 1',
                  icon: GridIcon,
                  children: [
                    { id: 'task-1', title: 'Setup CI/CD', icon: FileIcon },
                    { id: 'task-2', title: 'Auth Module', icon: FileIcon },
                    { id: 'task-3', title: 'DB Schema', icon: FileIcon },
                  ],
                },
                {
                  id: 'sprint-2',
                  title: 'Sprint 2',
                  icon: GridIcon,
                  children: [
                    { id: 'task-4', title: 'API Routes', icon: FileIcon },
                    { id: 'task-5', title: 'Dashboard UI', icon: FileIcon },
                  ],
                },
              ],
            },
            { id: 'project-b', title: 'Project Beta', icon: StarIcon },
            { id: 'project-c', title: 'Project Gamma', icon: StarIcon },
          ],
        },
        {
          id: 'files',
          title: 'Files',
          icon: FolderIcon,
          children: [
            { id: 'documents', title: 'Documents', icon: FileIcon },
            { id: 'images', title: 'Images', icon: FileIcon },
            { id: 'archives', title: 'Archives', icon: FileIcon },
          ],
        },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: SettingsIcon,
      children: [
        { id: 'profile', title: 'Profile', icon: UserIcon },
        { id: 'notifications', title: 'Notifications', icon: BellIcon },
        { id: 'preferences', title: 'Preferences', icon: SettingsIcon },
      ],
    },
  ],
};

function LeafContent(node: NavigationNode, path: string[]): ReactNode {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        {node.icon && (
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{node.icon}</div>
        )}
        <div>
          <div className="text-sm font-semibold text-slate-800">{node.title}</div>
          <div className="text-xs text-slate-500">{path.join(' / ')}</div>
        </div>
      </div>
      <div className="text-xs text-slate-400 px-1">
        Leaf node — render any content here: file previews, forms, detail cards, etc.
      </div>
    </div>
  );
}

function App() {
  const [maxOpenPanels, setMaxOpenPanels] = useState<number | undefined>(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <HierarchicalNavigation
        data={SAMPLE_DATA}
        title="Navigation"
        className="min-w-80 w-fit h-screen"
        onPathChange={(path) => console.log('Path:', path)}
        onSelect={(node, path) => console.log('Selected:', node.title, path)}
        onViewModeChange={(mode) => console.log('View mode:', mode)}
        renderLeafContent={LeafContent}
        maxOpenPanels={maxOpenPanels}
      />
      <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-3 flex items-center space-x-3 z-50">
        <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
          Max Panels
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={maxOpenPanels ?? ''}
          placeholder="∞"
          onChange={(e) => {
            const v = e.target.value;
            setMaxOpenPanels(v === '' ? undefined : Math.max(1, parseInt(v, 10) || 1));
          }}
          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
