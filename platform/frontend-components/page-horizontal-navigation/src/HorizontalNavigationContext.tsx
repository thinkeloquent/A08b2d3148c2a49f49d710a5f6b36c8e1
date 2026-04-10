import { createContext, useContext } from 'react';
import type { NavGroup, OrgSlot, ScopeSlot } from './types';

export interface HorizontalNavigationContextValue {
  groups: NavGroup[];
  activeId: string;
  onActiveChange: (id: string) => void;
  maxWidth: string;
  org?: OrgSlot;
  scope?: ScopeSlot;
}

export const HorizontalNavigationContext = createContext<HorizontalNavigationContextValue | null>(null);

export function useHorizontalNavigation() {
  return useContext(HorizontalNavigationContext);
}
