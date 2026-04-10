import {
  REPORT_VERSION,
  TOOL_NAME,
  REPORT_DESCRIPTION,
  REPORT_INSIGHT,
  REPORT_IMPROVES,
  buildCriteria,
  buildFormula,
} from "../report-metadata.mjs";

/**
 * Build the full resolution report object.
 *
 * @param {object} config - Validated config
 * @param {object} resolutionData - Results from ResolutionChecker per alert type
 * @param {string} defaultBranch - Detected or overridden default branch name
 * @param {{ totalFetched: number, cancelled: boolean, autoClosedCount: number, failedCloseCount: number }} state
 * @returns {object} complete report
 */
export function buildReport(config, resolutionData, defaultBranch, state) {
  const {
    codeScanningResolved = [],
    codeScanningStillOpen = [],
    secretScanningResolved = [],
    secretScanningStillOpen = [],
    dependabotResolved = [],
    dependabotStillOpen = [],
    failed = [],
    closeResults = [],
  } = resolutionData;

  const { totalFetched, cancelled, autoClosedCount = 0, failedCloseCount = 0 } = state;

  const totalResolved =
    codeScanningResolved.length +
    secretScanningResolved.length +
    dependabotResolved.length;

  const totalStillOpen =
    codeScanningStillOpen.length +
    secretScanningStillOpen.length +
    dependabotStillOpen.length;

  const totalOpen = totalResolved + totalStillOpen;

  const byType = {};

  if (config.alertTypes.includes("code-scanning")) {
    const csAutoClosed = closeResults.filter(
      (r) => r.type === "code-scanning" && r.success
    ).length;
    byType["code-scanning"] = {
      open: codeScanningResolved.length + codeScanningStillOpen.length,
      resolved: codeScanningResolved.length,
      autoClosed: csAutoClosed,
      failed: closeResults.filter(
        (r) => r.type === "code-scanning" && !r.success
      ).length,
    };
  }

  if (config.alertTypes.includes("secret-scanning")) {
    const ssAutoClosed = closeResults.filter(
      (r) => r.type === "secret-scanning" && r.success
    ).length;
    byType["secret-scanning"] = {
      open: secretScanningResolved.length + secretScanningStillOpen.length,
      resolved: secretScanningResolved.length,
      autoClosed: ssAutoClosed,
      failed: closeResults.filter(
        (r) => r.type === "secret-scanning" && !r.success
      ).length,
    };
  }

  if (config.alertTypes.includes("dependabot")) {
    const dbAutoClosed = closeResults.filter(
      (r) => r.type === "dependabot" && r.success
    ).length;
    byType["dependabot"] = {
      open: dependabotResolved.length + dependabotStillOpen.length,
      resolved: dependabotResolved.length,
      autoClosed: dbAutoClosed,
      failed: closeResults.filter(
        (r) => r.type === "dependabot" && !r.success
      ).length,
    };
  }

  const report = {
    metadata: {
      reportVersion: REPORT_VERSION,
      toolName: TOOL_NAME,
      description: REPORT_DESCRIPTION,
      insight: REPORT_INSIGHT,
      improves: REPORT_IMPROVES,
      repository: config.repo,
      generatedAt: new Date().toISOString(),
      metaTags: config.metaTags || {},
      inputs: {
        repo: config.repo,
        alertTypes: config.alertTypes,
        dryRun: config.dryRun,
        autoClose: config.autoClose,
        dismissReason: config.dismissReason,
        dismissComment: config.dismissComment,
        ref: config.ref || null,
        format: config.format,
        outputDir: config.outputDir,
        filename: config.filename || null,
        cancelled,
      },
      criteria: buildCriteria(config),
      formula: buildFormula(config),
    },
    summary: {
      defaultBranch,
      totalOpen,
      totalResolved,
      totalStillOpen,
      totalAutoClosed: autoClosedCount,
      totalFailed: failedCloseCount,
      byType,
    },
    resolutions: {
      codeScanningResolved: codeScanningResolved.map((a) => ({
        number: a.number,
        rule: a.rule?.id || a.rule_id || null,
        file:
          a.most_recent_instance?.location?.path ||
          a.location?.path ||
          null,
        severity:
          a.rule?.security_severity_level ||
          a.rule?.severity ||
          null,
        status: "resolved",
      })),
      codeScanningStillOpen: codeScanningStillOpen.map((a) => ({
        number: a.number,
        rule: a.rule?.id || a.rule_id || null,
        file:
          a.most_recent_instance?.location?.path ||
          a.location?.path ||
          null,
        severity:
          a.rule?.security_severity_level ||
          a.rule?.severity ||
          null,
        status: "open",
      })),
      secretScanningResolved: secretScanningResolved.map((a) => ({
        number: a.number,
        secretType: a.secret_type || null,
        validity: a.validity || null,
        status: "resolved",
      })),
      secretScanningStillOpen: secretScanningStillOpen.map((a) => ({
        number: a.number,
        secretType: a.secret_type || null,
        validity: a.validity || null,
        status: "open",
      })),
      dependabotResolved: dependabotResolved.map((a) => ({
        number: a.number,
        package:
          a.security_advisory?.cve_id ||
          a.dependency?.package?.name ||
          null,
        severity: a.security_advisory?.severity || null,
        state: a.state,
        status: "resolved",
      })),
      dependabotStillOpen: dependabotStillOpen.map((a) => ({
        number: a.number,
        package:
          a.security_advisory?.cve_id ||
          a.dependency?.package?.name ||
          null,
        severity: a.security_advisory?.severity || null,
        firstPatchedVersion:
          a.security_vulnerability?.first_patched_version?.identifier || null,
        status: "open",
      })),
      failed,
    },
  };

  return report;
}
