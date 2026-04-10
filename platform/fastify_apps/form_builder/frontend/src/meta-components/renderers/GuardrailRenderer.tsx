import { ValidationMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const GuardrailRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const validation = meta as ValidationMetaComponent;

  // Get guardrails from V2 format or legacy format
  const guardrails = validation.guardrails ?? [];
  const hasLegacyRule = !!validation.rule;
  const ruleCount = guardrails.length || (hasLegacyRule ? 1 : 0);
  const targetCount = validation.targetElementIds?.length ?? 0;

  // Count by level
  const levelCounts = guardrails.reduce((acc, g) => {
    acc[g.level] = (acc[g.level] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className={`meta-component-box guardrail ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#10b981', // Emerald for config
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div
        className="meta-component-header"
        style={{
          background: '#10b981',
          color: 'white',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        GUARDRAIL
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{validation.name}</span>
      </div>

      {/* Rule indicators */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {guardrails.slice(0, 3).map((rule) => (
          <div
            key={rule.id}
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: rule.level === 'error' ? '#fef2f2' :
                         rule.level === 'warning' ? '#fffbeb' : '#f0fdf4',
              color: rule.level === 'error' ? '#991b1b' :
                     rule.level === 'warning' ? '#92400e' : '#166534',
              border: `1px solid ${
                rule.level === 'error' ? '#fca5a5' :
                rule.level === 'warning' ? '#fcd34d' : '#86efac'
              }`,
            }}
          >
            {rule.label}
          </div>
        ))}
        {guardrails.length > 3 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#f3f4f6',
              color: '#6b7280',
            }}
          >
            +{guardrails.length - 3} more
          </div>
        )}
        {hasLegacyRule && guardrails.length === 0 && (
          <div
            style={{
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '4px',
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fca5a5',
            }}
          >
            {validation.rule?.ruleType ?? 'rule'}
          </div>
        )}
      </div>

      {/* Level summary */}
      {Object.keys(levelCounts).length > 0 && (
        <div
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: '#f0fdf4',
            display: 'flex',
            gap: '8px',
          }}
        >
          {levelCounts.error && (
            <span style={{ color: '#991b1b' }}>
              <span style={{ fontWeight: 500 }}>Errors:</span> {levelCounts.error}
            </span>
          )}
          {levelCounts.warning && (
            <span style={{ color: '#92400e' }}>
              <span style={{ fontWeight: 500 }}>Warnings:</span> {levelCounts.warning}
            </span>
          )}
          {levelCounts.info && (
            <span style={{ color: '#166534' }}>
              <span style={{ fontWeight: 500 }}>Info:</span> {levelCounts.info}
            </span>
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
        <span>{ruleCount} rule{ruleCount !== 1 ? 's' : ''}</span>
        <span>{targetCount} target{targetCount !== 1 ? 's' : ''}</span>
      </div>

      {isSelected && <div className="meta-resize-handle" />}
    </div>
  );
};
