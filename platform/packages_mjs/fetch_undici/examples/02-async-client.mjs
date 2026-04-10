/**
 * 02-async-client.mjs - AsyncClient Usage Examples
 *
 * This file demonstrates the AsyncClient class for making HTTP requests
 * with shared configuration, base URL, and connection management.
 */

import {
  AsyncClient,
  Timeout,
  Limits
} from 'fetch-undici'

// =============================================================================
// Example 1: Basic AsyncClient
// =============================================================================

export async function example1_basicClient() {
  console.log('=== Example 1: Basic AsyncClient ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // All requests use the base URL
    const response = await client.get('/posts/1')
    console.log('Status:', response.statusCode)

    const post = await response.json()
    console.log('Post title:', post.title)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 2: Client with Default Headers
// =============================================================================

export async function example2_defaultHeaders() {
  console.log('\n=== Example 2: Client with Default Headers ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    headers: {
      'Accept': 'application/json',
      'X-API-Version': '2.0',
      'X-Client-Name': 'fetch-undici-examples'
    }
  })

  try {
    // Default headers are sent with every request
    const response = await client.get('/posts/1')
    console.log('Status:', response.statusCode)

    // Can also add/override headers per request
    const response2 = await client.get('/posts/2', {
      headers: { 'X-Request-ID': 'req-12345' }
    })
    console.log('Status:', response2.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 3: Timeout Configuration
// =============================================================================

export async function example3_timeoutConfig() {
  console.log('\n=== Example 3: Timeout Configuration ===')

  // Simple timeout (all values)
  const client1 = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 30000 // 30 seconds for all
  })

  // Granular timeout
  const client2 = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: new Timeout({
      connect: 5000,   // Connection timeout: 5s
      read: 30000,     // Read timeout: 30s
      write: 30000,    // Write timeout: 30s
      pool: 5000       // Pool acquire timeout: 5s
    })
  })

  try {
    const response = await client2.get('/posts/1')
    console.log('Status:', response.statusCode)

    // Per-request timeout override
    const response2 = await client2.get('/posts/2', {
      timeout: 60000 // Override to 60 seconds
    })
    console.log('Status:', response2.statusCode)
  } finally {
    await client1.close()
    await client2.close()
  }
}

// =============================================================================
// Example 4: Connection Limits
// =============================================================================

export async function example4_connectionLimits() {
  console.log('\n=== Example 4: Connection Limits ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    limits: new Limits({
      maxConnections: 100,         // Total connections
      maxConnectionsPerHost: 10,   // Per origin
      keepAliveTimeout: 30000,     // Keep-alive: 30s
      keepAliveMaxTimeout: 600000  // Max keep-alive: 10min
    })
  })

  try {
    // Make multiple concurrent requests
    const [r1, r2, r3] = await Promise.all([
      client.get('/posts/1'),
      client.get('/posts/2'),
      client.get('/posts/3')
    ])

    console.log('Request 1 status:', r1.statusCode)
    console.log('Request 2 status:', r2.statusCode)
    console.log('Request 3 status:', r3.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 5: All HTTP Methods
// =============================================================================

export async function example5_allMethods() {
  console.log('\n=== Example 5: All HTTP Methods ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // GET
    const getResp = await client.get('/posts/1')
    console.log('GET:', getResp.statusCode)

    // POST
    const postResp = await client.post('/posts', {
      json: { title: 'New Post', body: 'Content', userId: 1 }
    })
    console.log('POST:', postResp.statusCode)

    // PUT
    const putResp = await client.put('/posts/1', {
      json: { id: 1, title: 'Updated', body: 'Content', userId: 1 }
    })
    console.log('PUT:', putResp.statusCode)

    // PATCH
    const patchResp = await client.patch('/posts/1', {
      json: { title: 'Patched' }
    })
    console.log('PATCH:', patchResp.statusCode)

    // DELETE
    const deleteResp = await client.delete('/posts/1')
    console.log('DELETE:', deleteResp.statusCode)

    // HEAD
    const headResp = await client.head('/posts')
    console.log('HEAD:', headResp.statusCode)

    // Generic request method
    const reqResp = await client.request('OPTIONS', '/posts')
    console.log('OPTIONS:', reqResp.statusCode)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 6: Query Parameters
// =============================================================================

export async function example6_queryParams() {
  console.log('\n=== Example 6: Query Parameters ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    // Default query params for all requests
    params: {
      _format: 'json'
    }
  })

  try {
    // Add request-specific params (merged with defaults)
    const response = await client.get('/posts', {
      params: {
        _limit: 5,
        _page: 1,
        userId: 1
      }
    })

    console.log('Status:', response.statusCode)
    const posts = await response.json()
    console.log('Posts count:', posts.length)
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 7: Redirect Handling
// =============================================================================

export async function example7_redirectHandling() {
  console.log('\n=== Example 7: Redirect Handling ===')

  // Client with redirect following enabled (default)
  const client = new AsyncClient({
    followRedirects: true,
    maxRedirects: 10
  })

  try {
    // This URL typically redirects
    const response = await client.get('https://httpbin.org/redirect/2')

    console.log('Final status:', response.statusCode)
    console.log('Redirect history length:', response.history.length)

    // Each item in history is a previous response
    for (const prev of response.history) {
      console.log('  Redirect:', prev.statusCode, prev.headers.get('location'))
    }
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 8: Multiple Clients
// =============================================================================

export async function example8_multipleClients() {
  console.log('\n=== Example 8: Multiple Clients ===')

  // Different clients for different services
  const postsClient = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    headers: { 'X-Service': 'posts' }
  })

  const usersClient = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    headers: { 'X-Service': 'users' }
  })

  try {
    // Make parallel requests to different endpoints
    const [postsResp, usersResp] = await Promise.all([
      postsClient.get('/posts?_limit=2'),
      usersClient.get('/users?_limit=2')
    ])

    const posts = await postsResp.json()
    const users = await usersResp.json()

    console.log('Posts:', posts.length)
    console.log('Users:', users.length)
  } finally {
    await Promise.all([
      postsClient.close(),
      usersClient.close()
    ])
  }
}

// =============================================================================
// Example 9: Request with Files (Multipart)
// =============================================================================

export async function example9_fileUpload() {
  console.log('\n=== Example 9: File Upload (Multipart) ===')

  const client = new AsyncClient({
    baseUrl: 'https://httpbin.org'
  })

  try {
    const response = await client.post('/post', {
      data: {
        description: 'Test upload',
        tags: 'test,example'
      },
      files: {
        document: {
          content: Buffer.from('Hello, World!'),
          filename: 'hello.txt',
          contentType: 'text/plain'
        }
      }
    })

    console.log('Status:', response.statusCode)
    const result = await response.json()
    console.log('Files received:', Object.keys(result.files || {}))
  } catch (error) {
    console.log('Note: httpbin.org may not be available')
  } finally {
    await client.close()
  }
}

// =============================================================================
// Example 10: Client Lifecycle
// =============================================================================

export async function example10_clientLifecycle() {
  console.log('\n=== Example 10: Client Lifecycle ===')

  const client = new AsyncClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  console.log('Client created')

  try {
    // Make requests
    const r1 = await client.get('/posts/1')
    console.log('Request 1:', r1.statusCode)

    const r2 = await client.get('/posts/2')
    console.log('Request 2:', r2.statusCode)

    // Check if client is still open
    console.log('Client still open: yes')
  } finally {
    // Always close the client when done
    await client.close()
    console.log('Client closed')
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_basicClient()
    await example2_defaultHeaders()
    await example3_timeoutConfig()
    await example4_connectionLimits()
    await example5_allMethods()
    await example6_queryParams()
    // await example7_redirectHandling() // Requires httpbin.org
    await example8_multipleClients()
    // await example9_fileUpload() // Requires httpbin.org
    await example10_clientLifecycle()

    console.log('\n=== All AsyncClient examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
