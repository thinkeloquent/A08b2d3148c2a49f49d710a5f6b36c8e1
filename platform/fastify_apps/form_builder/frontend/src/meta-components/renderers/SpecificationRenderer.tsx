import { SpecificationMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const SpecificationRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const spec = meta as SpecificationMetaComponent;

  const eventCount = spec.telemetry?.events?.length ?? 0;
  const targetCount = spec.targetElementIds?.length ?? 0;
  const hasTelemetry = !!spec.telemetry?.category || eventCount > 0;

  return (
    <div
      className={`meta-component-box specification ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#059669', // Emerald-600 for specification
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        SPECIFICATION
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{spec.name}</span>
      </div>

      {/* Spec ID and Version */}
      <div style={{ padding: '0 8px 4px', display: 'flex', gap: '8px' }}>
        {spec.specId && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#d1fae5',
              color: '#065f46',
              border: '1px solid #6ee7b7',
            }}
          >
            {spec.specId}
          </div>
        )}
        {spec.specVersion && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
            }}
          >
            v{spec.specVersion}
          </div>
        )}
      </div>

      {/* Telemetry info */}
      {hasTelemetry && (
        <div
          style={{
            padding: '4px 8px',
            margin: '0 8px 8px',
            fontSize: '10px',
            background: '#f0fdf4',
            borderRadius: '4px',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ color: '#166534', fontWeight: 500, marginBottom: '2px' }}>
            Telemetry
          </div>
          <div style={{ display: 'flex', gap: '8px', color: '#15803d' }}>
            {spec.telemetry?.category && (
              <span>Category: {spec.telemetry.category}</span>
            )}
            {eventCount > 0 && (
              <span>{eventCount} event{eventCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}

      {/* Event preview */}
      {eventCount > 0 && (
        <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {spec.telemetry?.events?.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              style={{
                padding: '2px 6px',
                fontSize: '9px',
                borderRadius: '4px',
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
              }}
            >
              {event.eventName}
              <span style={{ color: '#6b7280', marginLeft: '4px' }}>
                @{event.trigger}
              </span>
            </div>
          ))}
          {eventCount > 3 && (
            <div
              style={{
                padding: '2px 6px',
                fontSize: '9px',
                borderRadius: '4px',
                background: '#f3f4f6',
                color: '#6b7280',
              }}
            >
              +{eventCount - 3} more
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
        <span>{eventCount} event{eventCount !== 1 ? 's' : ''}</span>
        <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
