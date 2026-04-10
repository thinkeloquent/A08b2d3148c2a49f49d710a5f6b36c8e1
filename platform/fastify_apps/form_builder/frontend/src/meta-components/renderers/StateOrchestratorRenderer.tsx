import { StateMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const StateOrchestratorRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const stateMeta = meta as StateMetaComponent;
  const spec = stateMeta.stateSpec;

  const stateCount = spec?.states?.length ?? 0;
  const transitionCount = spec?.transitions?.length ?? 0;
  const currentState = spec?.currentState ?? spec?.initialState ?? 'none';
  const targetCount = stateMeta.targetElementIds?.length ?? 0;

  // Find current state info
  const currentStateInfo = spec?.states?.find(s => s.id === currentState);

  return (
    <div
      className={`meta-component-box state-orchestrator ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#6366f1', // Indigo for state management
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        STATE ORCHESTRATOR
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{stateMeta.name}</span>
        {spec?.stateMachineId && (
          <span
            className="meta-component-id"
            style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}
          >
            {spec.stateMachineId}
          </span>
        )}
      </div>

      {/* State visualization */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {spec?.states?.slice(0, 4).map((state) => {
          const isInitial = state.stateType === 'initial';
          const isFinal = state.stateType === 'final';
          const isCurrent = state.id === currentState;

          return (
            <div
              key={state.id}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                borderRadius: '4px',
                background: isCurrent ? '#c7d2fe' : isInitial ? '#dcfce7' : isFinal ? '#fef2f2' : '#f3f4f6',
                color: isCurrent ? '#3730a3' : isInitial ? '#166534' : isFinal ? '#991b1b' : '#374151',
                border: `1px solid ${isCurrent ? '#818cf8' : isInitial ? '#86efac' : isFinal ? '#fca5a5' : '#e5e7eb'}`,
                fontWeight: isCurrent ? 600 : 400,
              }}
            >
              {state.name}
              {isInitial && ' ●'}
              {isFinal && ' ◎'}
            </div>
          );
        })}
        {stateCount > 4 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#f3f4f6',
              color: '#6b7280',
            }}
          >
            +{stateCount - 4} more
          </div>
        )}
      </div>

      {/* Current state indicator */}
      {currentStateInfo && (
        <div
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#eef2ff',
            color: '#4338ca',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontWeight: 500 }}>Current:</span>
          <span>{currentStateInfo.name}</span>
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
        <span>{stateCount} states</span>
        <span>{transitionCount} transitions</span>
        <span>{targetCount} targets</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
