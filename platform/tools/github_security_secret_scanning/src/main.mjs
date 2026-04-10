import dotenv from "dotenv";
import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { SecretScanningService } from "./services/secret-scanning-service.mjs";

// Load environment variables
dotenv.config();

export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const service = new SecretScanningService(validated);
  await service.run();
}
