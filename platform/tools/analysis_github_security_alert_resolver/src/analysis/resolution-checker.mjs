import { fetchCodeScanningAlerts } from "../github/endpoints/code-scanning-alerts.mjs";

/**
 * Determines which open alerts have been resolved on the default branch.
 *
 * - Code scanning: re-fetches open alerts filtered by ref=defaultBranch.
 *   Alerts absent from that set are no longer present on the default branch → resolved.
 * - Secret scanning: checks each alert's locations API. If no location exists
 *   on the default branch commit tree → resolved.
 * - Dependabot: auto-managed by GitHub. Reports still-open alerts; any that
 *   are no longer "open" are considered resolved.
 */
export class ResolutionChecker {
  /**
   * Check code scanning resolutions by diffing open alerts against the
   * default-branch-filtered set.
   *
   * @param {object} ctx - Shared service context.
   * @param {object} params
   * @param {string} params.owner
   * @param {string} params.repo
   * @param {object[]} params.openAlerts - All currently open code-scanning alerts.
   * @param {string} params.defaultBranch - Default branch name (e.g., "main").
   * @returns {Promise<{ resolved: object[], stillOpen: object[], errors: object[] }>}
   */
  async checkCodeScanningResolutions(ctx, { owner, repo, openAlerts, defaultBranch }) {
    ctx.log(`Checking code-scanning resolutions against ref=${defaultBranch}`);

    const errors = [];
    const onDefaultBranchNumbers = new Set();

    try {
      for await (const alert of fetchCodeScanningAlerts(ctx, {
        owner,
        repo,
        state: "open",
        ref: `refs/heads/${defaultBranch}`,
      })) {
        if (ctx.cancelled.value) break;
        onDefaultBranchNumbers.add(alert.number);
      }
    } catch (err) {
      ctx.log(`Failed to fetch code-scanning alerts by ref: ${err.message}`, "warn");
      errors.push({ type: "code-scanning", phase: "ref-fetch", error: err.message });
      // Cannot determine resolutions without the ref-filtered set — return all as stillOpen
      return { resolved: [], stillOpen: openAlerts, errors };
    }

    const resolved = [];
    const stillOpen = [];

    for (const alert of openAlerts) {
      if (onDefaultBranchNumbers.has(alert.number)) {
        stillOpen.push(alert);
      } else {
        resolved.push(alert);
      }
    }

    ctx.log(
      `Code scanning: ${resolved.length} resolved, ${stillOpen.length} still open on default branch`
    );

    return { resolved, stillOpen, errors };
  }

  /**
   * Check secret scanning resolutions by comparing each location's blob SHA
   * against the file currently on the default branch.
   *
   * A secret is "resolved" when none of its commit-type locations still have
   * a matching blob on the default branch HEAD — meaning the file was either
   * deleted or modified so the exact content containing the secret is gone.
   *
   * @param {object} ctx - Shared service context.
   * @param {object} params
   * @param {string} params.owner
   * @param {string} params.repo
   * @param {object[]} params.openAlerts - All currently open secret-scanning alerts.
   * @param {string} params.defaultBranch - Default branch name.
   * @returns {Promise<{ resolved: object[], stillOpen: object[], errors: object[] }>}
   */
  async checkSecretScanningResolutions(ctx, { owner, repo, openAlerts, defaultBranch }) {
    ctx.log(`Checking secret-scanning resolutions for ${openAlerts.length} alerts`);

    const resolved = [];
    const stillOpen = [];
    const errors = [];

    // Cache file blob SHAs on the default branch to avoid redundant API calls
    const blobCache = new Map();

    for (const alert of openAlerts) {
      if (ctx.cancelled.value) break;

      try {
        const locations = await ctx.makeRequest(
          `GET /repos/${owner}/${repo}/secret-scanning/alerts/${alert.number}/locations`
        );

        const locationList = Array.isArray(locations) ? locations : [];

        if (locationList.length === 0) {
          // No locations at all → resolved
          resolved.push(alert);
          continue;
        }

        const commitLocations = locationList.filter(
          (loc) => loc.type === "commit" && loc.details?.path && loc.details?.blob_sha
        );

        if (commitLocations.length === 0) {
          // No commit-type locations with usable path/blob data → resolved
          resolved.push(alert);
          continue;
        }

        // Check if any location's blob still matches the file on the default branch
        let stillPresentOnDefault = false;

        for (const loc of commitLocations) {
          const filePath = loc.details.path;
          const blobSha = loc.details.blob_sha;

          let currentBlobSha;
          if (blobCache.has(filePath)) {
            currentBlobSha = blobCache.get(filePath); // null = file deleted
          } else {
            try {
              const fileData = await ctx.makeRequest(
                `GET /repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
                { ref: defaultBranch }
              );
              currentBlobSha = fileData.sha || null;
            } catch (err) {
              if (err.status === 404) {
                // File no longer exists on default branch
                currentBlobSha = null;
              } else {
                throw err;
              }
            }
            blobCache.set(filePath, currentBlobSha);
          }

          if (currentBlobSha && currentBlobSha === blobSha) {
            stillPresentOnDefault = true;
            break;
          }
        }

        if (stillPresentOnDefault) {
          stillOpen.push(alert);
        } else {
          resolved.push(alert);
        }
      } catch (err) {
        ctx.log(
          `Failed to check secret alert #${alert.number}: ${err.message}`,
          "warn"
        );
        errors.push({
          number: alert.number,
          type: "secret-scanning",
          phase: "blob-check",
          error: err.message,
        });
        // Conservative: treat as stillOpen when we cannot check
        stillOpen.push(alert);
      }
    }

    ctx.log(
      `Secret scanning: ${resolved.length} resolved, ${stillOpen.length} still open`
    );

    return { resolved, stillOpen, errors };
  }

  /**
   * Check Dependabot resolutions.
   *
   * Dependabot alerts are auto-managed by GitHub when the dependency is updated.
   * We report any alert that is no longer "open" as resolved, and all truly
   * open ones as stillOpen.
   *
   * @param {object} ctx - Shared service context.
   * @param {object} params
   * @param {string} params.owner
   * @param {string} params.repo
   * @param {object[]} params.openAlerts - All currently open dependabot alerts.
   * @returns {Promise<{ resolved: object[], stillOpen: object[], errors: object[] }>}
   */
  async checkDependabotResolutions(ctx, { owner, repo, openAlerts }) {
    ctx.log(`Checking dependabot resolutions for ${openAlerts.length} alerts`);

    const resolved = [];
    const stillOpen = [];

    for (const alert of openAlerts) {
      if (alert.state !== "open") {
        resolved.push(alert);
      } else {
        stillOpen.push(alert);
      }
    }

    ctx.log(
      `Dependabot: ${resolved.length} resolved, ${stillOpen.length} still open`
    );

    return { resolved, stillOpen, errors: [] };
  }
}
