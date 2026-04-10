import path from "path";

/**
 * Dynamically import a user-provided handler module and validate its export.
 *
 * The handler must export a default async function with signature:
 *   (alert, location, context) => Promise<{ action: "fixed"|"skipped"|"error", message?: string }>
 *
 * @param {string} handlerPath - Path to handler .mjs file (relative or absolute).
 * @param {Function} log - Logger function.
 * @returns {Promise<Function>} The handler function.
 */
export async function loadHandler(handlerPath, log) {
  const resolved = path.resolve(handlerPath);
  log(`Loading handler from ${resolved}`);

  let mod;
  try {
    mod = await import(resolved);
  } catch (err) {
    throw new Error(`Failed to import handler at ${resolved}: ${err.message}`);
  }

  const fn = mod.default;

  if (typeof fn !== "function") {
    throw new Error(
      `Handler at ${resolved} must export a default function, got ${typeof fn}`
    );
  }

  log(`Handler loaded successfully`);
  return fn;
}
