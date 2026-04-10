/**
 * JSON Report Writer
 *
 * Writes the audit report as a formatted JSON file.
 */

import fs from "fs/promises";

/**
 * Write a report object to a JSON file.
 *
 * @param {object} report - The report object to serialize.
 * @param {string} outputPath - Absolute file path for the output.
 */
export async function writeJsonReport(report, outputPath) {
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");
}
