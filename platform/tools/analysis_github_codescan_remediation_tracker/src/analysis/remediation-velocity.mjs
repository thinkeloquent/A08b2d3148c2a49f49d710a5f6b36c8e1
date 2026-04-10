/**
 * Computes remediation velocity from open and fixed alerts.
 * Buckets fixed alerts by ISO week, computes averages, trend, and projection.
 */

/**
 * Get ISO week string (YYYY-Www) from a date string.
 * @param {string} dateStr
 * @returns {string}
 */
function toISOWeek(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "unknown";

  // ISO week: Thursday-based
  const day = d.getUTCDay() || 7; // Mon=1 ... Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Simple linear regression over [index, value] pairs.
 * Returns slope (fixes/week trend).
 * @param {number[]} values
 * @returns {number} slope
 */
function linearRegressionSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * @param {object[]} openAlerts - Alerts with state=open.
 * @param {object[]} fixedAlerts - Alerts with state=fixed, having fixed_at field.
 * @param {number} weeks - Number of weeks to analyze.
 * @returns {object} velocity report
 */
export function computeVelocity(openAlerts, fixedAlerts, weeks = 12) {
  // Bucket fixed alerts by ISO week (most recent `weeks` weeks only)
  const now = new Date();
  const cutoff = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

  const weekBuckets = new Map();

  // Pre-populate all weeks in range (so weeks with zero show up)
  for (let i = 0; i < weeks; i++) {
    const d = new Date(cutoff.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const label = toISOWeek(d.toISOString());
    if (!weekBuckets.has(label)) {
      weekBuckets.set(label, { week: label, fixedCount: 0, openedCount: 0 });
    }
  }

  // Bucket fixed alerts
  for (const alert of fixedAlerts) {
    const fixedAt = alert.fixed_at ?? alert.dismissed_at ?? alert.auto_dismissed_at;
    if (!fixedAt) continue;
    const d = new Date(fixedAt);
    if (d < cutoff) continue;
    const label = toISOWeek(fixedAt);
    if (!weekBuckets.has(label)) {
      weekBuckets.set(label, { week: label, fixedCount: 0, openedCount: 0 });
    }
    weekBuckets.get(label).fixedCount += 1;
  }

  // Bucket opened alerts (created_at within the window)
  for (const alert of [...openAlerts, ...fixedAlerts]) {
    const createdAt = alert.created_at;
    if (!createdAt) continue;
    const d = new Date(createdAt);
    if (d < cutoff) continue;
    const label = toISOWeek(createdAt);
    if (!weekBuckets.has(label)) {
      weekBuckets.set(label, { week: label, fixedCount: 0, openedCount: 0 });
    }
    weekBuckets.get(label).openedCount += 1;
  }

  // Sort weeks ascending
  const sortedWeeks = [...weekBuckets.values()].sort((a, b) =>
    a.week.localeCompare(b.week)
  );

  // Compute cumulative open
  let cumulative = openAlerts.length;
  const weeklyData = sortedWeeks.map((row) => {
    const netChange = row.openedCount - row.fixedCount;
    cumulative += netChange;
    return {
      week: row.week,
      fixedCount: row.fixedCount,
      openedCount: row.openedCount,
      netChange,
      cumulativeOpen: Math.max(0, cumulative),
    };
  });

  const fixCounts = sortedWeeks.map((r) => r.fixedCount);
  const totalFixed = fixCounts.reduce((a, b) => a + b, 0);
  const avgFixesPerWeek = fixCounts.length > 0 ? totalFixed / fixCounts.length : 0;
  const trend = linearRegressionSlope(fixCounts);
  const openCount = openAlerts.length;
  const projectedWeeksToZero =
    avgFixesPerWeek > 0 ? Math.ceil(openCount / avgFixesPerWeek) : null;

  // Per-rule fix rates
  const ruleFixMap = new Map();
  for (const alert of fixedAlerts) {
    const ruleId = alert.rule?.id ?? "unknown";
    ruleFixMap.set(ruleId, (ruleFixMap.get(ruleId) ?? 0) + 1);
  }

  const avgRuleFixRate =
    ruleFixMap.size > 0
      ? [...ruleFixMap.values()].reduce((a, b) => a + b, 0) / ruleFixMap.size
      : 0;

  const batchCandidates = [...ruleFixMap.entries()]
    .filter(([, count]) => count > avgRuleFixRate * 2)
    .map(([ruleId, count]) => ({ ruleId, fixCount: count }))
    .sort((a, b) => b.fixCount - a.fixCount);

  return {
    openCount,
    fixedCount: fixedAlerts.length,
    weeksAnalyzed: weeks,
    avgFixesPerWeek: parseFloat(avgFixesPerWeek.toFixed(2)),
    trend: parseFloat(trend.toFixed(4)),
    trendDirection: trend > 0.05 ? "improving" : trend < -0.05 ? "declining" : "stable",
    projectedWeeksToZero,
    weeklyData,
    batchCandidates,
  };
}
