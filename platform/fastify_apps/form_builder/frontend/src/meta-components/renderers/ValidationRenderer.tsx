import { ValidationMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const ValidationRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const validation = meta as ValidationMetaComponent;

  return (
    <div
      className={`meta-component-box meta-validation ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="meta-component-label">
        {validation.name}
      </div>
    </div>
  );
};
