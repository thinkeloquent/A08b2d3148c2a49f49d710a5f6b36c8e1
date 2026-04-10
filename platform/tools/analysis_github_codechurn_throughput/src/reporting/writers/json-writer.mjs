import fs from "fs/promises";

/**
 * Write a JSON report to disk.
 * @param {object} report
 * @param {string} filePath
 */
export async function writeJsonReport(report, filePath) {
  await fs.writeFile(filePath, JSON.stringify(report, null, 2));
}
