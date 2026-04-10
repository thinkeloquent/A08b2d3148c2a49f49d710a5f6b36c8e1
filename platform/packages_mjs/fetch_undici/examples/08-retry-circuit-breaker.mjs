/**
 * 08-retry-circuit-breaker.mjs - Retry Patterns & Circuit Breaker Examples
 *
 * This file demonstrates industry-standard retry patterns:
 * - Capped exponential backoff with jitter
 * - Retry-After header support
 * - Idempotency-aware retry
 * - Circuit breaker pattern
 */

import {
  AsyncClient,
  createSDK,
  JitterStrategy,
  CircuitBreaker,
  CircuitOpenError
} from 'fetch-undici'

// =============================================================================
// Example 1: Basic Retry Configuration
// =============================================================================

export async function example1_basicRetry() {
  console.log('=== Example 1: Basic Retry Configuration ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryDelay: 500,           // Initial delay 500ms
      retryBackoff: 2.0,         // Double each retry
      maxRetryDelay: 30000,      // Cap at 30 seconds
      retryOnStatus: [429, 500, 502, 503, 504],
      retryOnException: true     // Retry on connection errors
    }
  })

  try {
    // Requests will automatically retry on transient failures
    const response = await client.get('/posts/1')
    console.log('Status:', response.statusCode)
    console.log('Success:', response.ok)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 2: Jitter Strategies
// =============================================================================

export async function example2_jitterStrategies() {
  console.log('\n=== Example 2: Jitter Strategies ===')

  // Available strategies:
  // - NONE: No jitter, exact exponential backoff
  // - FULL: Random between 0 and calculated delay (recommended)
  // - EQUAL: Half fixed, half random
  // - DECORRELATED: Based on previous delay (good for correlated failures)

  console.log('Jitter strategies:')
  console.log('  NONE:', JitterStrategy.NONE)
  console.log('  FULL:', JitterStrategy.FULL)
  console.log('  EQUAL:', JitterStrategy.EQUAL)
  console.log('  DECORRELATED:', JitterStrategy.DECORRELATED)

  // Full jitter (recommended for most cases)
  const clientFull = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryDelay: 500,
      jitter: JitterStrategy.FULL
    }
  })

  // Decorrelated jitter (good for distributed systems)
  const clientDecorrelated = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryDelay: 500,
      jitter: JitterStrategy.DECORRELATED
    }
  })

  try {
    const [r1, r2] = await Promise.all([
      clientFull.get('/posts/1'),
      clientDecorrelated.get('/posts/1')
    ])

    console.log('Full jitter response:', r1.ok)
    console.log('Decorrelated jitter response:', r2.ok)
  } finally {
    await Promise.all([
      clientFull.close(),
      clientDecorrelated.close()
    ])
  }
}

// =============================================================================
// Example 3: Retry-After Header Support
// =============================================================================

export async function example3_retryAfterHeader() {
  console.log('\n=== Example 3: Retry-After Header Support ===')

  // When respectRetryAfter is true (default), the client will honor
  // the Retry-After header from 429/503 responses

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      respectRetryAfter: true,   // Honor Retry-After header (default)
      maxRetryDelay: 60000       // Cap Retry-After at 60 seconds
    }
  })

  try {
    // If server returns Retry-After: 5, client waits 5 seconds
    // If server returns Retry-After: Wed, 21 Oct 2025 07:28:00 GMT,
    // client calculates delay from that time
    const response = await client.get('/posts/1')
    console.log('Status:', response.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 4: Idempotency-Aware Retry
// =============================================================================

export async function example4_idempotencyAwareRetry() {
  console.log('\n=== Example 4: Idempotency-Aware Retry ===')

  // By default, only idempotent methods are retried:
  // GET, HEAD, OPTIONS, TRACE, PUT, DELETE
  //
  // POST and PATCH are NOT retried by default to prevent duplicates

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryOnStatus: [429, 500, 502, 503, 504]
      // retryMethods not specified = idempotent methods only
    }
  })

  try {
    // GET - will retry on failure
    const getResponse = await client.get('/posts/1')
    console.log('GET (idempotent, retried):', getResponse.ok)

    // POST - will NOT retry by default
    const postResponse = await client.post('/posts', {
      json: { title: 'Test', body: 'Content', userId: 1 }
    })
    console.log('POST (not idempotent, not retried by default):', postResponse.ok)

    // POST with Idempotency-Key header - WILL retry
    const idempotentPost = await client.post('/posts', {
      headers: {
        'Idempotency-Key': 'unique-request-id-123'
      },
      json: { title: 'Test', body: 'Content', userId: 1 }
    })
    console.log('POST with Idempotency-Key (will retry):', idempotentPost.ok)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 5: Force Retry All Methods
// =============================================================================

export async function example5_forceRetryAllMethods() {
  console.log('\n=== Example 5: Force Retry All Methods ===')

  // Use retryMethods to explicitly allow retry for all methods
  // WARNING: This may cause duplicate POST/PATCH requests

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']  // Force all
    }
  })

  try {
    // Now POST will also retry on failure
    const response = await client.post('/posts', {
      json: { title: 'Test', body: 'Content', userId: 1 }
    })
    console.log('POST (forced retry enabled):', response.ok)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 6: Circuit Breaker
// =============================================================================

export async function example6_circuitBreaker() {
  console.log('\n=== Example 6: Circuit Breaker ===')

  // Circuit breaker prevents cascading failures
  // States: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (testing)

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    circuitBreaker: {
      failureThreshold: 5,     // Open after 5 failures
      successThreshold: 2,     // Close after 2 successes in half-open
      timeout: 30000,          // Try half-open after 30 seconds
      enabled: true
    }
  })

  try {
    // Access circuit breaker state
    const breaker = client.circuitBreaker
    console.log('Initial state:', breaker?.state)
    console.log('Is open:', breaker?.isOpen)
    console.log('Failure count:', breaker?.failureCount)

    // Make a request
    const response = await client.get('/posts/1')
    console.log('Request succeeded:', response.ok)
    console.log('State after success:', breaker?.state)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 7: Standalone Circuit Breaker
// =============================================================================

export async function example7_standaloneCircuitBreaker() {
  console.log('\n=== Example 7: Standalone Circuit Breaker ===')

  // Use circuit breaker independently
  const breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 5000
  })

  console.log('Initial state:', breaker.state)

  // Simulate failures
  for (let i = 0; i < 3; i++) {
    breaker.recordFailure()
    console.log(`After failure ${i + 1}:`, breaker.state)
  }

  // Circuit should be open now
  console.log('Can make request:', breaker.allowRequest())

  // Try to make request when open
  if (!breaker.allowRequest()) {
    console.log('Circuit is open, request blocked')
  }

  // Reset for demo
  breaker.reset()
  console.log('After reset:', breaker.state)
}

// =============================================================================
// Example 8: Handle Circuit Open Error
// =============================================================================

export async function example8_handleCircuitOpenError() {
  console.log('\n=== Example 8: Handle Circuit Open Error ===')

  const breaker = new CircuitBreaker({
    failureThreshold: 2,
    timeout: 5000
  })

  // Force circuit open
  breaker.recordFailure()
  breaker.recordFailure()

  // Check if request is allowed
  if (!breaker.allowRequest()) {
    const error = new CircuitOpenError('Service temporarily unavailable')
    console.log('Error name:', error.name)
    console.log('Error message:', error.message)

    // Handle gracefully - return cached data, show error, etc.
    console.log('Handling: Return cached data or show maintenance message')
  }
}

// =============================================================================
// Example 9: SDK with Full Retry Configuration
// =============================================================================

export async function example9_sdkFullRetry() {
  console.log('\n=== Example 9: SDK with Full Retry Configuration ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,

    // Retry configuration
    maxRetries: 5,
    retryDelay: 500,
    retryBackoff: 2.0,
    maxRetryDelay: 30000,
    jitter: JitterStrategy.FULL,
    retryOnStatus: [429, 500, 502, 503, 504],
    retryOnException: true,
    respectRetryAfter: true,

    // Circuit breaker
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000
    }
  })

  try {
    const result = await sdk.get('/posts/1')

    console.log('Success:', result.success)
    console.log('Status:', result.statusCode)
    console.log('Duration:', result.duration, 'ms')
    console.log('Circuit state:', sdk.circuitBreaker?.state)
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 10: LLM API Client Configuration
// =============================================================================

export async function example10_llmApiClient() {
  console.log('\n=== Example 10: LLM API Client Configuration ===')

  // Configuration optimized for LLM API calls (OpenAI, Anthropic, etc.)
  // - Longer timeouts for generation
  // - Conservative retry for rate limits
  // - Circuit breaker for service outages

  const llmClient = new AsyncClient({
    baseUrl: 'https://api.openai.com',  // Example
    headers: {
      'Authorization': 'Bearer sk-your-api-key'
    },
    timeout: {
      connect: 5000,    // 5s to connect
      read: 120000      // 2 minutes for LLM response
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000,        // Start with 1 second
      retryBackoff: 2.0,
      maxRetryDelay: 60000,    // Cap at 1 minute
      jitter: JitterStrategy.FULL,
      retryOnStatus: [429, 500, 502, 503],
      retryOnException: true,
      respectRetryAfter: true  // Important for rate limits
    },
    circuitBreaker: {
      failureThreshold: 5,
      timeout: 60000           // 1 minute before retry
    }
  })

  console.log('LLM client configured with:')
  console.log('  - 2 minute read timeout')
  console.log('  - Up to 3 retries with exponential backoff')
  console.log('  - Full jitter to prevent thundering herd')
  console.log('  - Retry-After header support for rate limits')
  console.log('  - Circuit breaker for service protection')

  await llmClient.close()
}

// =============================================================================
// Example 11: Retry Only Specific Errors
// =============================================================================

export async function example11_retrySpecificErrors() {
  console.log('\n=== Example 11: Retry Only Specific Errors ===')

  // Don't retry on 4xx client errors (except 429 rate limit)
  // Only retry on server errors and rate limits

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryOnStatus: [429, 500, 502, 503, 504],  // No 400, 401, 403, 404
      retryOnException: true  // Still retry on connection errors
    }
  })

  try {
    // 404 - will NOT retry
    const notFound = await client.get('/posts/99999')
    console.log('404 response (not retried):', notFound.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 12: Disable Retry for Specific Request
// =============================================================================

export async function example12_disableRetryPerRequest() {
  console.log('\n=== Example 12: Disable Retry for Specific Request ===')

  // Client-level retry is enabled, but can be overridden per-request
  // by using a separate client or managing state

  const clientWithRetry = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3
    }
  })

  const clientNoRetry = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
    // No retry config
  })

  try {
    // This request uses retry
    const withRetry = await clientWithRetry.get('/posts/1')
    console.log('With retry:', withRetry.ok)

    // This request has no retry
    const noRetry = await clientNoRetry.get('/posts/1')
    console.log('Without retry:', noRetry.ok)
  } finally {
    await Promise.all([
      clientWithRetry.close(),
      clientNoRetry.close()
    ])
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_basicRetry()
    await example2_jitterStrategies()
    await example3_retryAfterHeader()
    await example4_idempotencyAwareRetry()
    await example5_forceRetryAllMethods()
    await example6_circuitBreaker()
    await example7_standaloneCircuitBreaker()
    await example8_handleCircuitOpenError()
    await example9_sdkFullRetry()
    await example10_llmApiClient()
    await example11_retrySpecificErrors()
    await example12_disableRetryPerRequest()

    console.log('\n=== All retry & circuit breaker examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
