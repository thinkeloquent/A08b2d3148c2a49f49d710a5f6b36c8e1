/**
 * 05-sdk-usage.mjs - SDK Layer Examples
 *
 * This file demonstrates the SDK layer for CLI tools,
 * LLM Agents, and DevTools integration.
 */

import {
  createSDK,
  CLIContext,
  AgentHTTPClient
} from 'fetch-undici/sdk'

// =============================================================================
// Example 1: Basic SDK Usage
// =============================================================================

export async function example1_basicSdk() {
  console.log('=== Example 1: Basic SDK Usage ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 30000,
    retry: {
      maxRetries: 3,
      retryDelay: 1000
    }
  })

  try {
    // Simple GET request
    const result = await sdk.get('/posts/1')

    console.log('Success:', result.success)
    console.log('Status:', result.statusCode)
    console.log('Duration:', result.duration, 'ms')

    if (result.success) {
      console.log('Post title:', result.data?.title)
    }
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 2: SDK with Bearer Auth
// =============================================================================

export async function example2_sdkWithAuth() {
  console.log('\n=== Example 2: SDK with Bearer Auth ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    auth: {
      type: 'bearer',
      token: 'my-jwt-token'
    }
  })

  try {
    const result = await sdk.get('/posts/1')
    console.log('Success:', result.success)
    console.log('Headers sent with auth:', 'Authorization' in result.headers || result.success)
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 3: SDK CRUD Operations
// =============================================================================

export async function example3_sdkCrud() {
  console.log('\n=== Example 3: SDK CRUD Operations ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // CREATE
    const createResult = await sdk.post('/posts', {
      title: 'New Post',
      body: 'Post content',
      userId: 1
    })
    console.log('CREATE:', createResult.success, createResult.data?.id)

    // READ
    const readResult = await sdk.get('/posts/1')
    console.log('READ:', readResult.success, readResult.data?.title)

    // UPDATE
    const updateResult = await sdk.put('/posts/1', {
      id: 1,
      title: 'Updated Post',
      body: 'Updated content',
      userId: 1
    })
    console.log('UPDATE:', updateResult.success)

    // PATCH
    const patchResult = await sdk.patch('/posts/1', {
      title: 'Patched Title'
    })
    console.log('PATCH:', patchResult.success)

    // DELETE
    const deleteResult = await sdk.delete('/posts/1')
    console.log('DELETE:', deleteResult.success)
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 4: CLI Context
// =============================================================================

export async function example4_cliContext() {
  console.log('\n=== Example 4: CLI Context ===')

  const cli = new CLIContext({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    verbose: true
  })

  try {
    // Make a request
    const response = await cli.get('/posts/1')
    console.log('Status:', response.statusCode)

    const data = await response.json()
    console.log('Post ID:', data.id)
  } finally {
    await cli.close()
  }
}

// =============================================================================
// Example 5: CLI Context with Progress
// =============================================================================

export async function example5_cliProgress() {
  console.log('\n=== Example 5: CLI Context with Progress ===')

  const cli = new CLIContext({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    verbose: true,
    onProgress: (downloaded, total) => {
      if (total) {
        const percent = ((downloaded / total) * 100).toFixed(1)
        process.stdout.write(`\rDownloading: ${percent}%`)
      } else {
        process.stdout.write(`\rDownloaded: ${downloaded} bytes`)
      }
    }
  })

  try {
    // Download with progress tracking
    const response = await cli.get('/posts')
    const data = await response.json()
    console.log('\nPosts count:', data.length)
  } finally {
    await cli.close()
  }
}

// =============================================================================
// Example 6: Agent HTTP Client
// =============================================================================

export async function example6_agentClient() {
  console.log('\n=== Example 6: Agent HTTP Client ===')

  const agent = new AgentHTTPClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // Structured response suitable for LLM consumption
    const result = await agent.request('GET', '/posts/1', {
      description: 'Fetch post by ID'
    })

    console.log('Success:', result.success)
    console.log('Status:', result.statusCode)
    console.log('Summary:', result.summary)

    if (result.success) {
      console.log('Data keys:', Object.keys(result.data || {}))
    }
  } finally {
    await agent.close()
  }
}

// =============================================================================
// Example 7: Agent Error Handling
// =============================================================================

export async function example7_agentErrors() {
  console.log('\n=== Example 7: Agent Error Handling ===')

  const agent = new AgentHTTPClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // Request to non-existent resource
    const result = await agent.request('GET', '/posts/99999')

    console.log('Success:', result.success)
    console.log('Status:', result.statusCode)

    if (!result.success) {
      console.log('Error:', result.error)
      console.log('Suggestion:', result.suggestion)
    }
  } finally {
    await agent.close()
  }
}

// =============================================================================
// Example 8: Agent CRUD Operations
// =============================================================================

export async function example8_agentCrud() {
  console.log('\n=== Example 8: Agent CRUD Operations ===')

  const agent = new AgentHTTPClient({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    // Create
    const createResult = await agent.post('/posts', {
      title: 'Agent Post',
      body: 'Created by agent',
      userId: 1
    })
    console.log('Create summary:', createResult.summary)

    // Read
    const readResult = await agent.get('/posts/1')
    console.log('Read summary:', readResult.summary)

    // Update
    const updateResult = await agent.put('/posts/1', {
      id: 1,
      title: 'Updated by Agent',
      body: 'Updated content',
      userId: 1
    })
    console.log('Update summary:', updateResult.summary)

    // Delete
    const deleteResult = await agent.delete('/posts/1')
    console.log('Delete summary:', deleteResult.summary)
  } finally {
    await agent.close()
  }
}

// =============================================================================
// Example 9: SDK Response Format
// =============================================================================

export async function example9_responseFormat() {
  console.log('\n=== Example 9: SDK Response Format ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com'
  })

  try {
    const result = await sdk.get('/posts/1')

    // Full response structure
    console.log('Response structure:')
    console.log('  success:', typeof result.success, '=', result.success)
    console.log('  statusCode:', typeof result.statusCode, '=', result.statusCode)
    console.log('  data:', typeof result.data, '= {...}')
    console.log('  error:', typeof result.error, '=', result.error)
    console.log('  headers:', typeof result.headers, '= {...}')
    console.log('  duration:', typeof result.duration, '=', result.duration)
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 10: SDK with Retry Logic
// =============================================================================

export async function example10_sdkRetry() {
  console.log('\n=== Example 10: SDK with Retry Logic ===')

  const sdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    retry: {
      maxRetries: 3,
      retryDelay: 500
    }
  })

  try {
    // This will use retry logic if needed
    const result = await sdk.get('/posts/1')

    console.log('Success:', result.success)
    console.log('Duration:', result.duration, 'ms')
  } finally {
    await sdk.close()
  }
}

// =============================================================================
// Example 11: Multiple SDK Instances
// =============================================================================

export async function example11_multipleInstances() {
  console.log('\n=== Example 11: Multiple SDK Instances ===')

  // Different services
  const postsSdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 10000
  })

  const usersSdk = createSDK({
    baseUrl: 'https://jsonplaceholder.typicode.com',
    timeout: 10000
  })

  try {
    // Parallel requests to different endpoints
    const [postsResult, usersResult] = await Promise.all([
      postsSdk.get('/posts?_limit=3'),
      usersSdk.get('/users?_limit=3')
    ])

    console.log('Posts success:', postsResult.success)
    console.log('Posts count:', postsResult.data?.length)

    console.log('Users success:', usersResult.success)
    console.log('Users count:', usersResult.data?.length)
  } finally {
    await Promise.all([
      postsSdk.close(),
      usersSdk.close()
    ])
  }
}

// =============================================================================
// Main Runner
// =============================================================================

async function main() {
  try {
    await example1_basicSdk()
    await example2_sdkWithAuth()
    await example3_sdkCrud()
    await example4_cliContext()
    await example5_cliProgress()
    await example6_agentClient()
    await example7_agentErrors()
    await example8_agentCrud()
    await example9_responseFormat()
    await example10_sdkRetry()
    await example11_multipleInstances()

    console.log('\n=== All SDK examples completed! ===')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
