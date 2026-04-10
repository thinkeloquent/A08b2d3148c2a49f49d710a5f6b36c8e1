/**
 * Builds a file heatmap from code scanning alerts.
 * Maps file paths to alert counts and computes a hotspot score.
 */

const SEVERITY_WEIGHTS = {
  error: 3,
  warning: 2,
  note: 1,
};

/**
 * @param {object[]} alerts - Array of code scanning alert objects.
 * @param {number} topN - Number of top hotspot files to return.
 * @returns {object[]} Top N files sorted by hotspotScore desc.
 */
export function buildFileHeatmap(alerts, topN = 20) {
  const fileMap = new Map();

  for (const alert of alerts) {
    const filePath = alert.most_recent_instance?.location?.path ?? "unknown";
    const ruleId = alert.rule?.id ?? "unknown";
    const severity = alert.rule?.severity ?? alert.rule?.security_severity_level ?? "note";

    if (!fileMap.has(filePath)) {
      fileMap.set(filePath, {
        filePath,
        alertCount: 0,
        hotspotScore: 0,
        rules: new Set(),
      });
    }

    const entry = fileMap.get(filePath);
    entry.alertCount += 1;
    entry.hotspotScore += SEVERITY_WEIGHTS[severity] ?? 1;
    entry.rules.add(ruleId);
  }

  const sorted = [...fileMap.values()]
    .sort((a, b) => b.hotspotScore - a.hotspotScore || b.alertCount - a.alertCount)
    .slice(0, topN)
    .map((entry) => ({
      filePath: entry.filePath,
      alertCount: entry.alertCount,
      hotspotScore: entry.hotspotScore,
      topRules: [...entry.rules].slice(0, 5).join(", "),
    }));

  return sorted;
}
