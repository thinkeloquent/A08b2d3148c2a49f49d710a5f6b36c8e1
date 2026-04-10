/**
 * Security Alert Triage Analyzer
 *
 * Normalizes severity across all three GitHub alert types, computes a priority
 * score for each alert, and groups results for prioritized triage output.
 *
 * Priority Score = severityWeight × typeWeight × recencyWeight
 *   Severity:  critical=4, high=3, medium=2, low=1
 *   Type:      secret-scanning=1.5, code-scanning=1.2, dependabot=1.0
 *   Recency:   <7 days=1.5, <30 days=1.2, else=1.0
 */

// ── Severity weight map ──────────────────────────────────────────────────────

const SEVERITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

// ── Type weight map ──────────────────────────────────────────────────────────

const TYPE_WEIGHTS = {
  "secret-scanning": 1.5,
  "code-scanning": 1.2,
  dependabot: 1.0,
};

// ── CodeQL severity normalization ────────────────────────────────────────────

const CODESCANNING_SEVERITY_MAP = {
  error: "critical",
  warning: "high",
  note: "medium",
  // pass-through values already normalized
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

// ── Secret scanning validity → severity ─────────────────────────────────────

const SECRET_VALIDITY_MAP = {
  active: "critical",
  possibly_valid: "high",
  unknown: "medium",
  inactive: "low",
  invalid: "low",
};

export class TriageAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze and prioritize security alerts from all types.
   * @param {{ codeScanningAlerts: object[], secretScanningAlerts: object[], dependabotAlerts: object[] }} data
   * @param {{ log: Function }} deps
   * @returns {object} triage analytics
   */
  analyze(data, { log }) {
    const { codeScanningAlerts, secretScanningAlerts, dependabotAlerts } = data;

    const now = new Date();

    // ── Normalize all alerts ─────────────────────────────────────────────────

    const normalizedAlerts = [
      ...this._normalizeCodeScanning(codeScanningAlerts, now),
      ...this._normalizeSecretScanning(secretScanningAlerts, now),
      ...this._normalizeDependabot(dependabotAlerts, now),
    ];

    if (normalizedAlerts.length === 0) {
      return this.emptyResult();
    }

    // ── Apply minSeverity filter ─────────────────────────────────────────────

    const filtered = this.options.minSeverity
      ? normalizedAlerts.filter(
          (a) =>
            SEVERITY_ORDER.indexOf(a.normalizedSeverity) <=
            SEVERITY_ORDER.indexOf(this._normalizeMinSeverity(this.options.minSeverity))
        )
      : normalizedAlerts;

    // ── Sort by priority score descending ────────────────────────────────────

    const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);

    // ── Group by type ────────────────────────────────────────────────────────

    const byType = this._groupByType(sorted);

    // ── Group by severity ────────────────────────────────────────────────────

    const bySeverity = this._groupBySeverity(sorted);

    // ── Top affected files (code-scanning only) ──────────────────────────────

    const topAffectedFiles = this._computeTopAffectedFiles(
      codeScanningAlerts,
      10
    );

    // ── Summary counts ───────────────────────────────────────────────────────

    const summary = {
      totalAlerts: sorted.length,
      totalCodeScanning: sorted.filter((a) => a.type === "code-scanning").length,
      totalSecretScanning: sorted.filter((a) => a.type === "secret-scanning").length,
      totalDependabot: sorted.filter((a) => a.type === "dependabot").length,
      bySeverityCount: {
        critical: sorted.filter((a) => a.normalizedSeverity === "critical").length,
        high: sorted.filter((a) => a.normalizedSeverity === "high").length,
        medium: sorted.filter((a) => a.normalizedSeverity === "medium").length,
        low: sorted.filter((a) => a.normalizedSeverity === "low").length,
      },
      alertTypes: this.options.alertTypes || ["code-scanning", "secret-scanning", "dependabot"],
      alertState: this.options.alertState || "open",
      minSeverityApplied: this.options.minSeverity || null,
    };

    return {
      summary,
      prioritizedAlerts: sorted,
      byType,
      bySeverity,
      topAffectedFiles,
    };
  }

  // ── Normalization helpers ────────────────────────────────────────────────

  _normalizeCodeScanning(alerts, now) {
    return (alerts || []).map((alert) => {
      const rawSeverity =
        alert.rule?.security_severity_level ||
        alert.rule?.severity ||
        "note";
      const normalizedSeverity =
        CODESCANNING_SEVERITY_MAP[rawSeverity] || "medium";
      const priorityScore = this._computePriority(
        normalizedSeverity,
        "code-scanning",
        alert.created_at,
        now
      );

      return {
        type: "code-scanning",
        number: alert.number,
        state: alert.state,
        normalizedSeverity,
        rawSeverity,
        priorityScore: round(priorityScore),
        rule: alert.rule?.id || null,
        ruleDescription: alert.rule?.description || null,
        tool: alert.tool?.name || null,
        location: alert.most_recent_instance?.location?.path || null,
        created_at: alert.created_at,
        html_url: alert.html_url || null,
        summary: alert.most_recent_instance?.message?.text || null,
      };
    });
  }

  _normalizeSecretScanning(alerts, now) {
    return (alerts || []).map((alert) => {
      const validity = alert.validity || "unknown";
      const normalizedSeverity = SECRET_VALIDITY_MAP[validity] || "medium";
      const priorityScore = this._computePriority(
        normalizedSeverity,
        "secret-scanning",
        alert.created_at,
        now
      );

      return {
        type: "secret-scanning",
        number: alert.number,
        state: alert.state,
        normalizedSeverity,
        rawSeverity: validity,
        priorityScore: round(priorityScore),
        secretType: alert.secret_type || null,
        secretTypeDisplayName: alert.secret_type_display_name || null,
        validity,
        created_at: alert.created_at,
        html_url: alert.html_url || null,
        summary: `${alert.secret_type_display_name || alert.secret_type || "Secret"} detected`,
      };
    });
  }

  _normalizeDependabot(alerts, now) {
    return (alerts || []).map((alert) => {
      const rawSeverity =
        alert.security_advisory?.severity ||
        alert.security_vulnerability?.severity ||
        "medium";
      const normalizedSeverity = rawSeverity.toLowerCase();
      const priorityScore = this._computePriority(
        normalizedSeverity,
        "dependabot",
        alert.created_at,
        now
      );

      return {
        type: "dependabot",
        number: alert.number,
        state: alert.state,
        normalizedSeverity,
        rawSeverity,
        priorityScore: round(priorityScore),
        packageName:
          alert.security_vulnerability?.package?.name ||
          alert.dependency?.package?.name ||
          null,
        ecosystem:
          alert.security_vulnerability?.package?.ecosystem ||
          alert.dependency?.package?.ecosystem ||
          null,
        manifestPath: alert.dependency?.manifest_path || null,
        cvss: alert.security_advisory?.cvss?.score || null,
        cveId: alert.security_advisory?.cve_id || null,
        ghsaId: alert.security_advisory?.ghsa_id || null,
        created_at: alert.created_at,
        html_url: alert.html_url || null,
        summary: alert.security_advisory?.summary || null,
      };
    });
  }

  // ── Priority scoring ─────────────────────────────────────────────────────

  _computePriority(normalizedSeverity, type, createdAt, now) {
    const sevWeight = SEVERITY_WEIGHTS[normalizedSeverity] || 1;
    const typeWeight = TYPE_WEIGHTS[type] || 1.0;
    const ageMs = now - new Date(createdAt);
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyWeight = ageDays < 7 ? 1.5 : ageDays < 30 ? 1.2 : 1.0;
    return sevWeight * typeWeight * recencyWeight;
  }

  // ── minSeverity normalization (CodeQL scale → common scale) ─────────────

  _normalizeMinSeverity(minSeverity) {
    // CLI accepts CodeQL-style names too; map to common
    const map = {
      note: "medium",
      warning: "high",
      error: "critical",
      critical: "critical",
      high: "high",
      medium: "medium",
      low: "low",
    };
    return map[minSeverity] || minSeverity;
  }

  // ── Grouping helpers ─────────────────────────────────────────────────────

  _groupByType(alerts) {
    const groups = {
      "code-scanning": [],
      "secret-scanning": [],
      dependabot: [],
    };
    for (const alert of alerts) {
      if (groups[alert.type]) {
        groups[alert.type].push(alert);
      }
    }
    return groups;
  }

  _groupBySeverity(alerts) {
    const groups = { critical: [], high: [], medium: [], low: [] };
    for (const alert of alerts) {
      if (groups[alert.normalizedSeverity]) {
        groups[alert.normalizedSeverity].push(alert);
      }
    }
    return groups;
  }

  _computeTopAffectedFiles(codeScanningAlerts, topN) {
    const fileMap = new Map();

    for (const alert of codeScanningAlerts || []) {
      const filePath = alert.most_recent_instance?.location?.path;
      if (!filePath) continue;

      if (!fileMap.has(filePath)) {
        fileMap.set(filePath, { path: filePath, alertCount: 0, severities: [] });
      }
      const entry = fileMap.get(filePath);
      entry.alertCount++;
      const sev =
        CODESCANNING_SEVERITY_MAP[
          alert.rule?.security_severity_level || alert.rule?.severity || "note"
        ] || "medium";
      entry.severities.push(sev);
    }

    return Array.from(fileMap.values())
      .sort((a, b) => b.alertCount - a.alertCount)
      .slice(0, topN);
  }

  emptyResult() {
    return {
      summary: {
        totalAlerts: 0,
        totalCodeScanning: 0,
        totalSecretScanning: 0,
        totalDependabot: 0,
        bySeverityCount: { critical: 0, high: 0, medium: 0, low: 0 },
        alertTypes: this.options.alertTypes || [],
        alertState: this.options.alertState || "open",
        minSeverityApplied: this.options.minSeverity || null,
      },
      prioritizedAlerts: [],
      byType: {
        "code-scanning": [],
        "secret-scanning": [],
        dependabot: [],
      },
      bySeverity: { critical: [], high: [], medium: [], low: [] },
      topAffectedFiles: [],
    };
  }
}

function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
