export interface RecordsConfig {
  totalRecords: number;
}

export interface MutableCounter {
  value: number;
}

/**
 * Check if the total records limit has been reached.
 */
export function checkTotalRecordsLimit(
  config: RecordsConfig,
  totalFetched: MutableCounter,
): boolean {
  return config.totalRecords > 0 && totalFetched.value >= config.totalRecords;
}

/**
 * Get the number of remaining records allowed.
 */
export function getRemainingRecords(
  config: RecordsConfig,
  totalFetched: MutableCounter,
): number {
  if (config.totalRecords === 0) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, config.totalRecords - totalFetched.value);
}
