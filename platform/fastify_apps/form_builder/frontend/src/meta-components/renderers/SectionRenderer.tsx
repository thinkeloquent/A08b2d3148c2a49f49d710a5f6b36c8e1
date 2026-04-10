import { SectionMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const SectionRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const section = meta as SectionMetaComponent;

  return (
    <div
      className={`meta-component-box meta-section ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="meta-component-label">
        {section.title}
        <span className="meta-component-count">
          ({section.memberElementIds.length})
        </span>
      </div>
      {isSelected && (
        <div className="meta-resize-handle" />
      )}
    </div>
  );
};
