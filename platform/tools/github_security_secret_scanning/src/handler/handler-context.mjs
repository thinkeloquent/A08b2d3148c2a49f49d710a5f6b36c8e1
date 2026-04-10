import fs from "fs/promises";
import path from "path";

/**
 * Build the context object passed as the third argument to user handlers.
 *
 * @param {object} params
 * @param {string} params.repoRoot - Absolute path to the local repository root.
 * @param {Function} params.log - Logger function.
 * @returns {object} Handler context with repoRoot, log, readFile, writeFile.
 */
export function createHandlerContext({ repoRoot, log }) {
  return {
    repoRoot,
    log,

    /**
     * Read a file relative to the repo root.
     * @param {string} relPath - File path relative to repoRoot.
     * @returns {Promise<string>} File contents as UTF-8 string.
     */
    readFile(relPath) {
      return fs.readFile(path.join(repoRoot, relPath), "utf-8");
    },

    /**
     * Write a file relative to the repo root.
     * @param {string} relPath - File path relative to repoRoot.
     * @param {string} content - New file contents.
     * @returns {Promise<void>}
     */
    writeFile(relPath, content) {
      return fs.writeFile(path.join(repoRoot, relPath), content, "utf-8");
    },
  };
}
