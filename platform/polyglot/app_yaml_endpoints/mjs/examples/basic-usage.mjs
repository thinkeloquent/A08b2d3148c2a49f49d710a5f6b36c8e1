#!/usr/bin/env node
/**
 * Basic usage example for Smart Fetch Router.
 *
 * This example demonstrates:
 * - Loading configuration from YAML file or object
 * - Getting fetch configuration for a service
 * - Resolving intents to service IDs
 * - Using custom headers
 */

import path from 'path';
import { fileURLToPath } from 'url';
import {
    loadConfig,
    loadConfigFromFile,
    getFetchConfig,
    listEndpoints,
    resolveIntent,
    LoggerFactory,
} from '../src/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = LoggerFactory.create('example', import.meta.url);

function exampleLoadFromFile() {
    console.log('\n=== Load from YAML file ===');

    const appEnv = process.env.APP_ENV || 'dev';
    const configPath = path.join(__dirname, '..', '..', '..', '..', 'common', 'config', `endpoint.${appEnv}.yaml`);
    loadConfigFromFile(configPath);

    const endpoints = listEndpoints();
    console.log('Available endpoints:', endpoints);
}

function exampleLoadFromObject() {
    console.log('\n=== Load from object ===');

    const config = {
        endpoints: {
            'my-api': {
                baseUrl: 'http://localhost:8000/api',
                method: 'POST',
                headers: { Authorization: 'Bearer token' },
                timeout: 5000,
                bodyType: 'json',
            },
        },
        intent_mapping: {
            mappings: { default: 'my-api' },
            default_intent: 'my-api',
        },
    };

    loadConfig(config);
    const endpoints = listEndpoints();
    console.log('Available endpoints:', endpoints);
}

function exampleGetFetchConfig() {
    console.log('\n=== Get Fetch Config ===');

    loadConfig({
        endpoints: {
            llm001: {
                baseUrl: 'http://localhost:51000/api/llm/gemini-openai-v1',
                method: 'POST',
                headers: { 'X-Service-ID': 'llm-primary' },
                timeout: 30000,
                bodyType: 'json',
            },
        },
        intent_mapping: { mappings: {}, default_intent: 'llm001' },
    });

    const payload = { messages: [{ role: 'user', content: 'Hello, world!' }] };
    const config = getFetchConfig('llm001', payload);

    console.log('Service ID:', config.serviceId);
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Body:', config.body.substring(0, 50) + '...');
    console.log('Timeout:', config.headersTimeout + 'ms');
}

function exampleCustomHeaders() {
    console.log('\n=== Custom Headers ===');

    loadConfig({
        endpoints: {
            api001: {
                baseUrl: 'http://localhost:8000/api',
                method: 'POST',
                headers: { 'X-Default': 'value' },
                timeout: 30000,
                bodyType: 'json',
            },
        },
        intent_mapping: { mappings: {}, default_intent: 'api001' },
    });

    const config = getFetchConfig('api001', { data: 'test' }, {
        'X-Request-ID': 'req-123',
        'X-Correlation-ID': 'corr-456',
    });

    console.log('Merged headers:');
    Object.entries(config.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
}

function exampleResolveIntent() {
    console.log('\n=== Resolve Intent ===');

    loadConfig({
        endpoints: {
            llm001: { baseUrl: 'http://localhost:51000', method: 'POST' },
            agent001: { baseUrl: 'http://localhost:52000', method: 'POST' },
        },
        intent_mapping: {
            mappings: {
                chat: 'llm001',
                persona: 'llm001',
                agent: 'agent001',
            },
            default_intent: 'llm001',
        },
    });

    const intents = ['chat', 'persona', 'agent', 'unknown'];
    intents.forEach((intent) => {
        const serviceId = resolveIntent(intent);
        console.log(`Intent '${intent}' -> Service '${serviceId}'`);
    });
}

// Main
console.log('Smart Fetch Router - Basic Usage Examples');
console.log('='.repeat(50));

exampleLoadFromObject();
exampleGetFetchConfig();
exampleCustomHeaders();
exampleResolveIntent();

// Load from file if config exists
import fs from 'fs';
const appEnv = process.env.APP_ENV || 'dev';
const configFilePath = path.join(__dirname, '..', '..', '..', '..', 'common', 'config', `endpoint.${appEnv}.yaml`);
if (fs.existsSync(configFilePath)) {
    exampleLoadFromFile();
}

console.log('\n' + '='.repeat(50));
console.log('Examples completed successfully!');
