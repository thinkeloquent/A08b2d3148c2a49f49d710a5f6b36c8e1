import { CompositeMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const CompositeRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const composite = meta as CompositeMetaComponent;

  // Count bindings
  const bindingCount = Object.keys(composite.dataBindings || {}).length;
  const blueprintCount = composite.blueprintRefs?.length || 0;

  return (
    <div
      className={`meta-component-box composite ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#7c3aed', // Deeper purple for composite
        borderStyle: 'double',
        borderWidth: '3px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        COMPOSITE
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{composite.name}</span>
        <span
          className="meta-component-id"
          style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}
        >
          {composite.compositeId}
        </span>
      </div>

      {/* Blueprint References */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {composite.blueprintRefs?.map((ref, index) => (
          <div
            key={index}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#f3e8ff',
              color: '#6d28d9',
              border: '1px solid #c4b5fd',
            }}
          >
            {ref}
          </div>
        ))}
      </div>

      {/* Status indicators */}
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
        <span>{blueprintCount} blueprints</span>
        <span>{bindingCount} bindings</span>
        {composite.isLocked && (
          <span
            style={{
              padding: '1px 4px',
              background: '#fef3c7',
              color: '#92400e',
              borderRadius: '2px',
              fontSize: '9px',
            }}
          >
            LOCKED
          </span>
        )}
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
