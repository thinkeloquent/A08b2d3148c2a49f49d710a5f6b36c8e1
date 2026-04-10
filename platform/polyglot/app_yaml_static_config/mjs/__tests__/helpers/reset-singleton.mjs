/**
 * Utility to reset the AppYamlConfig singleton between tests.
 */
import { AppYamlConfig } from '../../dist/core.js';

/**
 * Reset the AppYamlConfig singleton.
 * This is needed because the singleton persists across test files.
 */
export function resetAppYamlConfigSingleton() {
    AppYamlConfig._resetForTesting();
}
