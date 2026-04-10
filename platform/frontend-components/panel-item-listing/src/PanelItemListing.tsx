import type { PanelItemListingProps } from './types';

/**
 * Master-detail layout with a filterable item list panel on the left
 * and a children slot for detail content on the right.
 */
export function PanelItemListing<T>({
  title,
  items,
  getItemKey,
  renderItem,
  selectedKey,
  onItemSelect,
  searchPlaceholder = 'Search...',
  onSearchChange,
  searchValue,
  filterOptions,
  filterValue,
  onFilterChange,
  actionLabel,
  actionIcon,
  onActionClick,
  isLoading = false,
  error,
  totalCount,
  itemLabel = 'items',
  loadingElement,
  searchIcon,
  emptyContent,
  children,
  className,
  panelWidth = 'w-96',
  panelMinWidth = 'min-w-96',
  panelMaxWidth = 'max-w-96',
  panelClassName,
  contentClassName,
}: PanelItemListingProps<T>) {
  const total = totalCount ?? items.length;

  const rootClass = ['flex h-full', className].filter(Boolean).join(' ');
  const panelClass = [
    `${panelWidth} ${panelMinWidth} ${panelMaxWidth} flex-shrink-0 flex h-full flex-col border-r border-gray-200 bg-white`,
    panelClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const contentClass = ['flex-1 overflow-y-auto', contentClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {/* Left Panel */}
      <aside className={panelClass}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

          {/* Search */}
          {onSearchChange && (
            <div className="relative">
              {searchIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">
                  {searchIcon}
                </div>
              )}
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className={[
                  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
                  'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  searchIcon ? 'pl-9' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </div>
          )}

          {/* Filter dropdown */}
          {filterOptions && filterOptions.length > 0 && onFilterChange && (
            <div className="mt-3">
              <select
                value={filterValue ?? filterOptions[0]?.value}
                onChange={(e) => onFilterChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action button */}
          {actionLabel && onActionClick && (
            <button
              type="button"
              onClick={onActionClick}
              className="mt-3 w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {actionIcon && <span className="mr-2 h-4 w-4">{actionIcon}</span>}
              {actionLabel}
            </button>
          )}
        </div>

        {/* Scrollable item list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              {loadingElement ?? (
                <span className="text-sm text-gray-400">Loading...</span>
              )}
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">Error loading {itemLabel}</p>
              <p className="text-xs text-gray-500 mt-1">{error.message}</p>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="p-8 text-center">
              {emptyContent ?? (
                <p className="text-sm text-gray-500">No {itemLabel} found</p>
              )}
            </div>
          )}

          {!isLoading &&
            !error &&
            items.map((item) => {
              const key = getItemKey(item);
              return (
                <div
                  key={key}
                  onClick={() => onItemSelect?.(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemSelect?.(item);
                    }
                  }}
                >
                  {renderItem(item, key === selectedKey)}
                </div>
              );
            })}
        </div>

        {/* Footer count */}
        {!isLoading && !error && items.length > 0 && (
          <div className="border-t border-gray-200 p-3 shrink-0">
            <p className="text-xs text-gray-500 text-center">
              Showing {items.length} of {total} {itemLabel}
            </p>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className={contentClass}>{children}</div>
    </div>
  );
}
