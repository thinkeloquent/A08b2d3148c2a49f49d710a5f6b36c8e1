import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { useFormBuilder } from '../context/FormBuilderContext';
import { getNonVisualMetaComponents, getMetaComponentByMetaType } from '../meta-components';
import { MetaComponentGroup, DraggableMetaComponentConfig } from '../meta-components/types';
import { MetaComponent } from '../types';

interface MetaAttachmentPanelProps {
  elementId: string;
}

// Group configuration for display
const groupConfig: Record<MetaComponentGroup, { label: string; color: string }> = {
  builders: { label: 'Builders', color: '#8b5cf6' },
  behavior: { label: 'Behavior', color: '#3b82f6' },
  config: { label: 'Config', color: '#10b981' },
  layout: { label: 'Layout', color: '#6366f1' },
};

const MetaAttachmentPanel = ({ elementId }: MetaAttachmentPanelProps) => {
  const {
    getAttachedMetas,
    attachMetaToElement,
    detachMetaFromElement,
    openMetaOverlay,
  } = useFormBuilder();

  const [expandedGroups, setExpandedGroups] = useState<Set<MetaComponentGroup>>(
    new Set(['behavior', 'config', 'builders'])
  );

  const attachedMetas = getAttachedMetas(elementId);
  const nonVisualMetas = getNonVisualMetaComponents();

  // Group non-visual metas by their group
  const metasByGroup = nonVisualMetas.reduce((acc, meta) => {
    if (!acc[meta.group]) {
      acc[meta.group] = [];
    }
    acc[meta.group].push(meta);
    return acc;
  }, {} as Record<MetaComponentGroup, DraggableMetaComponentConfig[]>);

  const toggleGroup = (group: MetaComponentGroup) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const isMetaAttached = (metaType: string): MetaComponent | undefined => {
    return attachedMetas.find((m) => m.type === metaType);
  };

  const handleToggleMeta = (config: DraggableMetaComponentConfig) => {
    const existing = isMetaAttached(config.metaType);
    if (existing) {
      detachMetaFromElement(elementId, existing.id);
    } else {
      attachMetaToElement(elementId, config.metaType);
    }
  };

  const handleEditMeta = (metaId: string) => {
    openMetaOverlay(metaId);
  };

  // Order of groups to display
  const groupOrder: MetaComponentGroup[] = ['behavior', 'config', 'builders'];

  return (
    <div className="space-y-3">
      {/* Summary of attached metas - shown at top */}
      {attachedMetas.length > 0 && (
        <div className="pb-2 border-b border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Attached ({attachedMetas.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {attachedMetas.map((meta) => {
              const config = getMetaComponentByMetaType(meta.type);
              if (!config) return null;
              return (
                <button
                  key={meta.id}
                  type="button"
                  onClick={() => handleEditMeta(meta.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  <config.icon className="w-3 h-3" />
                  {meta.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Attach behaviors, validations, and configurations to this element.
      </p>

      {groupOrder.map((group) => {
        const metas = metasByGroup[group];
        if (!metas || metas.length === 0) return null;

        const isExpanded = expandedGroups.has(group);
        const { label, color } = groupConfig[group];

        return (
          <div key={group} className="border border-gray-200 rounded-md overflow-hidden">
            {/* Group Header */}
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color }}
              >
                {label}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {attachedMetas.filter((m) => {
                  const cfg = getMetaComponentByMetaType(m.type);
                  return cfg?.group === group;
                }).length} / {metas.length}
              </span>
            </button>

            {/* Group Content */}
            {isExpanded && (
              <div className="p-2 space-y-1">
                {metas.map((config) => {
                  const attached = isMetaAttached(config.metaType);
                  const Icon = config.icon;

                  return (
                    <div
                      key={config.metaType}
                      className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                        attached
                          ? 'bg-purple-50 border border-purple-200'
                          : 'bg-white border border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleMeta(config)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          attached
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                        title={attached ? 'Remove' : 'Add'}
                      >
                        {attached ? (
                          <X className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                      </button>

                      {/* Icon */}
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: config.color || '#6b7280' }}
                      />

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 truncate block">
                          {config.type}
                        </span>
                      </div>

                      {/* Edit button (if attached) */}
                      {attached && (
                        <button
                          type="button"
                          onClick={() => handleEditMeta(attached.id)}
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
};

export default MetaAttachmentPanel;
