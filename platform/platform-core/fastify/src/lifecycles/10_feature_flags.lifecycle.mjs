/**
 * 09-feature-flags.lifecycle.mjs
 *
 * Decorates the server with feature flags and feature options, and registers
 * public REST endpoints so frontends can read them at runtime.
 *
 * YAML source: common/config/feature_flags.yml
 *
 * Backend:
 *   server.featureFlags              → flags object
 *   server.featureOptions            → options object
 *   server.isFeatureEnabled(app, flag)          → boolean
 *   server.getFeatureOption(app, area, key)     → value | undefined
 *
 * Frontend:
 *   GET /~/api/feature-flags              → { feature_flags, feature_options }
 *   GET /~/api/feature-flags/:app         → { app, flags, options }
 */

export async function onStartup(server) {
  const hookTag = "[lifecycle:feature-flags]";

  // ── Read from AppYamlConfig ────────────────────────────────────────────────
  let flags = {};
  let options = {};
  if (server.config && typeof server.config.getNested === "function") {
    flags = server.config.getNested(["feature_flags"], {}) ?? {};
    options = server.config.getNested(["feature_options"], {}) ?? {};
  }

  const appCount = Object.keys(flags).length;
  let flagCount = 0;
  for (const app of Object.values(flags)) {
    if (app && typeof app === "object") flagCount += Object.keys(app).length;
  }

  const optAppCount = Object.keys(options).length;
  let optCount = 0;
  for (const app of Object.values(options)) {
    if (app && typeof app === "object") optCount += Object.keys(app).length;
  }

  server.log.info(`${hookTag} Loaded ${flagCount} flag(s) across ${appCount} app(s), ${optCount} option area(s) across ${optAppCount} app(s)`);

  // ── Decorate server ────────────────────────────────────────────────────────
  if (!server.hasDecorator("featureFlags")) {
    server.decorate("featureFlags", flags);
  }

  if (!server.hasDecorator("featureOptions")) {
    server.decorate("featureOptions", options);
  }

  if (!server.hasDecorator("isFeatureEnabled")) {
    /**
     * Check whether a feature flag is enabled.
     *
     * @param {string} app   - App key, e.g. "figma_component_inspector"
     * @param {string} flag  - Flag key, e.g. "image_cache"
     * @returns {boolean}      Defaults to `true` if the flag is missing.
     */
    server.decorate("isFeatureEnabled", (app, flag) => {
      const entry = flags[app]?.[flag];
      if (entry && typeof entry === "object" && "enabled" in entry) {
        return !!entry.enabled;
      }
      return true;
    });
  }

  if (!server.hasDecorator("getFeatureOption")) {
    /**
     * Get a feature option value.
     *
     * @param {string} app   - App key, e.g. "figma_component_inspector"
     * @param {string} area  - Feature area, e.g. "image"
     * @param {string} key   - Option key, e.g. "image_rendering_type"
     * @returns {*}            The value, or undefined if not set.
     */
    server.decorate("getFeatureOption", (app, area, key) => {
      return options[app]?.[area]?.[key];
    });
  }

  // ── REST endpoints ─────────────────────────────────────────────────────────
  // GET /~/api/feature-flags → all flags + options
  server.get("/~/api/feature-flags", async (_request, _reply) => {
    return { feature_flags: flags, feature_options: options };
  });
  server.log.info(`${hookTag} Registered route: GET /~/api/feature-flags`);

  // GET /~/api/feature-flags/:app → flags + options for one app
  server.get("/~/api/feature-flags/:app", async (request, reply) => {
    const { app } = request.params;
    const appFlags = flags[app];
    const appOptions = options[app];
    if (!appFlags && !appOptions) {
      return reply.status(404).send({
        error: "not_found",
        message: `No feature flags or options defined for app "${app}"`,
      });
    }
    return { app, flags: appFlags ?? {}, options: appOptions ?? {} };
  });
  server.log.info(`${hookTag} Registered route: GET /~/api/feature-flags/:app`);
}
