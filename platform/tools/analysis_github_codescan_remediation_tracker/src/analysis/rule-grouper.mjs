/**
 * Groups code scanning alerts by rule ID.
 * Returns a Map sorted by alert count descending.
 */

/**
 * @param {object[]} alerts - Array of code scanning alert objects.
 * @returns {Map<string, { rule: object, severity: string, description: string, count: number, alerts: object[] }>}
 */
export function groupByRule(alerts) {
  const ruleMap = new Map();

  for (const alert of alerts) {
    const ruleId = alert.rule?.id ?? "unknown";

    if (!ruleMap.has(ruleId)) {
      ruleMap.set(ruleId, {
        rule: alert.rule ?? {},
        severity: alert.rule?.severity ?? alert.rule?.security_severity_level ?? "unknown",
        description: alert.rule?.description ?? alert.rule?.name ?? ruleId,
        count: 0,
        alerts: [],
      });
    }

    const entry = ruleMap.get(ruleId);
    entry.count += 1;
    entry.alerts.push(alert);
  }

  // Sort by count descending
  const sorted = new Map(
    [...ruleMap.entries()].sort((a, b) => b[1].count - a[1].count)
  );

  return sorted;
}

/**
 * Convert a rule grouping map to a plain array for reporting.
 * @param {Map} ruleMap
 * @param {number} [topN] - Optional limit.
 * @returns {object[]}
 */
export function ruleMapToArray(ruleMap, topN) {
  const entries = [...ruleMap.entries()].map(([ruleId, data]) => ({
    ruleId,
    severity: data.severity,
    description: data.description,
    count: data.count,
  }));
  return topN ? entries.slice(0, topN) : entries;
}
