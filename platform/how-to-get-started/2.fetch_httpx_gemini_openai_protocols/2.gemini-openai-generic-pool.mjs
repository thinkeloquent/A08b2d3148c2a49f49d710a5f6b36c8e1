/**
 * Gemini OpenAI-Compatible Generic Pool Example
 *
 * Uses the GeminiClient from fetch-undici-gemini-openai-protocols package.
 * This provides a singleton connection pool specifically configured for Gemini's
 * OpenAI-compatible endpoint.
 *
 * Run: node 2.gemini-openai-generic-pool.mjs
 */

import {
  getGeminiClient,
  closeGeminiClient,
  GEMINI_ORIGIN,
  GEMINI_CHAT_COMPLETIONS_PATH
} from '../../packages_mjs/fetch_undici_gemini_openai_protocols/dist/index.js'

async function main() {
  console.log('='.repeat(60))
  console.log('Gemini OpenAI-Compatible Generic Pool Example')
  console.log('='.repeat(60))
  console.log()

  // Get singleton Gemini client (uses GEMINI_API_KEY env var)
  // Default origin: https://generativelanguage.googleapis.com
  const gemini = getGeminiClient(GEMINI_ORIGIN, {
    timeoutMs: 30000,
    maxConnections: 100,
    http2: true
  })

  console.log(`Origin: ${gemini.originHost}`)
  console.log(`Endpoint: ${GEMINI_CHAT_COMPLETIONS_PATH}`)
  console.log()

  // Example 1: Simple chat completion
  console.log('--- Example 1: Simple Chat Completion ---')
  try {
    const response = await gemini.chatCompletions({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'user', content: 'Say "Hello from Gemini Pool!" in exactly 5 words.' }
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
    const response = await gemini.chatCompletions({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'user', content: 'Return a JSON object with keys: name, status, timestamp' }
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

  // Example 3: System message
  console.log('--- Example 3: System Message ---')
  try {
    const response = await gemini.chatCompletions({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds in haiku format.' },
        { role: 'user', content: 'Describe connection pooling.' }
      ],
      temperature: 0.8
    })

    console.log('Response:')
    console.log(response.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Example 4: Multi-turn conversation
  console.log('--- Example 4: Multi-turn Conversation ---')
  try {
    const response = await gemini.chatCompletions({
      model: 'gemini-2.0-flash',
      messages: [
        { role: 'user', content: 'My name is Alice.' },
        { role: 'assistant', content: 'Hello Alice! Nice to meet you.' },
        { role: 'user', content: 'What is my name?' }
      ],
      temperature: 0
    })

    console.log('Response:', response.choices[0].message.content)
  } catch (error) {
    console.error('Error:', error.message)
  }
  console.log()

  // Clean up
  await closeGeminiClient()
  console.log('Client closed.')
}

main().catch(console.error)
