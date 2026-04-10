import { ConditionalMetaComponent } from '../../types';
import { MetaComponentRenderer } from '../types';

export const ConditionalRenderer: MetaComponentRenderer = ({
  meta,
  isSelected,
  onSelect,
}) => {
  const conditional = meta as ConditionalMetaComponent;

  return (
    <div
      className={`meta-component-box meta-conditional ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="meta-component-label">
        {conditional.name}
        <span className="meta-component-action">
          {conditional.action}
        </span>
      </div>
    </div>
  );
};
