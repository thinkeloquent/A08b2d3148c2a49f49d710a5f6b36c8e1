import { EnvStore } from "@internal/vault-file";

console.log('[env:env_store] Initializing EnvStore...');
const envFile = process.env.VAULT_SECRET_FILE;
console.log(`[env:env_store] VAULT_SECRET_FILE=${envFile || '(not set)'}`);

try {
  if (!envFile) {
    console.log("[env:env_store] VAULT_SECRET_FILE not set — initializing EnvStore in env-only mode (cloud/container mode)");
    // Initialize EnvStore without a file so .get() / .getOrThrow() still work
    // against process.env.  Pass /dev/null: it exists, parses 0 vars, no warning.
    await EnvStore.onStartup("/dev/null");
    console.log("[env:env_store] EnvStore initialized in env-only mode");
  } else {
    console.log(`[env:env_store] Loading EnvStore from vault file: ${envFile}`);
    await EnvStore.onStartup(envFile);
    console.log(`[env:env_store] EnvStore loaded from vault file: ${envFile}`);
  }
} catch (err) {
  console.error(`[env:env_store] EnvStore initialization failed: ${err.message}`);
  console.error(err.stack);
  throw err;
}
