/**
 * Unit tests for SDK module.
 *
 * Tests cover:
 * - Builder pattern
 * - Configuration validation
 * - Multi-app builder
 */

import { describe, it, expect } from 'vitest';
import {
  createStaticAppLoader,
  createMultiAppLoader,
  validateConfig,
  StaticAppLoaderBuilder,
  MultiAppBuilder,
} from '../src/sdk.js';

describe('StaticAppLoaderBuilder', () => {
  describe('Statement Coverage', () => {
    it('should create builder with factory function', () => {
      const builder = createStaticAppLoader();

      expect(builder).toBeInstanceOf(StaticAppLoaderBuilder);
    });

    it('should chain methods and build valid config', () => {
      const config = createStaticAppLoader()
        .appName('dashboard')
        .rootPath('/var/www/dist')
        .spaMode(true)
        .templateEngine('none')
        .urlPrefix('/static')
        .maxAge(3600)
        .defaultContext({ version: '1.0.0' })
        .build();

      expect(config.appName).toBe('dashboard');
      expect(config.rootPath).toBe('/var/www/dist');
      expect(config.spaMode).toBe(true);
      expect(config.templateEngine).toBe('none');
      expect(config.urlPrefix).toBe('/static');
      expect(config.maxAge).toBe(3600);
      expect(config.defaultContext).toEqual({ version: '1.0.0' });
    });
  });

  describe('Error Handling', () => {
    it('should throw on invalid config', () => {
      expect(() => {
        createStaticAppLoader()
          .appName('') // Invalid: empty
          .rootPath('/var/www/dist')
          .build();
      }).toThrow();
    });

    it('should throw on missing required fields', () => {
      expect(() => {
        createStaticAppLoader().build();
      }).toThrow();
    });
  });

  describe('toInput', () => {
    it('should return raw config without validation', () => {
      const input = createStaticAppLoader()
        .appName('test')
        .rootPath('/path')
        .toInput();

      expect(input.appName).toBe('test');
      expect(input.rootPath).toBe('/path');
    });
  });
});

describe('MultiAppBuilder', () => {
  describe('Statement Coverage', () => {
    it('should create builder with factory function', () => {
      const builder = createMultiAppLoader();

      expect(builder).toBeInstanceOf(MultiAppBuilder);
    });

    it('should add apps using builder function', () => {
      const config = createMultiAppLoader()
        .addApp((b) => b.appName('app1').rootPath('/path1'))
        .addApp((b) => b.appName('app2').rootPath('/path2'))
        .build();

      expect(config.apps).toHaveLength(2);
    });

    it('should add apps using config object', () => {
      const config = createMultiAppLoader()
        .addAppConfig({ appName: 'app1', rootPath: '/path1' })
        .addAppConfig({ appName: 'app2', rootPath: '/path2' })
        .build();

      expect(config.apps).toHaveLength(2);
    });
  });

  describe('Collision Strategy', () => {
    it('should set collision strategy', () => {
      const config = createMultiAppLoader()
        .addApp((b) => b.appName('app1').rootPath('/path1'))
        .onCollision('skip')
        .build();

      expect(config.collisionStrategy).toBe('skip');
    });

    it('should default to error strategy', () => {
      const config = createMultiAppLoader()
        .addApp((b) => b.appName('app1').rootPath('/path1'))
        .build();

      expect(config.collisionStrategy).toBe('error');
    });
  });
});

describe('validateConfig', () => {
  describe('Statement Coverage', () => {
    it('should return success for valid config', () => {
      const result = validateConfig({
        appName: 'test',
        rootPath: '/var/www/dist',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.appName).toBe('test');
      }
    });

    it('should return errors for invalid config', () => {
      const result = validateConfig({
        appName: '',
        rootPath: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Boundary Values', () => {
    it('should validate empty object', () => {
      const result = validateConfig({});

      expect(result.success).toBe(false);
    });

    it('should validate with defaults applied', () => {
      const result = validateConfig({
        appName: 'test',
        rootPath: '/path',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.spaMode).toBe(true);
        expect(result.data.maxAge).toBe(86400);
        expect(result.data.urlPrefix).toBe('/assets');
        expect(result.data.templateEngine).toBe('none');
      }
    });
  });
});
