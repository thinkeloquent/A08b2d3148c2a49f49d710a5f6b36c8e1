/**
 * Re-export alert dismiss/resolve endpoints from shared polyglot module.
 */

export {
  fetchDefaultBranch,
  resolveSecretScanningAlert,
} from "../../../../../polyglot/github_sdk_api_security_alerts/mjs/src/github/endpoints/alert-dismiss.mjs";
