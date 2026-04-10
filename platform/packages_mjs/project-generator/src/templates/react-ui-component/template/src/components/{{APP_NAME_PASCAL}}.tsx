import type { {{APP_NAME_PASCAL}}Props } from '../types';

/**
 * {{APP_NAME_TITLE}} Component
 *
 * A reusable UI component.
 */
export function {{APP_NAME_PASCAL}}({ children, className = '' }: {{APP_NAME_PASCAL}}Props) {
  return (
    <div className={`{{APP_NAME}}-container ${className}`.trim()}>
      {children}
    </div>
  );
}
