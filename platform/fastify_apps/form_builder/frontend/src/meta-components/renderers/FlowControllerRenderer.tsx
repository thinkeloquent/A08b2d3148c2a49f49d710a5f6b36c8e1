import { ConditionalMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const FlowControllerRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const flow = meta as ConditionalMetaComponent;

  // Get condition count from flowSpec or legacy format
  const conditionCount = flow.flowSpec?.conditions?.length ?? (flow.condition ? 1 : 0);
  const targetCount = flow.targetElementIds?.length ?? 0;
  const defaultAction = flow.flowSpec?.defaultAction ?? flow.action ?? 'show';
  const combineMode = flow.flowSpec?.combineMode ?? 'and';

  return (
    <div
      className={`meta-component-box flow-controller ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#3b82f6', // Blue for behavior
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: '#3b82f6',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        FLOW CONTROLLER
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{flow.name}</span>
      </div>

      {/* Condition summary */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        <div
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            borderRadius: '4px',
            background: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #93c5fd',
          }}
        >
          {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
        </div>
        {conditionCount > 1 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#e0e7ff',
              color: '#3730a3',
              border: '1px solid #a5b4fc',
            }}
          >
            {combineMode.toUpperCase()}
          </div>
        )}
        <div
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            borderRadius: '4px',
            background: defaultAction === 'show' || defaultAction === 'enable' ? '#dcfce7' : '#fef2f2',
            color: defaultAction === 'show' || defaultAction === 'enable' ? '#166534' : '#991b1b',
            border: `1px solid ${defaultAction === 'show' || defaultAction === 'enable' ? '#86efac' : '#fca5a5'}`,
          }}
        >
          {defaultAction}
        </div>
      </div>

      <div
        className="meta-component-count"
        style={{
          padding: '4px 8px',
          fontSize: '10px',
          color: '#666',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        {targetCount} target element{targetCount !== 1 ? 's' : ''}
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
