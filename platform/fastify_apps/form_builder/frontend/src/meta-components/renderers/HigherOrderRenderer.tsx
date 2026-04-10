import { HigherOrderMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const HigherOrderRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const hoMeta = meta as HigherOrderMetaComponent;
  const spec = hoMeta.behaviorSpec;

  const behaviorId = spec?.behaviorId ?? 'none';
  const paramCount = Object.keys(spec?.params ?? {}).length;
  const targetCount = hoMeta.targetElementIds?.length ?? 0;

  // Behavior type display
  const behaviorLabels: Record<string, { label: string; color: string }> = {
    'debounce': { label: 'Debounce', color: '#f59e0b' },
    'throttle': { label: 'Throttle', color: '#f97316' },
    'retry': { label: 'Retry', color: '#ef4444' },
    'cache': { label: 'Cache', color: '#22c55e' },
    'transform': { label: 'Transform', color: '#8b5cf6' },
    'validate': { label: 'Validate', color: '#06b6d4' },
    'log': { label: 'Log', color: '#6b7280' },
    'track': { label: 'Track', color: '#ec4899' },
  };

  const behaviorInfo = behaviorLabels[behaviorId] ?? { label: behaviorId, color: '#3b82f6' };

  return (
    <div
      className={`meta-component-box higher-order ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#2563eb', // Deep blue for higher-order
        borderStyle: 'dashed',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        HIGHER-ORDER
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{hoMeta.name}</span>
      </div>

      {/* Behavior badge */}
      <div style={{ padding: '0 8px 8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '4px',
            background: `${behaviorInfo.color}20`,
            color: behaviorInfo.color,
            border: `1px solid ${behaviorInfo.color}40`,
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: behaviorInfo.color
          }} />
          {behaviorInfo.label}
        </div>
      </div>

      {/* Parameters preview */}
      {paramCount > 0 && (
        <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {Object.entries(spec?.params ?? {}).slice(0, 3).map(([key, value]) => (
            <div
              key={key}
              style={{
                padding: '2px 6px',
                fontSize: '9px',
                borderRadius: '4px',
                background: '#f3f4f6',
                color: '#4b5563',
              }}
            >
              {key}: {String(value)}
            </div>
          ))}
          {paramCount > 3 && (
            <div
              style={{
                padding: '2px 6px',
                fontSize: '9px',
                borderRadius: '4px',
                background: '#f3f4f6',
                color: '#9ca3af',
              }}
            >
              +{paramCount - 3} more
            </div>
          )}
        </div>
      )}

      <div
        className="meta-component-count"
        style={{
          padding: '4px 8px',
          fontSize: '10px',
          color: '#666',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{paramCount} param{paramCount !== 1 ? 's' : ''}</span>
        <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
