import dotenv from "dotenv";
import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { FileTouchFrequency } from "./services/file-touch-frequency.mjs";

// Load environment variables
dotenv.config();


export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const analyzer = new FileTouchFrequency(validated);
  await analyzer.run();
}
