import type {
  PanelLeftTypesDashboardProps,
  PanelLeftTypesDashboardHeaderProps,
  PanelLeftTypesDashboardNavProps,
  PanelLeftTypesDashboardFooterProps,
  TypeNavItem,
} from './types';

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

function Header({ title, className, children }: PanelLeftTypesDashboardHeaderProps) {
  return (
    <div
      className={[
        'flex h-16 shrink-0 items-center border-b border-gray-200 px-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav                                                               */
/* ------------------------------------------------------------------ */

function Nav({
  items,
  activeKey,
  onItemSelect,
  as: Element = 'button',
  className,
}: PanelLeftTypesDashboardNavProps) {
  return (
    <nav
      className={['flex-1 space-y-0.5 overflow-y-auto px-3 py-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        return (
          <Element
            key={item.key}
            onClick={() => onItemSelect?.(item)}
            className={[
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all',
              isActive
                ? 'bg-indigo-600 font-semibold text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.icon && (
              <span
                className={[
                  'flex h-5 w-5 shrink-0 items-center justify-center',
                  isActive ? 'text-white' : 'text-gray-400',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </Element>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */

function Footer({ className, children }: PanelLeftTypesDashboardFooterProps) {
  return (
    <div
      className={['shrink-0 border-t border-gray-200 p-4', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                              */
/* ------------------------------------------------------------------ */

export function PanelLeftTypesDashboard({
  items,
  activeKey,
  onItemSelect,
  title,
  footer,
  className,
  children,
  as,
}: PanelLeftTypesDashboardProps) {
  return (
    <aside
      className={[
        'flex h-full w-64 flex-col border-r border-gray-200 bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <Header title={title} />}
      <Nav items={items} activeKey={activeKey} onItemSelect={onItemSelect} as={as} />
      {children}
      {footer && <Footer>{footer}</Footer>}
    </aside>
  );
}

/* Attach compound sub-components */
PanelLeftTypesDashboard.Header = Header;
PanelLeftTypesDashboard.Nav = Nav;
PanelLeftTypesDashboard.Footer = Footer;
