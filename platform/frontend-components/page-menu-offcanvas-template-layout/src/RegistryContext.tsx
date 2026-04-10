import { createContext, useContext } from 'react';
import type { ComponentRegistryMap } from './types';

const RegistryContext = createContext<ComponentRegistryMap>(
  Object.freeze({}) as ComponentRegistryMap,
);

export const RegistryProvider = RegistryContext.Provider;

/** Consume the component registry from any descendant */
export function useRegistry(): ComponentRegistryMap {
  return useContext(RegistryContext);
}
