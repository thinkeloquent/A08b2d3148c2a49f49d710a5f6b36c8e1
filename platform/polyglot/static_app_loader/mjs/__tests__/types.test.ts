import { describe, it, expect } from 'vitest';
import {
  StaticLoaderOptionsSchema,
  MultiAppOptionsSchema,
  TemplateEngineSchema,
  CollisionStrategySchema,
} from '../src/types.js';

describe('StaticLoaderOptionsSchema', () => {
  it('should validate a minimal valid config', () => {
    const config = {
      appName: 'dashboard',
      rootPath: '/var/www/dashboard/dist',
    };

    const result = StaticLoaderOptionsSchema.safeParse(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.appName).toBe('dashboard');
      expect(result.data.rootPath).toBe('/var/www/dashboard/dist');
      expect(result.data.templateEngine).toBe('none');
      expect(result.data.urlPrefix).toBe('/assets');
      expect(result.data.spaMode).toBe(true);
      expect(result.data.maxAge).toBe(86400);
    }
  });

  it('should validate a full config with all options', () => {
    const config = {
      appName: 'admin',
      rootPath: '/var/www/admin/dist',
      templateEngine: 'mustache' as const,
      urlPrefix: '/static',
      defaultContext: { version: '1.0.0' },
      spaMode: false,
      maxAge: 3600,
    };

    const result = StaticLoaderOptionsSchema.safeParse(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templateEngine).toBe('mustache');
      expect(result.data.urlPrefix).toBe('/static');
      expect(result.data.spaMode).toBe(false);
      expect(result.data.maxAge).toBe(3600);
    }
  });

  it('should reject empty appName', () => {
    const config = {
      appName: '',
      rootPath: '/var/www/dashboard/dist',
    };

    const result = StaticLoaderOptionsSchema.safeParse(config);

    expect(result.success).toBe(false);
  });

  it('should reject empty rootPath', () => {
    const config = {
      appName: 'dashboard',
      rootPath: '',
    };

    const result = StaticLoaderOptionsSchema.safeParse(config);

    expect(result.success).toBe(false);
  });

  it('should reject negative maxAge', () => {
    const config = {
      appName: 'dashboard',
      rootPath: '/var/www/dashboard/dist',
      maxAge: -1,
    };

    const result = StaticLoaderOptionsSchema.safeParse(config);

    expect(result.success).toBe(false);
  });
});

describe('TemplateEngineSchema', () => {
  it('should accept valid template engines', () => {
    expect(TemplateEngineSchema.safeParse('mustache').success).toBe(true);
    expect(TemplateEngineSchema.safeParse('liquid').success).toBe(true);
    expect(TemplateEngineSchema.safeParse('edge').success).toBe(true);
    expect(TemplateEngineSchema.safeParse('none').success).toBe(true);
  });

  it('should reject invalid template engine', () => {
    expect(TemplateEngineSchema.safeParse('invalid').success).toBe(false);
    expect(TemplateEngineSchema.safeParse('jinja2').success).toBe(false);
  });
});

describe('CollisionStrategySchema', () => {
  it('should accept valid collision strategies', () => {
    expect(CollisionStrategySchema.safeParse('error').success).toBe(true);
    expect(CollisionStrategySchema.safeParse('warn').success).toBe(true);
    expect(CollisionStrategySchema.safeParse('skip').success).toBe(true);
  });

  it('should reject invalid collision strategy', () => {
    expect(CollisionStrategySchema.safeParse('ignore').success).toBe(false);
  });
});

describe('MultiAppOptionsSchema', () => {
  it('should validate multi-app config', () => {
    const config = {
      apps: [
        { appName: 'dashboard', rootPath: '/var/www/dashboard/dist' },
        { appName: 'admin', rootPath: '/var/www/admin/dist' },
      ],
      collisionStrategy: 'warn' as const,
    };

    const result = MultiAppOptionsSchema.safeParse(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.apps).toHaveLength(2);
      expect(result.data.collisionStrategy).toBe('warn');
    }
  });

  it('should apply default collision strategy', () => {
    const config = {
      apps: [{ appName: 'dashboard', rootPath: '/var/www/dashboard/dist' }],
    };

    const result = MultiAppOptionsSchema.safeParse(config);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.collisionStrategy).toBe('error');
    }
  });
});
