import { createContext, useContext } from 'react';
import type { OrgSlot, NavGroup } from './types';

/** Application state exposed by the shell to all descendant components. */
export interface AppState {
  /** Currently active horizontal navigation item id (page). */
  activeId: string;
  /** All navigation groups. */
  groups: NavGroup[];
  /** Active organization / workspace info. `undefined` if no org slot is configured. */
  activeOrg?: {
    /** Organization display name. */
    name: string;
    /** Single-character initial. */
    initial?: string;
    /** Background color class. */
    color?: string;
  };
  /** Full org slot configuration (includes orgs list, callbacks, etc.). */
  org?: OrgSlot;
  /** Whether the left nav panel is open. */
  leftOpen: boolean;
  /** Whether the right drawer is open. */
  drawerOpen: boolean;
}

const AppStateContext = createContext<AppState | null>(null);

export const AppStateProvider = AppStateContext.Provider;

/** Consume shell application state from any descendant component. */
export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within a <PageMenuOffcanvasTemplateLayout> or <AppShell>');
  }
  return ctx;
}
