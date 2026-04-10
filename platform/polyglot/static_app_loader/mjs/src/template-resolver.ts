import type { FastifyInstance } from 'fastify';
import type { TemplateEngine, ILogger } from './types.js';
import { UnsupportedTemplateEngineError } from './errors.js';

interface TemplateConfig {
  engine: unknown;
  options: Record<string, unknown>;
}

/**
 * Resolve and configure the template engine for a Fastify instance.
 *
 * @param fastify - The Fastify instance to configure
 * @param engine - The template engine to use
 * @param rootPath - The root path for template files
 * @param logger - Logger instance for diagnostics
 */
export async function resolveTemplateEngine(
  fastify: FastifyInstance,
  engine: TemplateEngine,
  rootPath: string,
  logger?: ILogger
): Promise<void> {
  if (engine === 'none') {
    logger?.debug('No template engine configured');
    return;
  }

  const config = await getEngineConfig(engine, rootPath);

  try {
    const fastifyView = await import('@fastify/view');
    await fastify.register(fastifyView.default, {
      engine: { [engine]: config.engine },
      root: rootPath,
      ...config.options,
    });
    logger?.info(`Template engine configured: ${engine}`);
  } catch (err) {
    logger?.error(`Failed to configure template engine: ${engine}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Get the engine-specific configuration.
 */
async function getEngineConfig(engine: TemplateEngine, rootPath: string): Promise<TemplateConfig> {
  switch (engine) {
    case 'mustache': {
      const mustache = await import('mustache');
      return {
        engine: mustache.default,
        options: {
          templates: rootPath,
        },
      };
    }

    case 'liquid': {
      const { Liquid } = await import('liquidjs');
      const liquidEngine = new Liquid({
        root: rootPath,
        extname: '.liquid',
      });
      return {
        engine: liquidEngine,
        options: {},
      };
    }

    case 'edge': {
      const { Edge } = await import('edge.js');
      const edgeEngine = Edge.create();
      edgeEngine.mount(rootPath);
      return {
        engine: edgeEngine,
        options: {},
      };
    }

    case 'none':
      return { engine: null, options: {} };

    default:
      throw new UnsupportedTemplateEngineError(engine as string);
  }
}

/**
 * Render HTML content with the specified template engine.
 *
 * @param html - The HTML template content
 * @param context - The context data for rendering
 * @param engine - The template engine to use
 * @returns Rendered HTML content
 */
export async function renderTemplate(
  html: string,
  context: Record<string, unknown>,
  engine: TemplateEngine
): Promise<string> {
  if (engine === 'none') {
    return html;
  }

  switch (engine) {
    case 'mustache': {
      const mustache = await import('mustache');
      return mustache.default.render(html, context);
    }

    case 'liquid': {
      const { Liquid } = await import('liquidjs');
      const liquidEngine = new Liquid();
      return liquidEngine.parseAndRender(html, context);
    }

    case 'edge': {
      // Edge.js doesn't support string templates directly
      // We'd need to write to a temp file, so for inline rendering
      // we fall back to basic variable replacement
      return html.replace(
        /\{\{\s*(\w+)\s*\}\}/g,
        (_, key) => String(context[key] ?? '')
      );
    }

    default:
      return html;
  }
}

/**
 * Inject server-side data as window.INITIAL_STATE.
 * Properly escapes data to prevent XSS attacks.
 *
 * @param html - The HTML content
 * @param data - The data to inject
 * @returns HTML with injected script tag
 */
export function injectInitialState(html: string, data: Record<string, unknown>): string {
  // Escape data to prevent XSS
  const escapedData = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');

  const script = `<script>window.INITIAL_STATE=${escapedData};</script>`;

  // Insert before closing </head> or at the beginning of <body>
  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}</head>`);
  }

  if (html.includes('<body')) {
    return html.replace(/<body([^>]*)>/, `<body$1>${script}`);
  }

  // Fallback: prepend to HTML
  return script + html;
}
