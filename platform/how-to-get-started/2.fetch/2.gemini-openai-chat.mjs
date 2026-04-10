/**
 * Gemini OpenAI-Compatible Chat Example
 *
 * Uses fetch_undici to demonstrate chat completions with Gemini's OpenAI-compatible endpoint.
 * Shows various chat patterns: system messages, multi-turn, JSON mode.
 *
 * Run: node 2.gemini-openai-chat.mjs
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const { request } = await import(join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Gemini OpenAI-compatible endpoint
const CHAT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function chatCompletion(messages, options = {}) {
  const payload = {
    model: options.model || 'gemini-2.0-flash',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 1000,
    ...options,
  };

  const { statusCode, body } = await request(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await body.text();

  if (statusCode >= 400) {
    throw new Error(`${statusCode}: ${text}`);
  }

  return JSON.parse(text);
}

async function main() {
  console.log('='.repeat(60));
  console.log('Gemini OpenAI-Compatible Chat Examples');
  console.log('='.repeat(60));
  console.log();

  // Example 1: Basic chat
  console.log('--- Example 1: Basic Chat ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'What is the capital of France? Reply in one word.' }
    ]);

    console.log('Response:', response.choices[0].message.content);
    console.log('Model:', response.model);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 2: System message (persona)
  console.log('--- Example 2: System Message (Persona) ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a pirate. Always respond like a pirate would.' },
      { role: 'user', content: 'How do you greet someone?' }
    ], { temperature: 0.9 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 3: Multi-turn conversation
  console.log('--- Example 3: Multi-turn Conversation ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'I am thinking of a number between 1 and 10. It is 7.' },
      { role: 'assistant', content: 'Got it! You are thinking of the number 7.' },
      { role: 'user', content: 'What number am I thinking of?' }
    ], { temperature: 0 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 4: Creative writing
  console.log('--- Example 4: Creative Writing ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a creative poet who writes haikus.' },
      { role: 'user', content: 'Write a haiku about coding.' }
    ], { temperature: 0.8, max_tokens: 100 });

    console.log('Response:');
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 5: JSON mode
  console.log('--- Example 5: JSON Mode ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'Generate a user profile with name, email, and age in JSON format.' }
    ], {
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    console.log('Raw:', content);
    console.log('Parsed:', JSON.parse(content));
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 6: Technical assistance
  console.log('--- Example 6: Technical Assistance ---');
  try {
    const response = await chatCompletion([
      { role: 'system', content: 'You are a helpful programming assistant. Be concise.' },
      { role: 'user', content: 'Explain what a REST API is in 2 sentences.' }
    ], { temperature: 0.3 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log();

  // Example 7: Long conversation history
  console.log('--- Example 7: Long Conversation History ---');
  try {
    const response = await chatCompletion([
      { role: 'user', content: 'My name is Bob.' },
      { role: 'assistant', content: 'Hello Bob! Nice to meet you.' },
      { role: 'user', content: 'I live in Seattle.' },
      { role: 'assistant', content: 'Seattle is a great city! Lots of rain but beautiful scenery.' },
      { role: 'user', content: 'What do you know about me so far?' }
    ], { temperature: 0 });

    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Chat Examples Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
