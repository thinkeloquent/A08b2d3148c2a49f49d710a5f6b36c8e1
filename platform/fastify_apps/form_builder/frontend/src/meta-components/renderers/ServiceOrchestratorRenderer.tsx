import { ServiceMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const ServiceOrchestratorRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const serviceMeta = meta as ServiceMetaComponent;
  const spec = serviceMeta.serviceSpec;

  const bindingCount = spec?.bindings?.length ?? 0;
  const targetCount = serviceMeta.targetElementIds?.length ?? 0;

  // Group bindings by trigger type
  const triggerCounts = spec?.bindings?.reduce((acc, binding) => {
    const trigger = binding.refreshTrigger ?? 'manual';
    acc[trigger] = (acc[trigger] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return (
    <div
      className={`meta-component-box service-orchestrator ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#0ea5e9', // Sky blue for services
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        SERVICE ORCHESTRATOR
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{serviceMeta.name}</span>
      </div>

      {/* Service bindings */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {spec?.bindings?.slice(0, 3).map((binding) => (
          <div
            key={binding.id}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #7dd3fc',
            }}
          >
            {binding.serviceId}:{binding.operation}
          </div>
        ))}
        {bindingCount > 3 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#f0f9ff',
              color: '#0284c7',
            }}
          >
            +{bindingCount - 3} more
          </div>
        )}
      </div>

      {/* Trigger summary */}
      {Object.keys(triggerCounts).length > 0 && (
        <div
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#f0f9ff',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(triggerCounts).map(([trigger, count]) => (
            <span key={trigger} style={{ color: '#0369a1' }}>
              <span style={{ fontWeight: 500 }}>{trigger}:</span> {count}
            </span>
          ))}
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
        <span>{bindingCount} binding{bindingCount !== 1 ? 's' : ''}</span>
        <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
