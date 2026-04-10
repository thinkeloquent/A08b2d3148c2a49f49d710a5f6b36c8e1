#!/usr/bin/env node
/**
 * Basic usage examples for healthz-diagnostics Node.js SDK.
 *
 * This script demonstrates all major SDK features:
 * 1. Creating an SDK instance
 * 2. Formatting timestamps
 * 3. Sanitizing configurations
 * 4. Checking environment variables
 * 5. Executing health checks
 *
 * Run with: node examples/basic-usage.mjs
 */

import {
    HealthzDiagnosticsSDK,
    HealthCheckExecutor,
    ConfigSanitizer,
    DiagnosticsCollector,
    TimestampFormatter,
    LatencyCalculator,
} from '../mjs/index.mjs';


// Example 1: Creating an SDK instance with HTTP client factory
function createSdkExample() {
    console.log('--- Example 1: Create SDK ---');

    // Define a factory that creates HTTP clients
    // In real usage, this would return fetch-based or axios client
    const httpClientFactory = (config) => ({
        get: async (url) => ({ status: 200 }),
        close: async () => {},
    });

    const sdk = HealthzDiagnosticsSDK.create(httpClientFactory);
    console.log(`SDK created: ${sdk.constructor.name}`);
    return sdk;
}


// Example 2: Formatting timestamps
function timestampExample() {
    console.log('\n--- Example 2: Timestamps ---');

    const formatter = new TimestampFormatter();

    // Get current timestamp
    const current = formatter.format();
    console.log(`Current timestamp: ${current}`);

    // Format specific epoch
    const specific = formatter.formatFromEpoch(1705312200000);
    console.log(`Specific timestamp: ${specific}`);
}


// Example 3: Measuring latency
async function latencyExample() {
    console.log('\n--- Example 3: Latency ---');

    const calc = new LatencyCalculator();

    calc.start();
    await sleep(100);  // Simulate work
    calc.stop();

    console.log(`Latency: ${calc.getMs()}ms`);
    console.log(`Latency: ${calc.getSeconds()}s`);
}


// Example 4: Sanitizing configurations
function sanitizerExample() {
    console.log('\n--- Example 4: Config Sanitization ---');

    const sanitizer = new ConfigSanitizer();

    const config = {
        name: 'openai',
        base_url: 'https://api.openai.com',
        endpoint_api_key: 'sk-secret-key-12345',
        model: 'gpt-4',
        nested: {
            token: 'bearer-abc-123',
            timeout: 30,
        }
    };

    const safeConfig = sanitizer.sanitize(config);
    console.log(`Original api_key: ${config.endpoint_api_key}`);
    console.log(`Sanitized api_key: ${safeConfig.endpoint_api_key}`);
    console.log(`Nested token: ${safeConfig.nested.token}`);
}


// Example 5: Checking environment variables
function envVarsExample() {
    console.log('\n--- Example 5: Environment Variables ---');

    const sanitizer = new ConfigSanitizer();

    const varsToCheck = [
        'PATH',
        'HOME',
        'OPENAI_API_KEY',
        'NONEXISTENT_VAR',
    ];

    const result = sanitizer.checkEnvVars(varsToCheck);
    console.log('Environment variable presence:');
    for (const [varName, present] of Object.entries(result)) {
        const status = present ? '✓' : '✗';
        console.log(`  ${status} ${varName}`);
    }
}


// Example 6: Collecting diagnostics
async function diagnosticsExample() {
    console.log('\n--- Example 6: Diagnostics Collection ---');

    const collector = new DiagnosticsCollector();

    // Simulate a request lifecycle
    collector.pushStart('https://api.example.com/health', 'GET');
    await sleep(50);  // Simulate request
    collector.pushEnd(200);

    const events = collector.getEvents();
    console.log(`Collected ${events.length} events:`);
    for (const event of events) {
        console.log(`  - ${event.type}: ${event.status ?? 'N/A'}`);
    }

    console.log(`Total duration: ${collector.getDuration().toFixed(3)}s`);
}


// Example 7: Executing a health check
async function healthCheckExample() {
    console.log('\n--- Example 7: Health Check ---');

    // Mock HTTP client for demo
    const mockClient = {
        get: async (url) => ({ status: 200 }),
        close: async () => {},
    };

    const executor = new HealthCheckExecutor(() => mockClient);

    const config = {
        base_url: 'https://api.example.com',
        health_endpoint: '/health',
        model: 'gpt-4',
    };

    const result = await executor.execute('example_provider', config);
    console.log(`Provider: ${result.provider}`);
    console.log(`Healthy: ${result.healthy}`);
    console.log(`Status: ${result.status_code}`);
    console.log(`Latency: ${result.latency_ms.toFixed(2)}ms`);
}


// Example 8: Full SDK workflow
async function fullWorkflowExample() {
    console.log('\n--- Example 8: Full Workflow ---');

    // Mock HTTP client
    const mockClient = {
        get: async (url) => ({ status: 200 }),
        close: async () => {},
    };

    const sdk = HealthzDiagnosticsSDK.create(() => mockClient);

    // 1. Get timestamp
    console.log(`Timestamp: ${sdk.formatTimestamp()}`);

    // 2. Sanitize config
    const config = {
        base_url: 'https://api.openai.com',
        health_endpoint: '/v1/health',
        api_key: 'sk-secret-123',
    };
    const safe = sdk.sanitizeConfig(config);
    console.log(`Sanitized config: ${JSON.stringify(safe)}`);

    // 3. Check env vars
    const envResult = sdk.checkEnvVars(['PATH', 'OPENAI_API_KEY']);
    console.log(`Env vars: ${JSON.stringify(envResult)}`);

    // 4. Execute health check
    const result = await sdk.checkHealth('openai', config);
    console.log(`Health check result: healthy=${result.healthy}`);
}


// Helper: sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Main
async function main() {
    console.log('='.repeat(60));
    console.log('healthz-diagnostics Node.js SDK Examples');
    console.log('='.repeat(60));

    createSdkExample();
    timestampExample();
    await latencyExample();
    sanitizerExample();
    envVarsExample();
    await diagnosticsExample();
    await healthCheckExample();
    await fullWorkflowExample();

    console.log('\n' + '='.repeat(60));
    console.log('All examples completed successfully!');
    console.log('='.repeat(60));
}


main().catch(console.error);
