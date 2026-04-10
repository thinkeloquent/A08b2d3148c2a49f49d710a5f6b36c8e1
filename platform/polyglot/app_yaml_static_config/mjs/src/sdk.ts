import { glob } from 'glob';
import * as path from 'path';
import { AppYamlConfig } from './core.js';
import { InitOptions } from './types.js';

export class AppYamlConfigSDK {
    private config: AppYamlConfig;

    constructor(config: AppYamlConfig) {
        this.config = config;
    }

    static async fromDirectory(configDir: string): Promise<AppYamlConfigSDK> {
        const files = await glob(path.join(configDir, "*.{yaml,yml}"));
        await AppYamlConfig.initialize({ files, configDir });
        return new AppYamlConfigSDK(AppYamlConfig.getInstance());
    }

    get(key: string): unknown {
        const value = this.config.get(key);
        return value === undefined ? undefined : structuredClone(value);
    }

    getNested(keys: string[]): unknown {
        const value = this.config.getNested(keys);
        return value === undefined ? undefined : structuredClone(value);
    }

    getAll(): Record<string, unknown> {
        return structuredClone(this.config.getAll());
    }

    listProviders(): string[] {
        const providers = this.config.get<Record<string, unknown>>('providers') ?? {};
        return Object.keys(providers);
    }

    listServices(): string[] {
        const services = this.config.get<Record<string, unknown>>('services') ?? {};
        return Object.keys(services);
    }

    listStorages(): string[] {
        const storage = this.config.get<Record<string, unknown>>('storage') ?? {};
        return Object.keys(storage);
    }
}
