import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  AuditLogProps,
  AuditLogEntryCardProps,
  AuditLogActionConfig,
} from './types';

const DEFAULT_ACTION_CONFIG: Record<string, AuditLogActionConfig> = {
  create: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
  },
  update: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
  },
  delete: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
  },
  restore: {
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-200',
  },
};

const defaultFormatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

function defaultRenderTags(
  tags: Record<string, unknown>,
  config: AuditLogActionConfig,
): ReactNode {
  const diffs = tags.diffs as Record<string, unknown> | undefined;

  return (
    <div
      className={['mt-2 p-3 rounded-md bg-gray-50 border', config.borderColor]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="text-xs font-bold mb-1">Tags:</div>

      {tags.type && (
        <div className="flex mb-1 flex-wrap">
          <span className="text-xs font-medium mr-2">
            {tags.type as string}
          </span>

          {tags.key_path && (
            <span className="text-xs text-gray-600">
              / key_path: {tags.key_path as string}
            </span>
          )}

          {tags.key_value && (
            <span className="text-xs text-gray-600 font-mono">
              / key_value: &quot;{tags.key_value as string}&quot;
            </span>
          )}

          {tags.value && (
            <span className="text-xs text-gray-600 font-mono">
              / value: &quot;{tags.value as string}&quot;
            </span>
          )}
        </div>
      )}

      {diffs &&
        Object.entries(diffs).map(([key, value]) => (
          <div key={key} className="text-xs text-gray-600 ml-4">
            <span className="font-medium">diffs:</span> {key}: &quot;
            {String(value)}&quot;
          </div>
        ))}
    </div>
  );
}

export function AuditLogEntryCard({
  log,
  actionConfig = DEFAULT_ACTION_CONFIG,
  renderTags: renderTagsProp,
  formatDate: formatDateProp,
  className,
}: AuditLogEntryCardProps) {
  const config = actionConfig[log.action] || {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
  };
  const format = formatDateProp || defaultFormatDate;
  const renderTagsFn = renderTagsProp || defaultRenderTags;

  return (
    <div
      className={[
        'mb-4 border rounded-md overflow-hidden shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="mr-3">
            <span
              className={[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                config.bgColor,
                config.textColor,
              ].join(' ')}
            >
              {log.action}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">
                Performed by: {log.performer}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-2">
              Date: {format(log.timestamp)}
            </div>

            {log.tags && renderTagsFn(log.tags, config)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuditLog({
  logs,
  actionTypes: actionTypesProp,
  actionConfig = DEFAULT_ACTION_CONFIG,
  renderTags,
  formatDate,
  title = 'Audit Log',
  titleIcon,
  emptyContent,
  onFilterChange,
  filterValue,
  className,
  children,
}: AuditLogProps) {
  const [internalFilter, setInternalFilter] = useState('all');
  const filter = filterValue ?? internalFilter;

  const actionTypes = useMemo(
    () =>
      actionTypesProp || [
        'all',
        ...Array.from(new Set(logs.map((log) => log.action))),
      ],
    [actionTypesProp, logs],
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (filterValue === undefined) {
      setInternalFilter(value);
    }
    onFilterChange?.(value);
  };

  const filteredLogs =
    filter === 'all' ? logs : logs.filter((log) => log.action === filter);

  return (
    <div
      className={['max-w-4xl mx-auto p-4', className].filter(Boolean).join(' ')}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {titleIcon}
          {title}
        </h1>

        <div className="relative">
          <select
            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-md shadow-sm text-sm"
            value={filter}
            onChange={handleFilterChange}
          >
            {actionTypes.map((action) => (
              <option key={action} value={action} className="capitalize">
                {action === 'all' ? 'All Actions' : action}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="border-b mb-6"></div>

      {children}

      {filteredLogs.length > 0 ? (
        filteredLogs.map((log) => (
          <AuditLogEntryCard
            key={log.id}
            log={log}
            actionConfig={actionConfig}
            renderTags={renderTags}
            formatDate={formatDate}
          />
        ))
      ) : (
        emptyContent || (
          <div className="text-center text-gray-500">No audit logs found</div>
        )
      )}
    </div>
  );
}
