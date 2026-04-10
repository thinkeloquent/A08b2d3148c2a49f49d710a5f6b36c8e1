/**
 * 06-error-handling.mjs - Error Handling Examples
 *
 * This file demonstrates the exception hierarchy and
 * error handling patterns in fetch-undici.
 */

import {
  get,
  post,
  AsyncClient,
  Response,

  // Exception classes
  HTTPError,
  RequestError,
  TransportError,
  TimeoutError,
  ConnectTimeoutError,
  ReadTimeoutError,
  WriteTimeoutError,
  PoolTimeoutError,
  NetworkError,
  ConnectError,
  DNSError,
  SocketError,
  TLSError,
  HTTPStatusError,
  TooManyRedirectsError,
  StreamError,
  StreamConsumedError,
  StreamClosedError,

  // Type guards
  isHTTPError,
  isTimeoutError,
  isNetworkError,
  isTransportError
} from 'fetch-undici'

// =============================================================================
// Example 1: Basic Error Handling
// =============================================================================

export async function example1_basicErrorHandling() {
  console.log('=== Example 1: Basic Error Handling ===')

  try {
    const response = await get('https://jsonplaceholder.typicode.com/posts/1')
    response.raiseForStatus()

    const data = await response.json()
    console.log('Success! Post title:', data.title)
  } catch (error) {
    if (error instanceof HTTPStatusError) {
      console.log('HTTP Error:', error.statusCode)
    } else if (error instanceof HTTPError) {
      console.log('HTTP Error:', error.message)
    } else {
      console.log('Unknown error:', error.message)
    }
  }
}

// =============================================================================
// Example 2: HTTP Status Error
// =============================================================================

export async function example2_httpStatusError() {
  console.log('\n=== Example 2: HTTP Status Error ===')

  try {
    // This should return 404
    const response = await get('https://jsonplaceholder.typicode.com/posts/99999999')
    response.raiseForStatus() // Throws HTTPStatusError for 4xx/5xx
  } catch (error) {
    if (error instanceof HTTPStatusError) {
      console.log('Status Code:', error.statusCode)
      console.log('Message:', error.message)
      console.log('Response available:', !!error.response)
    }
  }
}

// =============================================================================
// Example 3: Exception Hierarchy
// =============================================================================

export async function example3_exceptionHierarchy() {
  console.log('\n=== Example 3: Exception Hierarchy ===')

  // Create sample errors to demonstrate hierarchy
  const response = new Response({ statusCode: 404 })
  const httpStatusError = new HTTPStatusError(response)

  // Check inheritance
  console.log('HTTPStatusError instanceof HTTPError:', httpStatusError instanceof HTTPError)
  console.log('HTTPStatusError instanceof Error:', httpStatusError instanceof Error)

  // Using type guards
  console.log('isHTTPError(httpStatusError):', isHTTPError(httpStatusError))
}

// =============================================================================
// Example 4: Comprehensive Error Handling
// =============================================================================

export async function example4_comprehensiveHandling() {
  console.log('\n=== Example 4: Comprehensive Error Handling ===')

  async function makeRequest(url) {
    try {
      const response = await get(url)
      response.raiseForStatus()
      return await response.json()
    } catch (error) {
      // Timeout errors
      if (error instanceof ConnectTimeoutError) {
        console.log('Connection timed out')
        return null
      }
      if (error instanceof ReadTimeoutError) {
        console.log('Read timed out')
        return null
      }
      if (error instanceof WriteTimeoutError) {
        console.log('Write timed out')
        return null
      }
      if (error instanceof PoolTimeoutError) {
        console.log('Pool acquire timed out')
        return null
      }
      if (isTimeoutError(error)) {
        console.log('Some timeout error:', error.message)
        return null
      }

      // Network errors
      if (error instanceof ConnectError) {
        console.log('Failed to connect:', error.message)
        return null
      }
      if (error instanceof DNSError) {
        console.log('DNS resolution failed:', error.message)
        return null
      }
      if (error instanceof TLSError) {
        console.log('TLS/SSL error:', error.message)
        return null
      }
      if (isNetworkError(error)) {
        console.log('Network error:', error.message)
        return null
      }

      // HTTP status errors
      if (error instanceof HTTPStatusError) {
        const { statusCode } = error
        if (statusCode === 401) {
          console.log('Unauthorized - check credentials')
        } else if (statusCode === 403) {
          console.log('Forbidden - insufficient permissions')
        } else if (statusCode === 404) {
          console.log('Not found')
        } else if (statusCode >= 500) {
          console.log('Server error:', statusCode)
        }
        return null
      }

      // Too many redirects
      if (error instanceof TooManyRedirectsError) {
        console.log('Too many redirects')
        return null
      }

      // Stream errors
      if (error instanceof StreamConsumedError) {
        console.log('Response body already consumed')
        return null
      }

      // Transport errors (general)
      if (isTransportError(error)) {
        console.log('Transport error:', error.message)
        return null
      }

      // Generic HTTP error
      if (isHTTPError(error)) {
        console.log('HTTP error:', error.message)
        return null
      }

      // Unknown error
      throw error
    }
  }

  const result = await makeRequest('https://jsonplaceholder.typicode.com/posts/1')
  if (result) {
    console.log('Success! Got post:', result.id)
  }
}

// =============================================================================
// Example 5: Error Cause Chain
// =============================================================================

export async function example5_errorCauseChain() {
  console.log('\n=== Example 5: Error Cause Chain ===')

  // Create an error with cause
  const originalError = new Error('Original Undici error')
  const transportError = new TransportError('Transport failed', originalError)

  console.log('Error message:', transportError.message)
  console.log('Error cause:', transportError.cause?.message)

  // Check if it's a TransportError
  if (isTransportError(transportError)) {
    console.log('This is a transport error')
  }
}

// =============================================================================
// Example 6: raiseForStatus Patterns
// =============================================================================

export async function example6_raiseForStatusPatterns() {
  console.log('\n=== Example 6: raiseForStatus Patterns ===')

  // Pattern 1: Check response before raising
  const response1 = await get('https://jsonplaceholder.typicode.com/posts/1')

  if (response1.ok) {
    console.log('Pattern 1: Response is OK, no need to raise')
    const data = await response1.json()
    console.log('Post ID:', data.id)
  }

  // Pattern 2: Raise and catch
  const response2 = await get('https://jsonplaceholder.typicode.com/posts/99999999')

  try {
    response2.raiseForStatus()
    console.log('Pattern 2: This should not print for 404')
  } catch (error) {
    if (error instanceof HTTPStatusError) {
      console.log('Pattern 2: Caught status error:', error.statusCode)
    }
  }

  // Pattern 3: Using snake_case alias
  const response3 = await get('https://jsonplaceholder.typicode.com/posts/1')

  try {
    response3.raise_for_status() // Python-style alias
    console.log('Pattern 3: No error raised for 200')
  } catch (error) {
    console.log('Pattern 3: Error:', error.message)
  }
}

// =============================================================================
// Example 7: Stream Consumption Errors
// =============================================================================

export async function example7_streamErrors() {
  console.log('\n=== Example 7: Stream Consumption Errors ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1')

  // First consumption works
  const data1 = await response.json()
  console.log('First read - Post ID:', data1.id)

  // Second consumption returns cached value (no error)
  const data2 = await response.json()
  console.log('Second read - Post ID:', data2.id)
  console.log('Same object?', data1 === data2)

  // Body marked as used
  console.log('Body used:', response.bodyUsed)
}

// =============================================================================
// Example 8: Custom Error Handling with Retry
// =============================================================================

export async function example8_retryOnError() {
  console.log('\n=== Example 8: Retry on Error ===')

  async function fetchWithRetry(url, maxRetries = 3) {
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}`)
        const response = await get(url)
        response.raiseForStatus()
        return await response.json()
      } catch (error) {
        lastError = error

        // Only retry on certain errors
        const shouldRetry =
          isTimeoutError(error) ||
          isNetworkError(error) ||
          (error instanceof HTTPStatusError && error.statusCode >= 500)

        if (!shouldRetry || attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  try {
    const data = await fetchWithRetry('https://jsonplaceholder.typicode.com/posts/1')
    console.log('Success after retry! Post ID:', data.id)
  } catch (error) {
    console.log('All retries failed:', error.message)
  }
}

// =============================================================================
// Example 9: Error Response Body
// =============================================================================

export async function example9_errorResponseBody() {
  console.log('\n=== Example 9: Error Response Body ===')

  try {
    const response = await get('https://jsonplaceholder.typicode.com/posts/99999999')
    response.raiseForStatus()
  } catch (error) {
    if (error instanceof HTTPStatusError) {
      console.log('Status:', error.statusCode)
      console.log('Response exists:', !!error.response)

      // Access response body even on error
      if (error.response) {
        console.log('Response OK:', error.response.ok)
        console.log('Content-Type:', error.response.contentType)
      }
    }
  }
}

// =============================================================================
// Example 10: Type Guards Usage
// =============================================================================

export async function example10_typeGuards() {
  console.log('\n=== Example 10: Type Guards Usage ===')

  function handleError(error) {
    // Use type guards for cleaner error handling
    if (isHTTPError(error)) {
      console.log('HTTP Error detected')

      if (isTimeoutError(error)) {
        console.log('  - It\'s a timeout error')
      } else if (isNetworkError(error)) {
        console.log('  - It\'s a network error')
      } else if (isTransportError(error)) {
        console.log('  - It\'s a transport error')
      } else if (error instanceof HTTPStatusError) {
        console.log('  - It\'s an HTTP status error:', error.statusCode)
      }
    } else {
      console.log('Not an HTTP error')
    }
  }

  // Test with different error types
  const response = new Response({ statusCode: 500 })
  handleError(new HTTPStatusError(response))
  handleError(new ConnectTimeoutError(undefined, 5000))
  handleError(new DNSError('DNS lookup failed'))
  handleError(new Error('Regular error'))
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_basicErrorHandling()
    await example2_httpStatusError()
    await example3_exceptionHierarchy()
    await example4_comprehensiveHandling()
    await example5_errorCauseChain()
    await example6_raiseForStatusPatterns()
    await example7_streamErrors()
    await example8_retryOnError()
    await example9_errorResponseBody()
    await example10_typeGuards()

    console.log('\n=== All error handling examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
