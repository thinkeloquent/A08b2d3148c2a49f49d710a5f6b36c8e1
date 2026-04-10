import type { SingleViewPanelProps } from './types';

const defaultBackIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const defaultChevron = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export function SingleViewPanel({
  currentPanel,
  onNavigateToChild,
  onNavigateBack,
  canGoBack,
  isTransitioning,
  backIcon,
  chevronIcon,
  className,
}: SingleViewPanelProps) {
  const back = backIcon ?? defaultBackIcon;
  const chevron = chevronIcon ?? defaultChevron;

  return (
    <div className={['h-full flex flex-col', className].filter(Boolean).join(' ')}>
      {canGoBack && (
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={onNavigateBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>{back}</span>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}

      <div
        className={[
          'flex-1 transition-all duration-300',
          isTransitioning
            ? 'opacity-50 transform translate-x-2'
            : 'opacity-100 transform translate-x-0',
        ].join(' ')}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            {currentPanel.icon && (
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {currentPanel.icon}
              </div>
            )}
            <h3 className="font-semibold text-slate-800">{currentPanel.title}</h3>
          </div>
        </div>

        <nav className="p-2">
          {currentPanel.children && currentPanel.children.length > 0 ? (
            currentPanel.children.map((child) => (
              <button
                key={child.id}
                onClick={() => onNavigateToChild(child.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  {child.icon && (
                    <div className="text-slate-500 group-hover:text-blue-600 transition-colors">
                      {child.icon}
                    </div>
                  )}
                  <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                    {child.title}
                  </span>
                </div>
                {child.children && child.children.length > 0 && (
                  <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                    {chevron}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">
              {currentPanel.icon && (
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {currentPanel.icon}
                </div>
              )}
              <p className="text-sm">No sub-items available</p>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
