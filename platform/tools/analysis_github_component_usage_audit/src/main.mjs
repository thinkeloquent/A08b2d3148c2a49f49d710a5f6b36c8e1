import { createProgram } from "./cli/program-args.mjs";
import { validateAndNormalize } from "./cli/defaults-and-validate.mjs";
import { ComponentUsageAudit } from "./services/component-usage-audit.mjs";

export async function main() {
  const program = createProgram();
  program.parse();
  const options = program.opts();

  const validated = validateAndNormalize(options);

  const audit = new ComponentUsageAudit(validated);
  await audit.run();
}
