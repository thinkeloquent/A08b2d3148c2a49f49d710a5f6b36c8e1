import { StaticConfigMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const StaticConfigRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const config = meta as StaticConfigMetaComponent;

  const valueCount = Object.keys(config.configValues ?? {}).length;
  const targetCount = config.targetElementIds?.length ?? 0;
  const hasSchema = !!config.schemaRef || !!config.inlineSchema;

  return (
    <div
      className={`meta-component-box static-config ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#14b8a6', // Teal for static config
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        STATIC CONFIG
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{config.name}</span>
      </div>

      {/* Schema indicator */}
      {hasSchema && (
        <div style={{ padding: '0 8px 4px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#ccfbf1',
              color: '#0d9488',
              border: '1px solid #5eead4',
            }}
          >
            {config.schemaRef ? `Schema: ${config.schemaRef}` : 'Inline Schema'}
          </div>
        </div>
      )}

      {/* Config values preview */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {Object.entries(config.configValues ?? {}).slice(0, 4).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: '2px 6px',
              fontSize: '9px',
              borderRadius: '4px',
              background: '#f0fdfa',
              color: '#115e59',
              border: '1px solid #99f6e4',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontWeight: 500 }}>{key}:</span>{' '}
            {typeof value === 'object' ? '{...}' : String(value)}
          </div>
        ))}
        {valueCount > 4 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '9px',
              borderRadius: '4px',
              background: '#f3f4f6',
              color: '#6b7280',
            }}
          >
            +{valueCount - 4} more
          </div>
        )}
      </div>

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
        <span>{valueCount} value{valueCount !== 1 ? 's' : ''}</span>
        <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
