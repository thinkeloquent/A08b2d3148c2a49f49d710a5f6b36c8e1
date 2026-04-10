import { BlueprintMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const BlueprintRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const blueprint = meta as BlueprintMetaComponent;

  // Count total assigned elements
  const totalAssigned = Object.values(blueprint.slotAssignments || {}).reduce(
    (sum, ids) => sum + ids.length,
    0
  );

  // Count required slots that are filled
  const requiredSlots = blueprint.slots?.filter(s => s.required) || [];
  const filledRequiredSlots = requiredSlots.filter(
    slot => (blueprint.slotAssignments?.[slot.id]?.length || 0) > 0
  );

  return (
    <div
      className={`meta-component-box blueprint ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        borderColor: '#8b5cf6', // Purple for layout
        borderStyle: 'solid',
        borderWidth: '2px',
      }}
    >
      <div className="meta-component-header" style={{ background: '#8b5cf6', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}>
        BLUEPRINT
      </div>
      <div className="meta-component-label" style={{ padding: '8px' }}>
        <span style={{ fontWeight: 500 }}>{blueprint.name}</span>
        <span className="meta-component-id" style={{ fontSize: '10px', color: '#666', marginLeft: '8px' }}>
          {blueprint.blueprintId}
        </span>
      </div>

      {/* Slot indicators */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {blueprint.slots?.map(slot => {
          const assigned = blueprint.slotAssignments?.[slot.id]?.length || 0;
          const isFilled = assigned > 0;
          const isRequired = slot.required;

          return (
            <div
              key={slot.id}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                borderRadius: '4px',
                background: isFilled ? '#dcfce7' : isRequired ? '#fef2f2' : '#f3f4f6',
                color: isFilled ? '#166534' : isRequired ? '#991b1b' : '#374151',
                border: `1px solid ${isFilled ? '#86efac' : isRequired ? '#fca5a5' : '#e5e7eb'}`,
              }}
            >
              {slot.name}: {assigned}/{slot.maxElements}
            </div>
          );
        })}
      </div>

      <div className="meta-component-count" style={{ padding: '4px 8px', fontSize: '10px', color: '#666', borderTop: '1px solid #e5e7eb' }}>
        {totalAssigned} elements | {filledRequiredSlots.length}/{requiredSlots.length} required slots
      </div>

      {isSelected && (
        <div className="meta-resize-handle" />
      )}
    </div>
  );
};
