import type {
  DevEnvUrlSwitcherNavProps,
  DevEnvUrlSwitcherNavLink,
  NavItemProps,
} from './types';

function normalizeLinks(
  links: DevEnvUrlSwitcherNavLink[] | [string, string][],
): DevEnvUrlSwitcherNavLink[] {
  if (links.length === 0) return [];
  const first = links[0];
  if (Array.isArray(first)) {
    return (links as [string, string][]).map(([url, name]) => ({ url, name }));
  }
  return links as DevEnvUrlSwitcherNavLink[];
}

function NavItem({ item, active, onNavigate, as: Component, className }: NavItemProps) {
  const base = active
    ? 'bg-blue-100 text-blue-700 font-medium'
    : 'text-gray-600 hover:bg-gray-100';

  const classes = [
    'px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer',
    base,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (Component) {
    return (
      <Component className={classes} onClick={() => onNavigate(item.url)} to={item.url}>
        {item.name}
      </Component>
    );
  }

  return (
    <button className={classes} onClick={() => onNavigate(item.url)}>
      {item.name}
    </button>
  );
}

const defaultNavigate = (url: string) => {
  window.location.href = url;
};

export function DevEnvUrlSwitcherNav({
  links,
  activeUrl,
  onNavigate = defaultNavigate,
  label,
  labelIcon,
  itemAs,
  className,
  itemClassName,
  children,
}: DevEnvUrlSwitcherNavProps) {
  const normalized = normalizeLinks(links);

  return (
    <div
      className={[
        'flex items-center gap-1 border-b border-gray-200 bg-white px-4 py-2 shrink-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {(label || labelIcon) && (
        <span className="text-sm font-semibold text-gray-500 mr-3 flex items-center gap-1.5 shrink-0">
          {labelIcon}
          {label}
        </span>
      )}
      {normalized.map((item) => (
        <NavItem
          key={item.url}
          item={item}
          active={activeUrl === item.url}
          onNavigate={onNavigate}
          as={itemAs}
          className={itemClassName}
        />
      ))}
      {children}
    </div>
  );
}
