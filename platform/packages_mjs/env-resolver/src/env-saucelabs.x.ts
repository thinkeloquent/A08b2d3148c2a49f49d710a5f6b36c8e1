import { resolve, resolveInt } from '@internal/env-resolve';

export interface SaucelabsEnv {
    username: string | undefined;
    accessKey: string | undefined;
    region: string;
    baseUrl: string;
    timeout: number;
    browser: string;
    browserVersion: string;
    platform: string;
    tunnelName: string | undefined;
}

export function resolveSaucelabsEnv(config?: Record<string, any>): SaucelabsEnv {
    return {
        username: resolve(undefined, ['SAUCE_USERNAME', 'SAUCELABS_USERNAME'], config, 'username', undefined),
        accessKey: resolve(undefined, ['SAUCE_ACCESS_KEY', 'SAUCELABS_ACCESS_KEY'], config, 'accessKey', undefined),
        region: resolve(undefined, ['SAUCE_REGION'], config, 'region', 'us-west-1'),
        baseUrl: resolve(undefined, ['SAUCELABS_BASE_URL'], config, 'baseUrl', 'https://api.us-west-1.saucelabs.com'),
        timeout: resolveInt(undefined, ['SAUCE_TIMEOUT'], config, 'timeout', 30),
        browser: resolve(undefined, ['SAUCE_BROWSER'], config, 'browser', 'chrome'),
        browserVersion: resolve(undefined, ['SAUCE_BROWSER_VERSION'], config, 'browserVersion', 'latest'),
        platform: resolve(undefined, ['SAUCE_PLATFORM'], config, 'platform', 'Windows 11'),
        tunnelName: resolve(undefined, ['SAUCE_TUNNEL_NAME'], config, 'tunnelName', undefined),
    };
}
