/**
 * FQDP (Fully Qualified Design Path) Utility
 *
 * Generates and parses FQDP identifiers for entities in the hierarchy.
 * Compound slug format: org-slug>>workspace-slug>>team-slug>>app-slug>>project-slug>>resource-slug
 */

const SEPARATOR = ">>";

/**
 * Convert a name to a local slug part ([a-z0-9-]).
 * @param {string} name
 * @returns {string}
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a compound slug from a parent slug and a name.
 * @param {string|null} parentSlug
 * @param {string} name
 * @returns {string}
 */
export function buildCompoundSlug(parentSlug, name) {
  const localSlug = slugify(name);
  return parentSlug ? parentSlug + SEPARATOR + localSlug : localSlug;
}

/**
 * Get the list of descendant table names for a given entity type.
 * Used for cascading slug updates.
 * @param {string} entityType
 * @returns {string[]}
 */
export function getDescendantTableNames(entityType) {
  const hierarchy = {
    organization: [
      "fqdp_workspaces",
      "fqdp_teams",
      "fqdp_applications",
      "fqdp_projects",
      "fqdp_resources",
    ],
    workspace: [
      "fqdp_teams",
      "fqdp_applications",
      "fqdp_projects",
      "fqdp_resources",
    ],
    team: ["fqdp_applications", "fqdp_projects", "fqdp_resources"],
    application: ["fqdp_projects", "fqdp_resources"],
    project: ["fqdp_resources"],
    resource: [],
  };
  return hierarchy[entityType] || [];
}

// ---- Deprecated exports (backward compat) ----

/**
 * @deprecated Use buildCompoundSlug instead.
 * Generate a FQDP identifier from hierarchy slugs.
 */
export function generateFQDP(
  orgSlug,
  workspaceSlug,
  teamSlug,
  appSlug,
  projectSlug,
  fileSlug,
) {
  return [orgSlug, workspaceSlug, teamSlug, appSlug, projectSlug, fileSlug]
    .map((s) => s.toLowerCase())
    .join("/");
}

/**
 * @deprecated Use compound slugs instead.
 * Parse a FQDP identifier into its component parts.
 */
export function parseFQDP(fqdpId) {
  if (!fqdpId) return null;
  const parts = fqdpId.split("/");
  if (parts.length !== 6) return null;
  return {
    orgSlug: parts[0],
    workspaceSlug: parts[1],
    teamSlug: parts[2],
    appSlug: parts[3],
    projectSlug: parts[4],
    fileSlug: parts[5],
  };
}
