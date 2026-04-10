/**
 * Gemini OpenAI-Compatible AsyncClient Pool Example
 *
 * Uses the full AsyncClient from fetch-undici with pool configuration.
 * This provides access to all features (auth, retries, circuit breaker, etc.)
 * while configuring connection pooling.
 *
 * Run: node 2.gemini-openai-async-client-pool.mjs
 */

import {
  AsyncClient,
  Limits,
  Timeout,
  BearerAuth
} from '../../packages_mjs/fetch_undici/dist/index.js'

import {
  GEMINI_ORIGIN,
  GEMINI_CHAT_COMPLETIONS_PATH,
  GEMINI_POOL_CONNECTIONS,
  GEMINI_KEEPALIVE_TIMEOUT_MS,
  GEMINI_HEADERS_TIMEOUT_MS,
  GEMINI_BODY_TIMEOUT_MS,
  GEMINI_HTTP2_ENABLED,
} from '../../packages_mjs/fetch_undici_gemini_openai_constant/dist/index.js'

async function main() {
  console.log('='.repeat(60))
  console.log('Gemini OpenAI-Compatible AsyncClient Pool Example')
  console.log('='.repeat(60))
  console.log()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required')
    process.exit(1)
  }

  // Create AsyncClient with full pool configuration using Gemini constants
  const client = new AsyncClient({
    baseUrl: GEMINI_ORIGIN,

    // Authentication
    auth: new BearerAuth(apiKey),

    // Connection pool limits (using Gemini-optimized constants)
    limits: new Limits({
      maxConnections: GEMINI_POOL_CONNECTIONS,      // 100 - High ceiling for LLM workloads
      maxConnectionsPerHost: GEMINI_POOL_CONNECTIONS, // Connections per origin
      keepAliveTimeout: GEMINI_KEEPALIVE_TIMEOUT_MS,  // 60s - Aligns with chat typing pauses
      keepAliveMaxTimeout: GEMINI_KEEPALIVE_TIMEOUT_MS,
    }),

    // Timeout configuration (using Gemini-optimized constants for thinking models)
    timeout: new Timeout({
      connect: 10000,                    // 10s - Fast fail on network issues
      read: GEMINI_BODY_TIMEOUT_MS,      // 300s - Disabled for thinking models (or use null)
      write: 10000,                      // 10s - Prompt sending should be fast
      pool: null,                        // Disabled
    }),

    // HTTP/2 support
    http2: GEMINI_HTTP2_ENABLED,

    // Default headers
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },

    // Follow redirects
    followRedirects: true,
    maxRedirects: 5,
  })

  console.log(`Base URL: ${GEMINI_ORIGIN}`)
  console.log(`Endpoint: ${GEMINI_CHAT_COMPLETIONS_PATH}`)
  console.log()

  // Example 1: Simple chat completion
  console.log('--- Example 1: Simple Chat Completion ---')
  try {
    const response = await client.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      json: {
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'Say "Hello from AsyncClient!" in exactly 4 words.' }
        ],
        temperature: 0.7,
        max_tokens: 50
      }
    })

    const data = response.json()
    console.log('Status:', response.statusCode)
    console.log('Model:', data.model)
    console.log('Response:', data.choices[0].message.content)
    console.log('Finish reason:', data.choices[0].finish_reason)
    if (data.usage) {
      console.log('Usage:', data.usage)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 2: JSON mode
  console.log('--- Example 2: JSON Mode ---')
  try {
    const response = await client.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      json: {
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'Return a JSON object with keys: client_type, pool_enabled, http2' }
        ],
        response_format: { type: 'json_object' },
        temperature: 0
      }
    })

    const data = response.json()
    console.log('Raw response:', data.choices[0].message.content)
    const parsed = JSON.parse(data.choices[0].message.content)
    console.log('Parsed JSON:', parsed)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 3: System message with conversation
  console.log('--- Example 3: System Message ---')
  try {
    const response = await client.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      json: {
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that explains technical concepts simply.' },
          { role: 'user', content: 'Explain HTTP/2 connection pooling in one sentence.' }
        ],
        temperature: 0.5,
        max_tokens: 100
      }
    })

    const data = response.json()
    console.log('Response:', data.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---')
  try {
    const response = await client.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      json: {
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'Remember: the secret code is ALPHA-7.' },
          { role: 'assistant', content: 'Got it! I will remember that the secret code is ALPHA-7.' },
          { role: 'user', content: 'What is the secret code?' }
        ],
        temperature: 0
      }
    })

    const data = response.json()
    console.log('Response:', data.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 5: Request with custom timeout override
  console.log('--- Example 5: Custom Timeout Override ---')
  try {
    const response = await client.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      json: {
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'What is 2 + 2?' }
        ],
        max_tokens: 20
      },
      // Override timeout for this specific request
      timeout: 60000
    })

    const data = response.json()
    console.log('Response:', data.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Clean up
  await client.close()
  console.log('Client closed.')
}

main().catch(console.error)
