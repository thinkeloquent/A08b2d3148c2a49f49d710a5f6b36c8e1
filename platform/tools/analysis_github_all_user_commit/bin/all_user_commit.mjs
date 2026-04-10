#!/usr/bin/env node

import chalk from "chalk";
import { main } from "../src/main.mjs";

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`Unexpected error: ${error.message}`));
    process.exit(1);
  });
}
