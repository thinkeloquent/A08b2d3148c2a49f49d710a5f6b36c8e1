import { GroupingMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const GroupingRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const grouping = meta as GroupingMetaComponent;

  if (!grouping.visible) return null;

  return (
    <div
      className={`meta-component-box ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="meta-component-label">
        {grouping.label}
        <span className="meta-component-count">
          ({grouping.memberElementIds.length})
        </span>
      </div>
      {isSelected && (
        <div className="meta-resize-handle" />
      )}
    </div>
  );
};
