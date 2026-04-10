import { useState, useCallback, useMemo, Children } from 'react';
import { HorizontalNavigation } from '@internal/page-horizontal-navigation';
import type {
  PageMenuOffcanvasTemplateLayoutProps,
  ShellTheme,
  BlockConfig,
  ComponentRegistryMap,
  RegionConfig,
} from './types';
import { RegistryProvider } from './RegistryContext';
import { AppStateProvider } from './AppStateContext';
import type { AppState } from './AppStateContext';
import { useOrgLoader } from './useOrgLoader';

/* ──────── Default theme ──────── */
const DEFAULT_THEME: ShellTheme = {
  rail: '#1E293B',
  railHover: '#334155',
  railIcon: '#94A3B8',
  accent: '#3B82F6',
  brand: '#2563EB',
};

const DEFAULT_FONT = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

/* ──────── Helpers ──────── */

/** Detect whether `regions` is a per-activeId map or a static RegionConfig */
function isRegionMap(r: unknown): r is Record<string, RegionConfig> {
  if (!r || typeof r !== 'object') return false;
  // A RegionConfig has known keys (left / main / drawer) whose values are arrays.
  // A map has arbitrary string keys whose values are objects.
  const keys = Object.keys(r as Record<string, unknown>);
  if (keys.length === 0) return false;
  const first = (r as Record<string, unknown>)[keys[0]!];
  // If the first value is an array it's a RegionConfig field (left/main/drawer);
  // if it's an object (with its own left/main/drawer) it's a map entry.
  return first !== null && typeof first === 'object' && !Array.isArray(first);
}

/* ════════════════════════════════════════════════════════════════
   PageMenuOffcanvasTemplateLayout
   ════════════════════════════════════════════════════════════════ */
export function PageMenuOffcanvasTemplateLayout({
  /* HorizontalNavigation (top) */
  groups,
  activeId,
  onActiveChange,
  org: orgProp,
  orgConfig,
  scope,
  fqdpScopeSelector,
  brand,
  search,
  actions,
  user,
  trailingTabs,
  maxWidth,
  headerClassName,
  /* Left sidebar chrome */
  theme: themeProp,
  railBottomItems = [],
  menuIcon,
  closeIcon,
  defaultLeftOpen = false,
  /* Right drawer */
  drawerTitle = 'Properties',
  drawerCloseIcon,
  drawerOpen: drawerOpenProp,
  onDrawerOpenChange,
  defaultRightOpen = false,
  /* Content + registry */
  registry: registryProp,
  regions: regionsProp,
  fallback: FallbackComponent,
  children,
  className,
  fontFamily = DEFAULT_FONT,
  callbacks = {},
}: PageMenuOffcanvasTemplateLayoutProps) {
  const C = { ...DEFAULT_THEME, ...themeProp };

  /* ── Org loader (baked-in fetch when orgConfig is provided) ── */
  const loadedOrg = useOrgLoader(orgConfig);
  const org = loadedOrg ?? orgProp;

  const [leftOpen, setLeftOpen] = useState(defaultLeftOpen);
  const [internalRightOpen, setInternalRightOpen] = useState(defaultRightOpen);
  const rightOpen = drawerOpenProp ?? internalRightOpen;
  const setRightOpen = useCallback(
    (open: boolean) => {
      setInternalRightOpen(open);
      onDrawerOpenChange?.(open);
    },
    [onDrawerOpenChange],
  );

  /* ── Resolve regions for the current activeId ── */
  const regions: RegionConfig = useMemo(() => {
    if (!regionsProp) return {};
    if (isRegionMap(regionsProp)) return regionsProp[activeId] ?? {};
    return regionsProp as RegionConfig;
  }, [regionsProp, activeId]);

  /* ── Handlers ── */
  const handleActiveChange = useCallback(
    (id: string) => {
      onActiveChange(id);
      callbacks.onActiveChange?.(id);
    },
    [onActiveChange, callbacks],
  );

  /* ── Component Registry ── */
  const registry: ComponentRegistryMap = useMemo(
    () => (registryProp ? Object.freeze({ ...registryProp }) : Object.freeze({})),
    [registryProp],
  );

  /* ── Resolve dynamic blocks for regions ── */
  const resolveBlocks = useCallback(
    (blocks: BlockConfig[]) =>
      blocks.map((block) => {
        const Comp = registry[block.type];
        if (!Comp) {
          if (FallbackComponent) {
            return <FallbackComponent key={block.id} type={block.type} />;
          }
          return null;
        }
        return <Comp key={block.id} blockId={block.id} {...(block.props ?? {})} />;
      }),
    [registry, FallbackComponent],
  );

  /* ── Normalize children ── */
  const normalizedChildren = useMemo(() => Children.toArray(children), [children]);

  /* ── Resolve region blocks ── */
  const leftBlocks = useMemo(
    () => (regions.left ? resolveBlocks(regions.left) : []),
    [regions.left, resolveBlocks],
  );

  const mainBlocks = useMemo(
    () => (regions.main ? resolveBlocks(regions.main) : []),
    [regions.main, resolveBlocks],
  );

  const drawerBlocks = useMemo(
    () => (regions.drawer ? resolveBlocks(regions.drawer) : []),
    [regions.drawer, resolveBlocks],
  );

  const mainContent = useMemo(
    () => [...normalizedChildren, ...mainBlocks],
    [normalizedChildren, mainBlocks],
  );

  const hasLeft = leftBlocks.length > 0;
  const hasDrawer = drawerBlocks.length > 0;

  /* ── Application state context ── */
  const appState: AppState = useMemo(() => ({
    activeId,
    groups,
    activeOrg: org ? { name: org.name, initial: org.initial, color: org.color } : undefined,
    org,
    leftOpen,
    drawerOpen: rightOpen,
  }), [activeId, groups, org, leftOpen, rightOpen]);

  const rootCls = ['h-screen w-screen flex flex-col bg-gray-50 text-gray-800 overflow-hidden', className]
    .filter(Boolean)
    .join(' ');

  return (
    <AppStateProvider value={appState}>
    <RegistryProvider value={registry}>
    <div className={rootCls} style={{ fontFamily }}>
      {/* ━━━ TOP HEADER + NAVIGATION (HorizontalNavigation) ━━━ */}
      <HorizontalNavigation
        groups={groups}
        activeId={activeId}
        onActiveChange={handleActiveChange}
        org={org}
        scope={scope}
        fqdpScopeSelector={fqdpScopeSelector}
        brand={brand}
        search={search}
        actions={actions}
        user={user}
        headerClassName={headerClassName}
        maxWidth={maxWidth}
      >
        <HorizontalNavigation.Nav trailingTabs={trailingTabs} />
      </HorizontalNavigation>

      {/* ━━━ BODY ━━━ */}
      <div className="flex-1 relative flex min-h-0 overflow-hidden">
        {/* ══════ ICON RAIL — always in flow ══════ */}
        <div
          className="w-14 flex-none flex flex-col items-center py-4 gap-1.5"
          style={{ backgroundColor: C.rail, zIndex: 30 }}
        >
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ color: C.railIcon }}
          >
            {leftOpen ? closeIcon : menuIcon}
          </button>

          <div className="flex-1" />

          {railBottomItems.map((item) => (
            <button
              key={item.key}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            >
              <span style={{ color: C.railIcon }}>{item.icon}</span>
            </button>
          ))}

          {user && (
            <div className="mt-2 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 cursor-pointer flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.railIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>

        {/* ══════ MAIN CONTENT — fills remaining space ══════ */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {mainContent.length > 0 ? mainContent : null}
        </main>

        {/* ══════ LEFT NAV PANEL — slides over main content ══════ */}
        {leftOpen && (
          <div
            onClick={() => setLeftOpen(false)}
            className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px] transition-opacity"
            style={{ left: '3.5rem' }}
          />
        )}
        <div
          className={[
            'absolute top-0 bottom-0 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
            leftOpen ? 'shadow-xl translate-x-0' : '-translate-x-full pointer-events-none',
          ].join(' ')}
          style={{ left: '3.5rem', width: '15rem', zIndex: 25 }}
        >
          {hasLeft ? (
            <div className="flex-1 overflow-y-auto">{leftBlocks}</div>
          ) : (
            <div className="flex-1 overflow-y-auto px-3 py-3" />
          )}
        </div>

        {/* ══════ RIGHT DRAWER — slides over main content ══════ */}
        {rightOpen && (
          <div
            onClick={() => setRightOpen(false)}
            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity"
          />
        )}
        <aside
          className={[
            'absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]',
            rightOpen ? 'shadow-xl translate-x-0' : 'translate-x-full pointer-events-none',
          ].join(' ')}
          style={{ zIndex: 35 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {drawerTitle}
            </span>
            <button
              onClick={() => setRightOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              {(drawerCloseIcon ?? closeIcon) && <span className="text-gray-400">{drawerCloseIcon ?? closeIcon}</span>}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-3">
            {hasDrawer ? drawerBlocks : null}
          </div>
        </aside>
      </div>
    </div>
    </RegistryProvider>
    </AppStateProvider>
  );
}
