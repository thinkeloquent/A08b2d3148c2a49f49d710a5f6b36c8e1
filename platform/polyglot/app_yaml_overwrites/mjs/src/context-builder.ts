
import { create, ILogger } from './logger.js';
import { SharedContext, createSharedContext } from './shared-context.js';

/**
 * Generic request type for framework-agnostic usage.
 */
export interface RequestLike {
    headers?: Record<string, string | string[] | undefined>;
    [key: string]: any;
}

export interface ContextOptions {
    env?: Record<string, string>;
    config?: any; // AppYamlConfig raw
    app?: any;    // Extracted app config
    state?: any;
    request?: RequestLike;
    shared?: SharedContext;
}

export type ContextExtender = (currentContext: any, request?: RequestLike) => Promise<any> | any;

export class ContextBuilder {
    private logger: ILogger;
    private ctx: any;
    private extenders: ContextExtender[] = [];
    private sharedContext: SharedContext | null = null;

    constructor(logger?: ILogger) {
        this.logger = logger ?? create('app-yaml-overwrites', 'context-builder.ts');
        this.ctx = {
            env: process.env,
            config: {},
            app: {},
            state: {},
            request: undefined,
            shared: null  // Will be set per resolution pass
        };
    }

    public withConfig(config: any): ContextBuilder {
        this.ctx.config = config;
        return this;
    }

    public withEnv(env: Record<string, string>): ContextBuilder {
        this.ctx.env = env;
        return this;
    }

    public withAppConfig(app: any): ContextBuilder {
        this.ctx.app = app;
        return this;
    }

    public withState(state: any): ContextBuilder {
        this.ctx.state = state;
        return this;
    }

    public withRequest(request: RequestLike): ContextBuilder {
        this.ctx.request = request;
        return this;
    }

    /**
     * Set shared context for resolution pass.
     * If not provided, creates a new SharedContext.
     *
     * The shared context allows computed functions to share state
     * during a single resolution pass (Option 5 pattern).
     *
     * @param shared - Optional existing SharedContext, or creates new one
     * @returns Self for chaining
     */
    public withSharedContext(shared?: SharedContext): ContextBuilder {
        this.sharedContext = shared ?? createSharedContext();
        return this;
    }

    public addExtender(extender: ContextExtender): ContextBuilder {
        this.extenders.push(extender);
        return this;
    }

    public async build(): Promise<any> {
        this.logger.debug('Building context', { keys: Object.keys(this.ctx) });

        let context = { ...this.ctx };

        // Always provide a shared context for computed functions
        context.shared = this.sharedContext ?? createSharedContext();

        for (const extender of this.extenders) {
            try {
                const partial = await extender(context, context.request);
                context = { ...context, ...partial };
            } catch (err) {
                this.logger.warn(`Context extender failed: ${err}`);
            }
        }

        return context;
    }

    /**
     * Static convenience method for building context.
     *
     * @param options - Context options (config, env, app, state, request, shared)
     * @param extenders - Optional list of context extenders
     * @param logger - Optional logger instance
     * @returns Built context dictionary with shared context included
     */
    public static async build(options: ContextOptions, extenders: ContextExtender[] = [], logger?: ILogger): Promise<any> {
        const builder = new ContextBuilder(logger);

        if (options.config) builder.withConfig(options.config);
        if (options.env) builder.withEnv(options.env);
        if (options.app) builder.withAppConfig(options.app);
        if (options.state) builder.withState(options.state);
        if (options.request) builder.withRequest(options.request);
        if (options.shared) builder.withSharedContext(options.shared);

        extenders.forEach(ext => builder.addExtender(ext));

        return builder.build();
    }
}

// Re-export SharedContext for convenience
export { SharedContext, createSharedContext } from './shared-context.js';
