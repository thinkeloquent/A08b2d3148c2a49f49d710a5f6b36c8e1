import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Layout } from 'lucide-react';
import DraggableFormElement from './DraggableFormElement';
import DraggableMetaElement from './DraggableMetaElement';
import { draggableComponents } from '../draggable-components';
import { getVisualMetaComponents } from '../meta-components';

type SidebarTab = 'components' | 'declarative';
type MetaGroup = 'layout';

// Group configuration - only visual meta groups (non-visual are in Behaviors tab)
const META_GROUPS: Record<MetaGroup, { label: string; icon: typeof Layout; color: string }> = {
  layout: { label: 'Layout', icon: Layout, color: '#a855f7' },
};

interface SidebarProps {
  onDragStart?: (type: string, source: 'sidebar' | 'canvas', category?: 'element' | 'meta') => void;
  onDragEnd?: () => void;
}

const Sidebar = ({ onDragStart, onDragEnd }: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('components');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<MetaGroup, boolean>>({
    layout: true,
  });

  // Only show visual meta-components in sidebar (non-visual are in Behaviors tab)
  const visualMetaComponents = getVisualMetaComponents();

  const filteredComponents = draggableComponents.filter(
    (component) =>
      component.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMetaComponents = visualMetaComponents.filter(
    (component) =>
      component.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group meta components by their group (only visual groups)
  const groupedMetaComponents = useMemo(() => {
    const groups: Record<MetaGroup, typeof visualMetaComponents> = {
      layout: [],
    };
    filteredMetaComponents.forEach((component) => {
      const group = component.group as MetaGroup;
      if (groups[group]) {
        groups[group].push(component);
      }
    });
    return groups;
  }, [filteredMetaComponents]);

  const toggleGroup = (group: MetaGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'components'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'declarative'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('declarative')}
        >
          Declarative
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder={`Search ${activeTab === 'components' ? 'components' : 'declarative items'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'components' ? (
          <div className="space-y-2">
            {filteredComponents.map((component) => (
              <DraggableFormElement
                key={component.type}
                type={component.type}
                description={component.description}
                icon={<component.icon className="w-5 h-5 text-gray-500" />}
                onDragStart={(type) => onDragStart?.(type, 'sidebar', 'element')}
                onDragEnd={onDragEnd}
              />
            ))}
            {filteredComponents.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No components match your search
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(['layout'] as MetaGroup[]).map((groupKey) => {
              const group = META_GROUPS[groupKey];
              const components = groupedMetaComponents[groupKey];
              const isExpanded = expandedGroups[groupKey];
              const GroupIcon = group.icon;

              if (components.length === 0) return null;

              return (
                <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <GroupIcon className="w-4 h-4" style={{ color: group.color }} />
                    <span className="font-medium text-sm text-gray-700">{group.label}</span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${group.color}20`, color: group.color }}
                    >
                      {components.length}
                    </span>
                  </button>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="p-2 space-y-1">
                      {components.map((component) => (
                        <DraggableMetaElement
                          key={component.type}
                          type={component.type}
                          description={component.description}
                          icon={
                            <component.icon
                              className="w-5 h-5"
                              style={{ color: component.color || group.color }}
                            />
                          }
                          color={component.color}
                          isNew={component.isNew}
                          onDragStart={(type) => onDragStart?.(type, 'sidebar', 'meta')}
                          onDragEnd={onDragEnd}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredMetaComponents.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No declarative items match your search
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
