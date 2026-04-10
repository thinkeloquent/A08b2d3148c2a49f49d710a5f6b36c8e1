#!/usr/bin/env npx tsx
/**
 * AWS S3 Client - Basic Usage Examples (TypeScript)
 *
 * Demonstrates core SDK features including:
 * - SDK initialization and configuration
 * - Save/load operations
 * - TTL support
 * - Error handling
 * - Agent interface
 */

import {
  type SDKConfig,
  createSDK,
  createAgentInterface,
  generateKey,
  configFromEnv,
  TOOL_SCHEMA,
  createLogger,
} from "../src/index.js";

// Create logger for examples
const logger = createLogger("examples.basic_usage", import.meta.url);

// =============================================================================
// Example 1: SDK Initialization
// =============================================================================
async function example1_sdk_initialization(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 1: SDK Initialization");
  console.log("=".repeat(60));

  // Method 1: Explicit configuration
  const config: SDKConfig = {
    bucketName: "my-test-bucket",
    region: "us-east-1",
    keyPrefix: "examples:",
    ttl: 3600, // 1 hour default TTL
    debug: true,
  };
  console.log(`Config created: bucket=${config.bucketName}, region=${config.region}`);

  // Method 2: From environment variables (if set)
  // export AWS_S3_BUCKET="my-bucket"
  // export AWS_REGION="us-west-2"
  const envConfig = configFromEnv();
  if (envConfig.bucketName) {
    console.log(`Loaded from env: bucket=${envConfig.bucketName}`);
  } else {
    console.log("No env config found (AWS_S3_BUCKET not set)");
  }
}

// =============================================================================
// Example 2: Basic Save and Load
// =============================================================================
async function example2_save_and_load(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 2: Basic Save and Load");
  console.log("=".repeat(60));

  // This example shows the pattern - actual execution requires AWS
  const config: SDKConfig = {
    bucketName: process.env.AWS_S3_BUCKET ?? "test-bucket",
    region: process.env.AWS_REGION ?? "us-east-1",
    endpointUrl: process.env.AWS_ENDPOINT_URL, // For LocalStack
    debug: true,
  };

  console.log(`Using bucket: ${config.bucketName}`);

  // Skip actual API calls if not configured
  if (!process.env.AWS_S3_BUCKET) {
    console.log("Skipping actual API calls (AWS_S3_BUCKET not set)");
    console.log("Set environment variables to run with real AWS/LocalStack");
    return;
  }

  const sdk = createSDK(config);

  try {
    // Save data
    const userData = {
      user_id: 12345,
      name: "Alice",
      email: "alice@example.com",
      preferences: { theme: "dark", notifications: true },
    };

    console.log("Saving user data:", userData);
    const response = await sdk.save(userData);

    if (response.success) {
      console.log(`Saved with key: ${response.key}`);
      console.log(`Elapsed: ${response.elapsedMs.toFixed(1)}ms`);

      // Load data back
      const loadResponse = await sdk.load(response.key!);
      if (loadResponse.success) {
        console.log("Loaded data:", loadResponse.data);
      } else {
        console.log(`Load failed: ${loadResponse.error}`);
      }
    } else {
      console.log(`Save failed: ${response.error}`);
    }
  } finally {
    await sdk.close();
  }
}

// =============================================================================
// Example 3: Deterministic Keys
// =============================================================================
async function example3_deterministic_keys(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 3: Deterministic Keys");
  console.log("=".repeat(60));

  const data1 = { user_id: 123, action: "login" };
  const data2 = { user_id: 123, action: "login" };
  const data3 = { user_id: 456, action: "login" };

  const key1 = generateKey(data1);
  const key2 = generateKey(data2);
  const key3 = generateKey(data3);

  console.log(`Data 1 key: ${key1}`);
  console.log(`Data 2 key: ${key2}`);
  console.log(`Data 3 key: ${key3}`);
  console.log(`key1 === key2: ${key1 === key2}`); // true
  console.log(`key1 === key3: ${key1 === key3}`); // false

  // Key order independence
  const dataA = { b: 2, a: 1 };
  const dataB = { a: 1, b: 2 };
  console.log(`Order independent: ${generateKey(dataA) === generateKey(dataB)}`);
}

// =============================================================================
// Example 4: TTL and Expiration
// =============================================================================
async function example4_ttl_expiration(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 4: TTL and Expiration");
  console.log("=".repeat(60));

  const config: SDKConfig = {
    bucketName: process.env.AWS_S3_BUCKET ?? "test-bucket",
    region: process.env.AWS_REGION ?? "us-east-1",
    endpointUrl: process.env.AWS_ENDPOINT_URL,
    ttl: 60, // Default 60 second TTL
    debug: true,
  };

  console.log(`Default TTL: ${config.ttl} seconds`);

  // Skip actual API calls if not configured
  if (!process.env.AWS_S3_BUCKET) {
    console.log("Skipping actual API calls (AWS_S3_BUCKET not set)");
    return;
  }

  const sdk = createSDK(config);

  try {
    // Save with default TTL
    const response1 = await sdk.save({ session: "abc123" });
    console.log(`Saved with default TTL (60s): ${response1.key}`);

    // Save with custom TTL
    const response2 = await sdk.save({ session: "xyz789" }, { ttl: 300 }); // 5 minutes
    console.log(`Saved with custom TTL (300s): ${response2.key}`);

    // Save without TTL (never expires)
    const configNoTtl: SDKConfig = {
      bucketName: config.bucketName,
      region: config.region,
      endpointUrl: config.endpointUrl,
    };
    const sdkNoTtl = createSDK(configNoTtl);
    const response3 = await sdkNoTtl.save({ permanent: true });
    console.log(`Saved without TTL: ${response3.key}`);
    await sdkNoTtl.close();
  } finally {
    await sdk.close();
  }
}

// =============================================================================
// Example 5: Agent Interface
// =============================================================================
async function example5_agent_interface(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 5: Agent Interface");
  console.log("=".repeat(60));

  const config: SDKConfig = {
    bucketName: process.env.AWS_S3_BUCKET ?? "test-bucket",
    region: process.env.AWS_REGION ?? "us-east-1",
    endpointUrl: process.env.AWS_ENDPOINT_URL,
    debug: true,
  };

  // Skip actual API calls if not configured
  if (!process.env.AWS_S3_BUCKET) {
    console.log("Skipping actual API calls (AWS_S3_BUCKET not set)");

    // Show the tool schema instead
    console.log("\nAgent Tool Schema:");
    console.log(JSON.stringify(TOOL_SCHEMA, null, 2));
    return;
  }

  const agent = createAgentInterface(config);

  try {
    // Store data
    const result = await agent.store({ user: "alice", score: 100 });
    console.log(`Store: ${result.message}`);

    if (result.success) {
      // Retrieve data
      const retrieve = await agent.retrieve(result.key!);
      console.log(`Retrieve: ${retrieve.message}`);
      console.log(`Data:`, retrieve.data);

      // Check existence
      const check = await agent.check(result.key!);
      console.log(`Check: ${check.message}`);

      // List all keys
      const listResult = await agent.listAll();
      console.log(`List: ${listResult.message}`);

      // Remove data
      const remove = await agent.remove(result.key!);
      console.log(`Remove: ${remove.message}`);
    }
  } finally {
    await agent.close();
  }
}

// =============================================================================
// Example 6: Error Handling
// =============================================================================
async function example6_error_handling(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("Example 6: Error Handling");
  console.log("=".repeat(60));

  // Example 1: Config validation error
  try {
    const _badSdk = createSDK({ bucketName: "", region: "us-east-1" }); // Empty bucket name
    console.log("Bad config created (shouldn't reach here)");
  } catch (error) {
    console.log(`Config error (expected): ${error}`);
  }

  // Example 2: Auth error handling
  console.log("\nAuth errors return error in response envelope:");

  const config: SDKConfig = {
    bucketName: "nonexistent-bucket-12345",
    region: "us-east-1",
    debug: true,
  };

  // Skip if no AWS credentials
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.log("Skipping auth test (no AWS credentials)");
    return;
  }

  const sdk = createSDK(config);

  try {
    const response = await sdk.save({ test: "data" });

    if (!response.success) {
      console.log(`Operation failed: ${response.error}`);
      // Errors are captured, not thrown
    } else {
      console.log(`Saved: ${response.key}`);
    }
  } finally {
    await sdk.close();
  }
}

// =============================================================================
// Main Runner
// =============================================================================
async function main(): Promise<void> {
  console.log("AWS S3 Client - TypeScript Basic Usage Examples");
  console.log("=".repeat(60));

  await example1_sdk_initialization();
  await example2_save_and_load();
  await example3_deterministic_keys();
  await example4_ttl_expiration();
  await example5_agent_interface();
  await example6_error_handling();

  console.log("\n" + "=".repeat(60));
  console.log("All examples completed!");
  console.log("=".repeat(60));
}

main().catch(console.error);
