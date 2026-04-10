/**
 * Unit tests for errors module.
 *
 * Tests cover:
 * - All error classes
 * - Error codes
 * - Error messages
 */

import { describe, it, expect } from 'vitest';
import {
  StaticAppLoaderError,
  StaticPathNotFoundError,
  UnsupportedTemplateEngineError,
  RouteCollisionError,
  ConfigValidationError,
  IndexNotFoundError,
} from '../src/errors.js';

describe('StaticAppLoaderError', () => {
  it('should have message and code', () => {
    const error = new StaticAppLoaderError('Test error', 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('StaticAppLoaderError');
  });
});

describe('StaticPathNotFoundError', () => {
  it('should include path in message', () => {
    const error = new StaticPathNotFoundError('/some/missing/path');

    expect(error.message).toContain('/some/missing/path');
    expect(error.path).toBe('/some/missing/path');
    expect(error.code).toBe('STATIC_PATH_NOT_FOUND');
    expect(error.name).toBe('StaticPathNotFoundError');
  });
});

describe('UnsupportedTemplateEngineError', () => {
  it('should include engine and supported list', () => {
    const error = new UnsupportedTemplateEngineError('invalid_engine');

    expect(error.message).toContain('invalid_engine');
    expect(error.message).toContain('mustache');
    expect(error.message).toContain('liquid');
    expect(error.message).toContain('edge');
    expect(error.message).toContain('none');
    expect(error.engine).toBe('invalid_engine');
    expect(error.code).toBe('UNSUPPORTED_TEMPLATE_ENGINE');
    expect(error.name).toBe('UnsupportedTemplateEngineError');
  });
});

describe('RouteCollisionError', () => {
  it('should include route prefix and conflicting apps', () => {
    const error = new RouteCollisionError('/dashboard', ['app1', 'app2']);

    expect(error.message).toContain('/dashboard');
    expect(error.message).toContain('app1');
    expect(error.message).toContain('app2');
    expect(error.routePrefix).toBe('/dashboard');
    expect(error.conflictingApps).toEqual(['app1', 'app2']);
    expect(error.code).toBe('ROUTE_COLLISION');
    expect(error.name).toBe('RouteCollisionError');
  });
});

describe('ConfigValidationError', () => {
  it('should include all validation errors', () => {
    const errors = ['appName is required', 'rootPath must not be empty'];
    const error = new ConfigValidationError(errors);

    expect(error.message).toContain('appName is required');
    expect(error.message).toContain('rootPath must not be empty');
    expect(error.validationErrors).toEqual(errors);
    expect(error.code).toBe('CONFIG_VALIDATION_ERROR');
    expect(error.name).toBe('ConfigValidationError');
  });
});

describe('IndexNotFoundError', () => {
  it('should include root path', () => {
    const error = new IndexNotFoundError('/var/www/app/dist');

    expect(error.message).toContain('/var/www/app/dist');
    expect(error.message).toContain('index.html');
    expect(error.rootPath).toBe('/var/www/app/dist');
    expect(error.code).toBe('INDEX_NOT_FOUND');
    expect(error.name).toBe('IndexNotFoundError');
  });
});
