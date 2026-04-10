/**
 * SPPS Loader Lifecycle Module
 *
 * Registers app plugins: Code Repositories, Figma Files, Process Checklist, Form Builder, UI Component Metadata.
 */

import { appCodeRepositoriesPlugin } from "@internal/fastify-app-code-repositories";
import { appFigmaFilesPlugin } from "@internal/fastify-app-figma-files";
import { processChecklistPlugin } from "@internal/fastify-app-process-checklist";
import { formBuilderPlugin } from "@internal/fastify-app-form-builder";
import { uiComponentMetadataPlugin } from "@internal/fastify-app-ui-component-metadata";

/**
 * Register SPPS plugins on startup.
 * @param {import('fastify').FastifyInstance} server
 * @param {object} config
 */
export async function onStartup(server, config) {
  server.log.info("[lifecycle:spps_loader] Initializing SPPS app plugins...");

  try {
    server.log.info("[lifecycle:spps_loader] Registering App Code Repositories plugin");
    await server.register(appCodeRepositoriesPlugin, {
      appName: "code-repositories",
      adminAppName: "code-repositories",
      apiPrefix: "/~/api/code-repositories",
    });
    server.log.info("[lifecycle:spps_loader] Registered App Code Repositories plugin");

    server.log.info("[lifecycle:spps_loader] Registering App Figma Files plugin");
    await server.register(appFigmaFilesPlugin, {
      appName: "figma-files",
      adminAppName: "figma-files",
      apiPrefix: "/~/api/figma-files",
    });
    server.log.info("[lifecycle:spps_loader] Registered App Figma Files plugin");

    server.log.info("[lifecycle:spps_loader] Registering Process Checklist plugin");
    await server.register(processChecklistPlugin, {
      appName: "process-checklist",
      adminAppName: "process-checklist",
      apiPrefix: "/~/api/process_checklist",
    });
    server.log.info("[lifecycle:spps_loader] Registered Process Checklist plugin");

    server.log.info("[lifecycle:spps_loader] Registering Form Builder plugin");
    await server.register(formBuilderPlugin, {
      appName: "form-builder",
      adminAppName: "form-builder",
      apiPrefix: "/~/api/form-builder",
    });
    server.log.info("[lifecycle:spps_loader] Registered Form Builder plugin");

    server.log.info("[lifecycle:spps_loader] Registering UI Component Metadata plugin");
    await server.register(uiComponentMetadataPlugin, {
      appName: "ui-component-metadata",
      adminAppName: "ui-component-metadata",
      apiPrefix: "/~/api/ui-component-metadata",
    });
    server.log.info("[lifecycle:spps_loader] Registered UI Component Metadata plugin");

    server.log.info("[lifecycle:spps_loader] All SPPS plugins registered successfully");
  } catch (err) {
    server.log.error({ err, hookName: '200-spps_loader' }, '[lifecycle:spps_loader] SPPS plugin registration failed');
    throw err;
  }
}
