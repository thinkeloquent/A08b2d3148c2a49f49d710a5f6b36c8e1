import dotenv from "dotenv";
import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { CodescanRemediationTracker } from "./services/codescan-remediation-tracker.mjs";

// Load environment variables
dotenv.config();


export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const tracker = new CodescanRemediationTracker(validated);
  await tracker.run();
}
