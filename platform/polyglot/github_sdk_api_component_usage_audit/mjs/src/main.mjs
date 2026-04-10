/**
 * Non-interactive entry point.
 *
 * Parses Commander arguments, validates, and runs the audit.
 */

import dotenv from "dotenv";
import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { ComponentUsageAudit } from "./services/ComponentUsageAudit.mjs";

dotenv.config();

export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const audit = new ComponentUsageAudit(validated);
  await audit.run();
}
