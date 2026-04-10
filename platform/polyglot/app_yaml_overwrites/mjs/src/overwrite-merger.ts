
import { deepMerge } from './utils.js';
import { create, ILogger } from './logger.js';

export interface IOverwriteMerger {
    mergeEnv(envMappings: Record<string, string>): any;
    mergeContext(context: any, templateMappings: Record<string, string>): any;
    getMerged(): any;
}

export class OverwriteMerger implements IOverwriteMerger {
    private config: any;
    private logger: ILogger;

    constructor(config: any, logger?: ILogger) {
        this.config = { ...config };
        this.logger = logger ?? create('app-yaml-overwrites', 'overwrite-merger.ts');
        this.logger.debug('OverwriteMerger initialized', { configKeys: Object.keys(config) });
    }

    mergeEnv(envMappings: Record<string, string>): any {
        this.logger.debug('Merging env overwrites', { mappings: Object.keys(envMappings) });
        for (const [key, envVarName] of Object.entries(envMappings)) {
            if (typeof envVarName === 'string') {
                const envValue = process.env[envVarName];
                if (envValue !== undefined && key in this.config) {
                    this.config[key] = envValue;
                }
            }
        }
        return this.config;
    }

    mergeContext(context: any, templateMappings: Record<string, string>): any {
        this.logger.debug('Merging context overwrites');
        // TODO: Implement context merge
        return this.config;
    }

    getMerged(): any {
        return this.config;
    }
}

/**
 * Legacy utility function
 */
export function applyOverwrites(originalConfig: any, overwriteSection: any): any {
    if (!overwriteSection) return originalConfig;
    return deepMerge(originalConfig, overwriteSection);
}
