import { describe, it, expect, beforeEach } from 'vitest';
import {
  rewriteHtmlPaths,
  rewriteHtmlPathsCached,
  clearCache,
  getCacheSize,
} from '../src/path-rewriter.js';

describe('path-rewriter', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('rewriteHtmlPaths', () => {
    const options = {
      appName: 'dashboard',
      urlPrefix: '/assets',
    };

    it('should rewrite absolute asset paths', () => {
      const html = '<script src="/assets/main.js"></script>';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<script src="/apps/dashboard/assets/main.js"></script>');
    });

    it('should rewrite relative asset paths with ./', () => {
      const html = '<script src="./assets/main.js"></script>';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<script src="/apps/dashboard/assets/main.js"></script>');
    });

    it('should rewrite relative asset paths without ./', () => {
      const html = '<script src="assets/main.js"></script>';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<script src="/apps/dashboard/assets/main.js"></script>');
    });

    it('should rewrite href attributes', () => {
      const html = '<link rel="stylesheet" href="/assets/style.css">';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<link rel="stylesheet" href="/apps/dashboard/assets/style.css">');
    });

    it('should rewrite img src attributes', () => {
      const html = '<img src="/assets/logo.png">';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<img src="/apps/dashboard/assets/logo.png">');
    });

    it('should rewrite CSS url() references', () => {
      const html = '<style>body { background: url("/assets/bg.png"); }</style>';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<style>body { background: url("/apps/dashboard/assets/bg.png"); }</style>');
    });

    it('should handle multiple assets in one document', () => {
      const html = `
        <link href="/assets/style.css" rel="stylesheet">
        <script src="/assets/main.js"></script>
        <img src="/assets/logo.png">
      `;
      const result = rewriteHtmlPaths(html, options);
      expect(result).toContain('/apps/dashboard/assets/style.css');
      expect(result).toContain('/apps/dashboard/assets/main.js');
      expect(result).toContain('/apps/dashboard/assets/logo.png');
    });

    it('should handle custom url prefix', () => {
      const customOptions = {
        appName: 'admin',
        urlPrefix: '/static',
      };
      const html = '<script src="/assets/main.js"></script>';
      const result = rewriteHtmlPaths(html, customOptions);
      expect(result).toBe('<script src="/apps/admin/static/main.js"></script>');
    });

    it('should not modify non-asset paths', () => {
      const html = '<a href="/api/users">Users</a>';
      const result = rewriteHtmlPaths(html, options);
      expect(result).toBe('<a href="/api/users">Users</a>');
    });
  });

  describe('rewriteHtmlPathsCached', () => {
    const options = {
      appName: 'dashboard',
      urlPrefix: '/assets',
      enableCache: true,
      cacheTtl: 60000,
    };

    it('should cache rewritten HTML', () => {
      const html = '<script src="/assets/main.js"></script>';

      const result1 = rewriteHtmlPathsCached(html, '/path/to/index.html', options);
      expect(getCacheSize()).toBe(1);

      const result2 = rewriteHtmlPathsCached(html, '/path/to/index.html', options);
      expect(result1).toBe(result2);
      expect(getCacheSize()).toBe(1);
    });

    it('should bypass cache when disabled', () => {
      const html = '<script src="/assets/main.js"></script>';
      const noCacheOptions = { ...options, enableCache: false };

      rewriteHtmlPathsCached(html, '/path/to/index.html', noCacheOptions);
      expect(getCacheSize()).toBe(0);
    });
  });

  describe('clearCache', () => {
    it('should clear all cache entries', () => {
      const options = {
        appName: 'dashboard',
        urlPrefix: '/assets',
        enableCache: true,
      };

      rewriteHtmlPathsCached('<script src="/assets/main.js"></script>', '/a', options);
      rewriteHtmlPathsCached('<script src="/assets/app.js"></script>', '/b', options);
      expect(getCacheSize()).toBe(2);

      clearCache();
      expect(getCacheSize()).toBe(0);
    });

    it('should clear specific cache key prefix', () => {
      const options = {
        appName: 'dashboard',
        urlPrefix: '/assets',
        enableCache: true,
      };

      rewriteHtmlPathsCached('<script src="/assets/main.js"></script>', '/a', options);
      rewriteHtmlPathsCached('<script src="/assets/app.js"></script>', '/b', options);
      expect(getCacheSize()).toBe(2);

      clearCache('/a');
      expect(getCacheSize()).toBe(1);
    });
  });
});
