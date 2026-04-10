/**
 * Unit tests for template-resolver module.
 *
 * Tests cover:
 * - Template engine resolution
 * - Template rendering
 * - Initial state injection
 * - XSS prevention
 */

import { describe, it, expect } from 'vitest';
import { injectInitialState, renderTemplate } from '../src/template-resolver.js';

describe('injectInitialState', () => {
  describe('Statement Coverage', () => {
    it('should inject script before </head>', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const data = { user: 'test' };

      const result = injectInitialState(html, data);

      expect(result).toContain('window.INITIAL_STATE');
      expect(result.indexOf('INITIAL_STATE')).toBeLessThan(result.indexOf('</head>'));
    });

    it('should inject script after <body> if no </head>', () => {
      const html = '<html><body><h1>Test</h1></body></html>';
      const data = { user: 'test' };

      const result = injectInitialState(html, data);

      expect(result).toContain('window.INITIAL_STATE');
    });

    it('should prepend script if no head or body tags', () => {
      const html = '<h1>Simple HTML</h1>';
      const data = { user: 'test' };

      const result = injectInitialState(html, data);

      expect(result.startsWith('<script>')).toBe(true);
    });
  });

  describe('XSS Prevention', () => {
    it('should escape < and > characters', () => {
      const html = '<html><head></head><body></body></html>';
      const data = { malicious: "<script>alert('xss')</script>" };

      const result = injectInitialState(html, data);

      expect(result).not.toContain("<script>alert('xss')");
      expect(result).toContain('\\u003c');
      expect(result).toContain('\\u003e');
    });

    it('should escape ampersands', () => {
      const html = '<html><head></head><body></body></html>';
      const data = { value: 'a & b' };

      const result = injectInitialState(html, data);

      expect(result).toContain('\\u0026');
    });

    it('should escape single quotes', () => {
      const html = '<html><head></head><body></body></html>';
      const data = { value: "it's a test" };

      const result = injectInitialState(html, data);

      expect(result).toContain('\\u0027');
    });
  });

  describe('Boundary Values', () => {
    it('should handle empty data', () => {
      const html = '<html><head></head><body></body></html>';

      const result = injectInitialState(html, {});

      expect(result).toContain('window.INITIAL_STATE={}');
    });

    it('should handle nested data', () => {
      const html = '<html><head></head><body></body></html>';
      const data = { user: { name: 'test', roles: ['admin', 'user'] } };

      const result = injectInitialState(html, data);

      expect(result).toContain('window.INITIAL_STATE');
      expect(result).toContain('user');
    });
  });
});

describe('renderTemplate', () => {
  describe('Statement Coverage', () => {
    it('should return HTML unchanged for none engine', async () => {
      const html = '<h1>Hello World</h1>';

      const result = await renderTemplate(html, {}, 'none');

      expect(result).toBe(html);
    });
  });

  describe('Edge Template Fallback', () => {
    it('should replace basic mustache-style variables for edge', async () => {
      const html = '<h1>Hello {{ name }}</h1>';
      const context = { name: 'World' };

      const result = await renderTemplate(html, context, 'edge');

      expect(result).toContain('World');
    });
  });
});
