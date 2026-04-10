
import { onStartup as onStartupState } from '../config/lifecycle/04-state-machine.mjs';
import { onStartup as onStartupDecorators } from '../config/lifecycle/100-on-request-decorators.mjs';
import assert from 'assert';

async function runTest() {
    console.log("Running Fastify Lifecycle Verification...");

    const mockServer = {
        log: { info: console.log, warn: console.warn, error: console.error },
        decorators: {},
        requestDecorators: {},
        hooks: {},

        decorate(name, value) {
            this.decorators[name] = value;
            this[name] = value;
        },
        hasDecorator(name) {
            return name in this.decorators;
        },
        decorateRequest(name, value) {
            this.requestDecorators[name] = value;
        },
        hasRequestDecorator(name) {
            return name in this.requestDecorators;
        },
        addHook(name, fn) {
            if (!this.hooks[name]) this.hooks[name] = [];
            this.hooks[name].push(fn);
        }
    };

    const config = {
        initial_state: {
            mode: "active",
            context: { foo: "bar" }
        }
    };

    // Pre-requisites for 100
    mockServer.decorate("sharedContext", { createChild: () => ({ child: true }) });
    mockServer.decorate("contextRegistry", { list: () => [] });
    mockServer.decorate("configSdk", { getResolved: () => ({}) });

    // Run Hooks
    await onStartupState(mockServer, config);
    await onStartupDecorators(mockServer, config);

    // Simulate Request
    const mockRequest = {
        log: mockServer.log
    };

    // Apply initial request decorators
    for (const [key, val] of Object.entries(mockServer.requestDecorators)) {
        mockRequest[key] = val;
    }

    // Run onRequest hooks
    for (const hook of mockServer.hooks["onRequest"]) {
        await hook(mockRequest);
    }

    // Verify State Machine (04)
    assert.ok(mockRequest.state, "request.state should exist");
    assert.strictEqual(mockRequest.state.mode, "active");
    assert.strictEqual(mockRequest.state.context.foo, "bar");
    assert.strictEqual(typeof mockRequest.state.getMode, "function");

    // Verify Context Decorators (100)
    assert.ok(mockRequest.context, "request.context should exist");
    assert.ok(mockRequest.context.sharedContext, "request.context.sharedContext should exist");
    assert.strictEqual(mockRequest.context.sharedContext.child, true);
    assert.ok(mockRequest.context.contextRegistry, "request.context.contextRegistry should exist");

    console.log("✅ Fastify Lifecycle Verification Passed!");
}

runTest().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
