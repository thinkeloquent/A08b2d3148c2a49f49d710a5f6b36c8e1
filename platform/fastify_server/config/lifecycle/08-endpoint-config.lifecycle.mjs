import { createEndpointConfigSDK } from 'app-yaml-endpoints';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function onStartup(server, config) {
    server.log.info('[lifecycle:endpoint-config] Initializing EndpointConfigSDK...');

    try {
        const appEnv = (process.env.APP_ENV || 'dev').toLowerCase();
        const configDir =
            process.env.CONFIG_DIR ||
            path.join(__dirname, '..', '..', '..', 'common', 'config');
        const filePath = path.join(configDir, `endpoint.${appEnv}.yaml`);

        server.log.info({ appEnv, configDir, filePath }, '[lifecycle:endpoint-config] Resolved endpoint config file path');

        const sdk = createEndpointConfigSDK({ filePath });

        // Use STARTUP-resolved config (from hook 04) so that STARTUP-scoped
        // compute functions (e.g. {{fn:compute_gemini_api_key}}) are already
        // resolved. Falls back to raw AppYamlConfig if resolver didn't run.
        const resolvedConfig = server.configResolved || {};
        server.log.debug({ hasResolvedConfig: !!server.configResolved }, '[lifecycle:endpoint-config] Checking configResolved');
        const appConfig = server.config;
        const endpoints = resolvedConfig.endpoints || appConfig?.get?.('endpoints') || {};
        const intentMapping = resolvedConfig.intent_mapping || appConfig?.get?.('intent_mapping') || {};

        server.log.info({ endpointCount: Object.keys(endpoints).length }, '[lifecycle:endpoint-config] Loading endpoint config');
        sdk.loadConfig({ endpoints, intent_mapping: intentMapping });

        if (!server.hasDecorator('endpointConfigSdk')) {
            server.decorate('endpointConfigSdk', sdk);
            server.log.info('[lifecycle:endpoint-config] Decorated server with endpointConfigSdk');
        }

        server.log.info(
            { keys: sdk.listKeys() },
            '[lifecycle:endpoint-config] EndpointConfigSDK initialized successfully'
        );
    } catch (err) {
        server.log.error({ err, hookName: '08-endpoint-config' }, '[lifecycle:endpoint-config] EndpointConfigSDK initialization failed');
        throw err;
    }
}
