/**
 * Gemini OpenAI-Compatible Generic SDK Pool Example
 *
 * Uses the generic PoolClient from fetch-undici SDK.
 * This demonstrates using the generic pool factory to connect to Gemini's
 * OpenAI-compatible endpoint (or any other API).
 *
 * Run: node 2.gemini-openai-generic-sdk-pool.mjs
 */

import {
  getPool,
  closePool,
  closeAllPools,
  getActivePoolOrigins
} from '../../packages_mjs/fetch_undici/dist/sdk/pool.js'

import {
  GEMINI_ORIGIN,
  GEMINI_CHAT_COMPLETIONS_PATH,
  GEMINI_POOL_CONNECTIONS,
  GEMINI_HTTP2_ENABLED,
  GEMINI_HEADERS_TIMEOUT_MS,
} from '../../packages_mjs/fetch_undici_gemini_openai_constant/dist/index.js'

async function main() {
  console.log('='.repeat(60))
  console.log('Gemini OpenAI-Compatible Generic SDK Pool Example')
  console.log('='.repeat(60))
  console.log()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is required')
    process.exit(1)
  }

  // Get singleton pool for Gemini origin with auth header (using Gemini constants)
  const pool = getPool(GEMINI_ORIGIN, {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    timeoutMs: GEMINI_HEADERS_TIMEOUT_MS,      // 300s for thinking models
    maxConnections: GEMINI_POOL_CONNECTIONS,   // 100 - High ceiling for LLM workloads
    http2: GEMINI_HTTP2_ENABLED
  })

  console.log(`Origin: ${pool.originHost}`)
  console.log(`Active pools: ${getActivePoolOrigins().join(', ')}`)
  console.log()

  // Example 1: Simple chat completion using generic post()
  console.log('--- Example 1: Simple Chat Completion ---')
  try {
    const response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'user', content: 'Say "Hello from Generic SDK Pool!" in exactly 6 words.' }
      ],
      temperature: 0.7,
      max_tokens: 50
    })

    console.log('Model:', response.model)
    console.log('Response:', response.choices[0].message.content)
    console.log('Finish reason:', response.choices[0].finish_reason)
    if (response.usage) {
      console.log('Usage:', response.usage)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 2: JSON mode
  console.log('--- Example 2: JSON Mode ---')
  try {
    const response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'user', content: 'Return a JSON object with keys: service, pool_type, active' }
      ],
      response_format: { type: 'json_object' },
      temperature: 0
    })

    console.log('Raw response:', response.choices[0].message.content)
    const parsed = JSON.parse(response.choices[0].message.content)
    console.log('Parsed JSON:', parsed)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 3: Using raw request() for more control
  console.log('--- Example 3: Raw Request with Custom Headers ---')
  try {
    const rawResponse = await pool.request({
      path: GEMINI_CHAT_COMPLETIONS_PATH,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Custom-Header': 'custom-value'
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'What HTTP method is used for creating resources?' }
        ],
        max_tokens: 100
      })
    })

    console.log('Status:', rawResponse.statusCode)
    const data = await rawResponse.body.json()
    console.log('Response:', data.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---')
  try {
    const response = await pool.post(GEMINI_CHAT_COMPLETIONS_PATH, {
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'My favorite number is 42.' },
        { role: 'assistant', content: 'That is a great number! The answer to life, the universe, and everything.' },
        { role: 'user', content: 'What is my favorite number?' }
      ],
      temperature: 0
    })

    console.log('Response:', response.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 5: Demonstrate pool reuse
  console.log('--- Example 5: Pool Reuse (same origin) ---')
  const pool2 = getPool(GEMINI_ORIGIN) // Same origin, returns cached pool
  console.log('Same pool instance:', pool === pool2)
  console.log('Active pool origins:', getActivePoolOrigins())
  console.log()

  // Clean up
  await closeAllPools()
  console.log('All pools closed.')
  console.log('Active pool origins after close:', getActivePoolOrigins())
}

main().catch(console.error)
