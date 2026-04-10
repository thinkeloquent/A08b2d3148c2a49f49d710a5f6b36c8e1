/**
 * Generic async data fetching hook
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — fire-and-forget async fetch hook.
 *
 * @param {() => Promise<any>} fetcher - async function that returns data
 * @param {any[]} deps - dependency array (re-runs when these change)
 * @returns {{ data, loading, error, refetch }}
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => { mountedRef.current = false; };
  }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * useLazyApi — manually triggered fetch hook.
 *
 * @returns {{ data, loading, error, execute }}
 */
export function useLazyApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (fetcher) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
