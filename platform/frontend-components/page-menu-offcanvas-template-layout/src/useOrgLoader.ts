/**
 * useOrgLoader — fetches organizations from a REST endpoint and builds
 * a ready-to-use OrgSlot for the shell header.
 *
 * Baked-in feature: consumers just pass `orgConfig` with an endpoint,
 * and the component handles the rest.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OrgSlot, OrgEntry } from './types';

/** Colors cycled across org entries */
const ORG_COLORS = [
  'bg-purple-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
];

export interface OrgConfig {
  /** REST endpoint that returns `{ data: Array<{ id, name, status, ... }> }` */
  endpoint: string;
  /** URL for "Create organization" link */
  createHref?: string;
  /** URL for "Manage organizations" link */
  manageHref?: string;
  /** Fallback org name shown while loading or on error */
  fallbackName?: string;
}

export function useOrgLoader(config: OrgConfig | undefined): OrgSlot | undefined {
  if (!config) return undefined;
  return useOrgLoaderInternal(config);
}

function useOrgLoaderInternal(config: OrgConfig): OrgSlot {
  const [orgs, setOrgs] = useState<OrgEntry[]>([]);
  const [current, setCurrent] = useState<{ name: string; initial: string; color: string }>({
    name: 'Loading...',
    initial: '…',
    color: 'bg-slate-400',
  });
  const configRef = useRef(config);
  configRef.current = config;
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    fetch(config.endpoint)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const entries: OrgEntry[] = ((json.data as any[]) || []).map((o, i) => ({
          id: o.id,
          name: o.name,
          initial: o.name.charAt(0).toUpperCase(),
          color: ORG_COLORS[i % ORG_COLORS.length],
          status: o.status,
        }));
        setOrgs(entries);

        const active = entries.find((e) => e.status === 'active') || entries[0];
        if (active) {
          setCurrent({
            name: active.name,
            initial: active.initial || active.name.charAt(0),
            color: active.color || 'bg-purple-600',
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCurrent({
          name: configRef.current.fallbackName ?? 'Unknown ORG',
          initial: (configRef.current.fallbackName ?? 'Unknown ORG').charAt(0).toUpperCase(),
          color: 'bg-purple-600',
        });
      });

    return () => { cancelled = true; };
  }, [config.endpoint, fetchKey]);

  const handleOrgChange = useCallback(
    (id: string) => {
      const entry = orgs.find((o) => o.id === id);
      if (entry) {
        setCurrent({
          name: entry.name,
          initial: entry.initial || entry.name.charAt(0),
          color: entry.color || 'bg-purple-600',
        });
      }
    },
    [orgs],
  );

  return {
    ...current,
    orgs,
    onOrgChange: handleOrgChange,
    onRefresh: refetch,
    createHref: config.createHref,
    manageHref: config.manageHref,
  };
}
