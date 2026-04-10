/**
 * Re-export code scanning alert endpoints from shared polyglot module.
 */

export {
  fetchCodeScanningAlerts,
  fetchCodeScanningAlert,
} from "../../../../../polyglot/github_sdk_api_security_alerts/mjs/src/github/endpoints/code-scanning-alerts.mjs";
