/**
 * Re-export all alert dismiss/resolve/close endpoints and fetchDefaultBranch
 * from shared polyglot module.
 */

export {
  fetchDefaultBranch,
  dismissCodeScanningAlert,
  resolveSecretScanningAlert,
  dismissDependabotAlert,
} from "../../../../../polyglot/github_sdk_api_security_alerts/mjs/src/github/endpoints/alert-dismiss.mjs";
