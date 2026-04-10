#!/usr/bin/env node
/**
 * Gemini OpenAI SDK - Basic Usage Examples (Node.js)
 *
 * This script demonstrates the core features of the gemini-openai-sdk package.
 * Each example is self-contained and shows a different capability.
 *
 * Requirements:
 *   - GEMINI_API_KEY environment variable set
 *   - Node.js 20.x+
 *   - gemini-openai-sdk package installed
 *
 * Usage:
 *   node basic-usage.mjs
 */

import { GeminiClient } from '../gemini-client.mjs';
import { create } from '../logger.mjs';
import { invoke, getActionMetadata } from '../agent.mjs';

// Create logger for examples
const logger = create('examples', import.meta.url);

// =============================================================================
// Example 1: Simple Chat
// =============================================================================
/**
 * Basic chat completion with a single prompt.
 *
 * This is the simplest way to interact with the Gemini API.
 */
async function example1_simpleChat() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 1: Simple Chat');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  // Check if API key is configured
  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured. Set GEMINI_API_KEY environment variable.');
    return;
  }

  const result = await client.chat('What is the capital of France?');

  if (result.success) {
    console.log(`Response: ${result.content}`);
    console.log(`Model: ${result.model || 'unknown'}`);
    console.log(`Execution time: ${Math.round(result.execution_time_ms || 0)}ms`);
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 2: Streaming Response
// =============================================================================
/**
 * Stream a chat response for real-time output.
 *
 * Streaming is useful for long responses where you want to show
 * progress to the user as the model generates text.
 */
async function example2_streaming() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 2: Streaming Response');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const result = await client.stream('Tell me a short joke.');

  if (result.success) {
    console.log(`Streamed response: ${result.content}`);
    console.log(`Chunks received: ${result.chunk_count || 0}`);
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 3: Structured Output
// =============================================================================
/**
 * Get structured JSON output matching a schema.
 *
 * This is useful when you need the model to return data
 * in a specific format for programmatic processing.
 */
async function example3_structuredOutput() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 3: Structured Output');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      population: { type: 'integer' },
      country: { type: 'string' },
    },
    required: ['name', 'population', 'country'],
  };

  const result = await client.structure(
    'Extract information about Paris from: Paris is the capital of France with a population of about 2.1 million.',
    schema
  );

  if (result.success) {
    console.log(`Raw content: ${result.content}`);
    console.log(`Parsed data:`, result.parsed);
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 4: Tool Calling
// =============================================================================
/**
 * Use function calling to execute tools.
 *
 * The model can decide to call functions you define,
 * allowing for agentic interactions.
 */
async function example4_toolCalling() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 4: Tool Calling');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const result = await client.toolCall('What is the weather in San Francisco?');

  if (result.success) {
    console.log(`Finish reason: ${result.finish_reason || 'unknown'}`);
    if (result.tool_calls && result.tool_calls.length > 0) {
      for (const tool of result.tool_calls) {
        console.log(`  Tool: ${tool.function}`);
        console.log(`  Arguments:`, tool.arguments);
        console.log(`  Result:`, tool.result);
      }
    } else {
      console.log(`Response: ${result.content || 'No content'}`);
    }
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 5: Multi-turn Conversation
// =============================================================================
/**
 * Have a multi-turn conversation with context.
 *
 * The conversation method maintains message history,
 * allowing for contextual follow-up questions.
 */
async function example5_conversation() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 5: Multi-turn Conversation');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const messages = [
    { role: 'user', content: 'My name is Alice.' },
    { role: 'assistant', content: 'Hello Alice! Nice to meet you.' },
    { role: 'user', content: 'What is my name?' },
  ];

  const result = await client.conversation(messages);

  if (result.success) {
    console.log(`Response: ${result.assistant_message?.content || 'No response'}`);
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 6: JSON Mode
// =============================================================================
/**
 * Request a JSON object response.
 *
 * JSON mode ensures the model returns valid JSON,
 * useful for data extraction tasks.
 */
async function example6_jsonMode() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 6: JSON Mode');
  console.log('='.repeat(60));

  const client = new GeminiClient();

  const health = client.healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const result = await client.jsonMode(
    'Return a JSON object with three programming languages and their paradigms.'
  );

  if (result.success) {
    console.log(`Raw: ${result.content}`);
    console.log(`Parsed:`, result.parsed);
  } else {
    console.log(`Error: ${result.error}`);
  }
}

// =============================================================================
// Example 7: Agent API
// =============================================================================
/**
 * Use the Agent API for LLM-friendly interactions.
 *
 * The Agent API provides a simplified interface that's
 * easy for other LLMs or automation tools to use.
 */
async function example7_agentApi() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 7: Agent API');
  console.log('='.repeat(60));

  // List available actions
  console.log('Available actions:');
  const metadata = getActionMetadata();
  for (const [action, info] of Object.entries(metadata)) {
    console.log(`  - ${action}: ${info.description}`);
  }

  // Invoke an action
  const result = await invoke('health');
  console.log(`\nHealth check:`, result);
}

// =============================================================================
// Example 8: Custom Model Selection
// =============================================================================
/**
 * Use different model variants.
 *
 * Available models: flash (fast), pro (capable), thinking (reasoning)
 */
async function example8_modelSelection() {
  console.log('\n' + '='.repeat(60));
  console.log('Example 8: Model Selection');
  console.log('='.repeat(60));

  const health = new GeminiClient().healthCheck();
  if (health.status !== 'healthy') {
    console.log('⚠️  API key not configured.');
    return;
  }

  const models = ['flash', 'pro'];

  for (const model of models) {
    console.log(`\nUsing model: ${model}`);
    const client = new GeminiClient({ model });
    const result = await client.chat("Say 'Hello from {model}!' where {model} is your model name.");

    if (result.success) {
      console.log(`  Response: ${(result.content || '').slice(0, 100)}...`);
    } else {
      console.log(`  Error: ${result.error}`);
    }
  }
}

// =============================================================================
// Main Runner
// =============================================================================
async function main() {
  console.log('Gemini OpenAI SDK - Node.js Examples');
  console.log('='.repeat(60));

  const examples = [
    example1_simpleChat,
    example2_streaming,
    example3_structuredOutput,
    example4_toolCalling,
    example5_conversation,
    example6_jsonMode,
    example7_agentApi,
    example8_modelSelection,
  ];

  for (const example of examples) {
    try {
      await example();
    } catch (e) {
      console.log(`Error in ${example.name}: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

main().catch(console.error);
