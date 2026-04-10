import fs from "fs/promises";

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}
