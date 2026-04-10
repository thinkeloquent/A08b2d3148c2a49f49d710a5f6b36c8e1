/**
 * 04-state-machine.mjs
 *
 * Implements the State Machine Pattern for Request State (REQ0002).
 * Initializes request.state with a container object holding 'mode' and 'context'.
 */

function createStateContainer(mode, context) {
    return {
        mode,
        context, // Expected to be an object (Data Bag)
        getMode() {
            return this.mode;
        },
        setMode(m) {
            this.mode = m;
        },
        getContext(key) {
            return key ? this.context[key] : this.context;
        },
        setContext(key, value) {
            this.context[key] = value;
        },
        transition(m, updates) {
            this.mode = m;
            if (updates) Object.assign(this.context, updates);
        },
    };
}

export async function onStartup(server, config) {
    server.log.info("[lifecycle:state-machine] Initializing State Machine...");

    try {
        server.log.debug({ hasInitialState: !!config.initial_state }, "[lifecycle:state-machine] Checking initial_state in config");
        const initialState = config.initial_state;
        if (!initialState) {
            server.log.warn(
                "[lifecycle:state-machine] 'initial_state' not found in config. State Machine disabled."
            );
            return;
        }

        server.log.info({ mode: initialState.mode }, "[lifecycle:state-machine] initial_state found, configuring state machine");

        // Decorate server with initialState for reference
        if (!server.hasDecorator("initialState")) {
            server.decorate("initialState", initialState);
            server.log.info("[lifecycle:state-machine] Decorated server with initialState");
        }

        // Decorate request with state (initialized to null)
        if (!server.hasRequestDecorator("state")) {
            server.decorateRequest("state", null);
            server.log.info("[lifecycle:state-machine] Decorated request with state");
        }

        // Add onRequest hook to initialize state per request
        server.addHook("onRequest", async (request) => {
            const template = server.initialState;
            const mode = template.mode || "idle";

            // Deep clone context to ensure isolation
            // utilizing structuredClone which is available in Node 17+
            // Fallback to JSON parse/stringify if needed, but assuming modern Node
            let context;
            try {
                context = structuredClone(template.context || {});
            } catch (e) {
                request.log.warn({ err: e }, "[lifecycle:state-machine] structuredClone failed, falling back to JSON clone");
                context = JSON.parse(JSON.stringify(template.context || {}));
            }

            request.state = createStateContainer(mode, context);
        });

        server.log.info("[lifecycle:state-machine] State Machine initialized successfully");
    } catch (err) {
        server.log.error({ err, hookName: "05-state-machine" }, "[lifecycle:state-machine] State Machine initialization failed");
        throw err;
    }
}
