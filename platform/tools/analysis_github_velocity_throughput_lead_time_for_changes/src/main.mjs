import dotenv from "dotenv";
import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { LeadTimeForChanges } from "./services/lead-time-for-changes.mjs";

// Load environment variables
dotenv.config();


export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const analyzer = new LeadTimeForChanges(validated);
  await analyzer.run();
}
