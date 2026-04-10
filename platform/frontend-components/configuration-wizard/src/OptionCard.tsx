import type { OptionCardProps } from './types';

const DefaultCheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export function OptionCard({ mode, isSelected, onClick, checkIcon, className }: OptionCardProps) {
  const check = checkIcon ?? <DefaultCheckIcon />;

  return (
    <button
      onClick={onClick}
      className={[
        'w-full p-3 rounded-xl text-left flex items-center gap-3 group transition-all duration-200',
        isSelected
          ? 'bg-gray-800 border border-blue-500/40 shadow-lg shadow-blue-500/10'
          : 'bg-gray-900 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div
        className={[
          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          isSelected
            ? 'bg-blue-500 border-blue-500 text-white'
            : 'border-gray-600 group-hover:border-gray-500',
        ].join(' ')}
      >
        {isSelected && check}
      </div>

      {mode.icon && (
        <div
          className={[
            'flex-shrink-0 p-1.5 rounded-lg transition-colors',
            isSelected
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-gray-700 text-gray-400 group-hover:text-gray-300',
          ].join(' ')}
        >
          {mode.icon}
        </div>
      )}

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className={['text-sm font-medium', isSelected ? 'text-white' : 'text-gray-200'].join(' ')}>
            {mode.name}
          </span>
          {mode.recommended && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500 text-white rounded uppercase tracking-wide">
              Recommended
            </span>
          )}
        </div>
        {mode.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{mode.description}</p>
        )}
      </div>
    </button>
  );
}
