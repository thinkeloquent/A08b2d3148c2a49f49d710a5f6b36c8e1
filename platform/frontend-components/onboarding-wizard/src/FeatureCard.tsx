import type { FeatureCardProps } from './types';

const DefaultCheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export function FeatureCard({ feature, isSelected, onSelect, checkIcon, className }: FeatureCardProps) {
  const baseClass = [
    'w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group hover:shadow-md',
    isSelected
      ? 'border-blue-500 bg-blue-50 shadow-sm'
      : 'border-gray-200 bg-white hover:border-gray-300',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button onClick={() => onSelect(feature.id)} className={baseClass}>
      <div className="flex items-start gap-3">
        <div className={[
          'p-2 rounded-lg transition-colors',
          isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
        ].filter(Boolean).join(' ')}>
          {feature.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={['font-semibold text-base', isSelected ? 'text-blue-900' : 'text-gray-900'].join(' ')}>
              {feature.title}
            </h3>
            {isSelected && (
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {checkIcon ?? <DefaultCheckIcon />}
              </span>
            )}
          </div>
          <p className={['text-sm mt-0.5', isSelected ? 'text-blue-700' : 'text-gray-500'].join(' ')}>
            {feature.description}
          </p>
        </div>
      </div>
    </button>
  );
}
