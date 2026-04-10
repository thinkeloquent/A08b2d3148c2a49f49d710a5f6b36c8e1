/**
 * Unit tests for app-yaml-load loader module.
 *
 * Tests cover:
 * - resolveConfigDir: override, env var, fallback, empty string
 * - buildConfigFiles: canonical 5-file list
 * - loadAppYamlConfig: end-to-end
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { resolveConfigDir, buildConfigFiles, loadAppYamlConfig } from '../dist/index.js';
import { AppYamlConfig } from '../../app_yaml_static_config/mjs/dist/core.js';

function resetSingleton() {
    AppYamlConfig._resetForTesting();
}

describe('resolveConfigDir', () => {
    const originalEnv = process.env.CONFIG_DIR;

    beforeEach(() => {
        delete process.env.CONFIG_DIR;
    });

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.CONFIG_DIR = originalEnv;
        } else {
            delete process.env.CONFIG_DIR;
        }
    });

    it('should use override when provided', () => {
        process.env.CONFIG_DIR = '/env/path';
        const result = resolveConfigDir('/explicit/path');
        expect(result).toBe('/explicit/path');
    });

    it('should use CONFIG_DIR env var when no override', () => {
        process.env.CONFIG_DIR = '/env/config';
        const result = resolveConfigDir();
        expect(result).toBe('/env/config');
    });

    it('should use callerDir fallback', () => {
        const result = resolveConfigDir(undefined, '/a/b/c/loader');
        expect(result).toContain(path.join('common', 'config'));
    });

    it('should throw when nothing available', () => {
        expect(() => resolveConfigDir()).toThrow('configDir is required');
    });

    it('should throw on empty string override', () => {
        expect(() => resolveConfigDir('')).toThrow('must not be an empty string');
    });

    it('should throw on empty CONFIG_DIR env var', () => {
        process.env.CONFIG_DIR = '';
        expect(() => resolveConfigDir()).toThrow('must not be an empty string');
    });
});

describe('buildConfigFiles', () => {
    it('should return 5 canonical files', () => {
        const files = buildConfigFiles('/config', 'dev');
        expect(files).toHaveLength(5);
    });

    it('should include base files', () => {
        const files = buildConfigFiles('/config', 'dev');
        expect(files).toContain(path.join('/config', 'base.yml'));
        expect(files).toContain(path.join('/config', 'security.yml'));
        expect(files).toContain(path.join('/config', 'api-release-date.yml'));
    });

    it('should include env-specific files', () => {
        const files = buildConfigFiles('/config', 'staging');
        expect(files).toContain(path.join('/config', 'server.staging.yaml'));
        expect(files).toContain(path.join('/config', 'endpoint.staging.yaml'));
    });
});

describe('loadAppYamlConfig', () => {
    let tmpDir;

    beforeEach(() => {
        resetSingleton();
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loader-test-'));
        fs.writeFileSync(path.join(tmpDir, 'base.yml'), 'app:\n  name: test-app\n');
        fs.writeFileSync(path.join(tmpDir, 'security.yml'), 'cors:\n  origins: ["*"]\n');
        fs.writeFileSync(path.join(tmpDir, 'api-release-date.yml'), 'api:\n  version: 1\n');
        fs.writeFileSync(path.join(tmpDir, 'server.test.yaml'), 'server:\n  port: 3000\n');
        fs.writeFileSync(path.join(tmpDir, 'endpoint.test.yaml'), 'endpoint:\n  base: /api\n');
    });

    afterEach(() => {
        resetSingleton();
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should load config with explicit configDir', async () => {
        const result = await loadAppYamlConfig({ configDir: tmpDir, appEnv: 'test' });
        expect(result.config).toBeDefined();
        expect(result.sdk).toBeDefined();
        expect(result.config.getNested(['app', 'name'])).toBe('test-app');
    });
});
