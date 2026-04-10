import type {
  DashboardLandingCard001Props,
  StatCardProps,
  QuickActionProps,
} from './types';

/* ------------------------------------------------------------------ */
/*  StatCard                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon,
  iconBgClass = 'bg-gray-100',
  iconColorClass = 'text-gray-600',
  onClick,
  as: Element = 'button',
  className,
}: StatCardProps) {
  return (
    <Element
      onClick={onClick}
      className={[
        'text-left transition-transform hover:scale-105',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            </div>
            {icon && (
              <div
                className={[
                  'rounded-lg p-3',
                  iconBgClass,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center',
                    iconColorClass,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {icon}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Element>
  );
}

/* ------------------------------------------------------------------ */
/*  QuickAction                                                       */
/* ------------------------------------------------------------------ */

function QuickAction({
  title,
  description,
  icon,
  onClick,
  as: Element = 'button',
  className,
}: QuickActionProps) {
  return (
    <Element
      onClick={onClick}
      className={[
        'flex items-center rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center text-gray-400">
          {icon}
        </span>
      )}
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </Element>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                              */
/* ------------------------------------------------------------------ */

export function DashboardLandingCard001({
  title,
  subtitle,
  stats,
  onStatClick,
  statAs,
  actions,
  onActionClick,
  actionAs,
  actionsTitle = 'Quick Actions',
  className,
  children,
}: DashboardLandingCard001Props) {
  return (
    <div
      className={[
        'mx-auto max-w-7xl px-6 py-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-gray-600">{subtitle}</p>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconBgClass={stat.iconBgClass}
            iconColorClass={stat.iconColorClass}
            onClick={onStatClick ? () => onStatClick(stat) : undefined}
            as={statAs}
          />
        ))}
      </div>

      {/* Children slot */}
      {children}

      {/* Quick Actions */}
      {actions && actions.length > 0 && (
        <div className="mt-8">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {actionsTitle}
              </h2>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((action) => (
                  <QuickAction
                    key={action.key}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    onClick={
                      onActionClick ? () => onActionClick(action) : undefined
                    }
                    as={actionAs}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Attach compound sub-components */
DashboardLandingCard001.StatCard = StatCard;
DashboardLandingCard001.QuickAction = QuickAction;
