/**
 * Standalone Proxy Example — fetch-undici (Node.js)
 *
 * Demonstrates all proxy configuration patterns available in the platform.
 *
 * Run: node 9.standalone-example-node.mjs
 */
import { AsyncClient, getEnvProxy } from "fetch-undici";
import { buildProxyUrl } from "proxy_url_builder";

// ============================================================
// Example 1: Explicit Proxy URL
// ============================================================
async function explicitProxy() {
  console.log("--- Example 1: Explicit Proxy URL ---");

  const client = new AsyncClient({
    baseUrl: "https://api.figma.com/v1",
    headers: { "X-Figma-Token": process.env.FIGMA_TOKEN || "test" },
    timeout: 30000,
    proxy: "http://proxy.example.com:8080",
  });

  try {
    const response = await client.get("/me");
    console.log("Status:", response.statusCode);
    console.log("OK:", response.ok);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
  console.log();
}

// ============================================================
// Example 2: Authenticated Proxy (credentials in URL)
// ============================================================
async function authenticatedProxy() {
  console.log("--- Example 2: Authenticated Proxy ---");

  // Build proxy URL from separate credentials (safe encoding)
  const proxyUrl = buildProxyUrl(
    process.env.PROXY_USER || "user",
    process.env.PROXY_PASS || "p@ss",
    process.env.PROXY_HOST || "proxy.example.com:8080",
  );
  console.log("Proxy URL (sanitized):", proxyUrl.replace(/\/\/.*@/, "//***:***@"));

  const client = new AsyncClient({
    baseUrl: "https://api.example.com",
    proxy: proxyUrl,
  });

  try {
    const response = await client.get("/health");
    console.log("Status:", response.statusCode);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
  console.log();
}

// ============================================================
// Example 3: Proxy with Options Object
// ============================================================
async function proxyWithOptions() {
  console.log("--- Example 3: Proxy with Options ---");

  const client = new AsyncClient({
    baseUrl: "https://api.example.com",
    proxy: {
      url: "http://proxy.example.com:8080",
      auth: { username: "user", password: "pass" },
      headers: { "X-Proxy-Client": "mta-v800" },
      noProxy: ["*.internal.com", "localhost", "127.0.0.1"],
    },
  });

  try {
    // This goes through proxy
    const ext = await client.get("/external-api");
    console.log("External:", ext.statusCode);

    // This would bypass proxy (if *.internal.com matched)
    // const int = await client.get("https://app.internal.com/api");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
  console.log();
}

// ============================================================
// Example 4: Environment-Based Proxy (trust_env)
// ============================================================
async function envProxy() {
  console.log("--- Example 4: Environment-Based Proxy ---");
  console.log("HTTPS_PROXY:", process.env.HTTPS_PROXY || "(not set)");
  console.log("HTTP_PROXY:", process.env.HTTP_PROXY || "(not set)");

  const client = new AsyncClient({
    baseUrl: "https://api.example.com",
    trustEnv: true, // reads HTTPS_PROXY / HTTP_PROXY
  });

  try {
    const response = await client.get("/health");
    console.log("Status:", response.statusCode);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
  console.log();
}

// ============================================================
// Example 5: AppYamlConfig Pattern (health check style)
// ============================================================
async function appYamlConfigPattern() {
  console.log("--- Example 5: AppYamlConfig Resolution Pattern ---");

  // Simulating provider config from AppYamlConfig
  const providerConfig = {
    base_url: "https://api.figma.com/v1",
    proxy_url: "http://proxy.corp.local:8080", // Could be false, null, or string
    verify_ssl: true,
  };

  // Resolution logic (same as healthz_integration.route.mjs)
  const proxyUrlConfig = providerConfig.proxy_url;
  const envProxyConfig = getEnvProxy();

  const resolvedProxy =
    proxyUrlConfig === false
      ? null
      : typeof proxyUrlConfig === "string" && proxyUrlConfig
        ? proxyUrlConfig
        : envProxyConfig.https || envProxyConfig.http || null;

  console.log("Resolved proxy:", resolvedProxy || "(none)");

  const client = new AsyncClient({
    baseUrl: providerConfig.base_url,
    proxy: resolvedProxy,
    trust_env: proxyUrlConfig == null,
    verify: providerConfig.verify_ssl !== false,
  });

  try {
    const response = await client.get("/me");
    console.log("Status:", response.statusCode);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
  }
  console.log();
}

// ============================================================

async function main() {
  console.log("=".repeat(60));
  console.log("fetch-undici Proxy Examples");
  console.log("=".repeat(60));
  console.log();

  await explicitProxy();
  await authenticatedProxy();
  await proxyWithOptions();
  await envProxy();
  await appYamlConfigPattern();
}

main().catch(console.error);
