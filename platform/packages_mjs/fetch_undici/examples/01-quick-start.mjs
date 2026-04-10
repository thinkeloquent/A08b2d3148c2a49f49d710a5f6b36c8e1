/**
 * 01-quick-start.mjs - Basic fetch-undici Usage Examples
 *
 * This file demonstrates the simplest ways to make HTTP requests
 * using fetch-undici's convenience functions.
 */

import { get, post, put, patch, del, head, options, request } from 'fetch-undici'

// =============================================================================
// Example 1: Basic GET Request
// =============================================================================

export async function example1_basicGet() {
  console.log('=== Example 1: Basic GET Request ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1')

  console.log('Status:', response.statusCode)
  console.log('OK:', response.ok)

  const data = await response.json()
  console.log('Data:', JSON.stringify(data, null, 2))
}

// =============================================================================
// Example 2: GET with Query Parameters
// =============================================================================

export async function example2_getWithParams() {
  console.log('\n=== Example 2: GET with Query Parameters ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts', {
    params: {
      _limit: 3,
      _page: 1,
      userId: 1
    }
  })

  console.log('Status:', response.statusCode)
  const posts = await response.json()
  console.log('Posts count:', posts.length)
  console.log('First post:', posts[0]?.title)
}

// =============================================================================
// Example 3: GET with Custom Headers
// =============================================================================

export async function example3_getWithHeaders() {
  console.log('\n=== Example 3: GET with Custom Headers ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1', {
    headers: {
      Accept: 'application/json',
      'X-Request-ID': 'req-12345',
      'X-Custom-Header': 'custom-value'
    }
  })

  console.log('Status:', response.statusCode)
  console.log('Content-Type:', response.headers.get('content-type'))
}

// =============================================================================
// Example 4: POST with JSON Body
// =============================================================================

export async function example4_postJson() {
  console.log('\n=== Example 4: POST with JSON Body ===')

  const response = await post('https://jsonplaceholder.typicode.com/posts', {
    json: {
      title: 'Hello World',
      body: 'This is a test post',
      userId: 1
    }
  })

  console.log('Status:', response.statusCode)
  const created = await response.json()
  console.log('Created post ID:', created.id)
}

// =============================================================================
// Example 5: PUT Request (Full Update)
// =============================================================================

export async function example5_putRequest() {
  console.log('\n=== Example 5: PUT Request ===')

  const response = await put('https://jsonplaceholder.typicode.com/posts/1', {
    json: {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content',
      userId: 1
    }
  })

  console.log('Status:', response.statusCode)
  const updated = await response.json()
  console.log('Updated title:', updated.title)
}

// =============================================================================
// Example 6: PATCH Request (Partial Update)
// =============================================================================

export async function example6_patchRequest() {
  console.log('\n=== Example 6: PATCH Request ===')

  const response = await patch('https://jsonplaceholder.typicode.com/posts/1', {
    json: {
      title: 'Patched Title Only'
    }
  })

  console.log('Status:', response.statusCode)
  const patched = await response.json()
  console.log('Patched title:', patched.title)
}

// =============================================================================
// Example 7: DELETE Request
// =============================================================================

export async function example7_deleteRequest() {
  console.log('\n=== Example 7: DELETE Request ===')

  const response = await del('https://jsonplaceholder.typicode.com/posts/1')

  console.log('Status:', response.statusCode)
  console.log('Deleted successfully:', response.ok)
}

// =============================================================================
// Example 8: HEAD Request (Metadata Only)
// =============================================================================

export async function example8_headRequest() {
  console.log('\n=== Example 8: HEAD Request ===')

  const response = await head('https://jsonplaceholder.typicode.com/posts')

  console.log('Status:', response.statusCode)
  console.log('Content-Type:', response.headers.get('content-type'))
  console.log('Body used:', response.bodyUsed) // false for HEAD
}

// =============================================================================
// Example 9: OPTIONS Request (CORS Preflight)
// =============================================================================

export async function example9_optionsRequest() {
  console.log('\n=== Example 9: OPTIONS Request ===')

  const response = await options('https://jsonplaceholder.typicode.com/posts', {
    headers: {
      Origin: 'https://example.com',
      'Access-Control-Request-Method': 'POST'
    }
  })

  console.log('Status:', response.statusCode)
  console.log('Allow:', response.headers.get('access-control-allow-methods'))
}

// =============================================================================
// Example 10: Generic Request Method
// =============================================================================

export async function example10_genericRequest() {
  console.log('\n=== Example 10: Generic Request Method ===')

  // Using the generic request function for any HTTP method
  const response = await request('PATCH', 'https://jsonplaceholder.typicode.com/posts/1', {
    json: { title: 'Using generic request' }
  })

  console.log('Status:', response.statusCode)
  const data = await response.json()
  console.log('Title:', data.title)
}

// =============================================================================
// Example 11: Form URL-Encoded Data
// =============================================================================

export async function example11_formData() {
  console.log('\n=== Example 11: Form URL-Encoded Data ===')

  const response = await post('https://httpbin.org/post', {
    data: {
      username: 'alice',
      password: '********',
      remember: 'true'
    }
  })

  console.log('Status:', response.statusCode)
  const result = await response.json()
  console.log('Form data received:', result.form)
}

// =============================================================================
// Example 12: Response Properties
// =============================================================================

export async function example12_responseProperties() {
  console.log('\n=== Example 12: Response Properties ===')

  const response = await get('https://jsonplaceholder.typicode.com/posts/1')

  // Status properties
  console.log('statusCode:', response.statusCode)
  console.log('ok:', response.ok)
  console.log('isSuccess:', response.isSuccess)
  console.log('isRedirect:', response.isRedirect)
  console.log('isClientError:', response.isClientError)
  console.log('isServerError:', response.isServerError)
  console.log('isError:', response.isError)

  // Header access
  console.log('Content-Type:', response.contentType)
  console.log('Content-Length:', response.contentLength)

  // Body methods
  const json = await response.json()
  console.log('JSON parsed:', typeof json)
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_basicGet()
    await example2_getWithParams()
    await example3_getWithHeaders()
    await example4_postJson()
    await example5_putRequest()
    await example6_patchRequest()
    await example7_deleteRequest()
    await example8_headRequest()
    // await example9_optionsRequest() // May fail on some servers
    await example10_genericRequest()
    // await example11_formData() // Requires httpbin.org
    await example12_responseProperties()

    console.log('\n=== All examples completed successfully! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
