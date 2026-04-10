/**
 * Static report metadata for user-status analysis.
 */

export const REPORT_VERSION = "1.0";
export const TOOL_NAME = "user-status";
export const REPORT_DESCRIPTION = "User Status: Checks whether GitHub accounts are active, suspended, or not found.";
export const REPORT_INSIGHT = "Insight: Detects stale accounts, offboarded contributors, or suspended users that may still appear in team rosters.";
export const REPORT_ANALYSIS = "Validates each username by calling the GitHub user profile endpoint (GET /users/{username}). A 200 response means the account is active. On 404, falls back to the GitHub search API — if the search finds the user, the account exists but is suspended; if search also fails, the account is classified as not found. Results are validated through a Zod schema.";
export const REPORT_IMPROVES = "Team Roster & Account Hygiene";

export const REPORT_PLAIN_ENGLISH = {
  what: "Bulk-validates a list of GitHub usernames, classifying each as Active, Suspended, Not Found, or Error — an operational hygiene check for team rosters.",
  how: "For each username, calls GET /users/{username}. On HTTP 200 → Active. On HTTP 404, calls the GitHub search API: if found → Suspended (account exists but profile inaccessible); if not found → Not Found / Suspended. Other errors → Error status. Results are Zod-validated.",
  why: "In large organizations, offboarded employees may retain GitHub accounts or be suspended without removal from team rosters — this tool provides an automated access control audit.",
  main_logic: "Parse comma-separated usernames from config → apply totalRecords limit → for each username: GET /users/{username} → 200 = Active → 404 = search API fallback (found = Suspended, not found = Not Found / Suspended) → other error = Error → validate via Zod schema → apply delay between requests → compute summary (active/suspended/notFound/error counts + success rate %) → output report.",
};

export const REPORT_CRITERIA = [
  "HTTP 200 response from /users/{username} = Active user",
  "HTTP 404 response + user found in search = Suspended user",
  "HTTP 404 response + user not found in search = Not Found / Suspended user",
  "Other HTTP errors = Error status",
];

export const REPORT_FORMULA = [
  'status = response.status === 200 ? "Active" : await searchForUser(username)',
  'searchForUser = searchResult.found ? "Suspended" : "Not Found / Suspended"',
  'errorHandling = catchError ? "Error" : status',
];

/**
 * Build dynamic criteria entries based on config.
 * @param {object} config
 * @returns {string[]}
 */
export function buildCriteria(config) {
  return [
    ...REPORT_CRITERIA,
    `Total records limit enforced: ${
      config.totalRecords > 0 ? config.totalRecords : "No limit"
    }`,
  ];
}
