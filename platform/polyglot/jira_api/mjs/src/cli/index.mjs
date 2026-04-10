#!/usr/bin/env node
/**
 * @module cli
 * @description Command-line interface for the Jira API client.
 */

import { Command } from 'commander';
import { getConfig, saveConfig } from '../config.mjs';
import { JiraFetchClient } from '../client/JiraFetchClient.mjs';
import { registerIssueCommands } from './commands/issue.mjs';
import { registerUserCommands } from './commands/user.mjs';
import { registerProjectCommands } from './commands/project.mjs';
import { startServer } from '../server/index.mjs';
import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

const program = new Command();
program
  .name('jira-api')
  .description('JIRA API Command Line Interface')
  .version('0.1.0');

function getClient() {
  const config = getConfig();
  if (!config) {
    console.error('Error: JIRA configuration not found.');
    console.error("Run 'jira-api configure' to set up your credentials.");
    process.exit(1);
  }
  return new JiraFetchClient({
    baseUrl: config.baseUrl,
    email: config.email,
    apiToken: config.apiToken,
  });
}

// Configure command
program
  .command('configure')
  .description('Configure JIRA API credentials')
  .action(async () => {
    const readline = await import('node:readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

    console.log('JIRA API Configuration');
    const baseUrl = await ask('JIRA base URL (e.g., https://company.atlassian.net): ');
    const email = await ask('Your email address: ');
    const apiToken = await ask('API token: ');
    rl.close();

    saveConfig({ baseUrl, email, apiToken });
    console.log('Configuration saved successfully!');
  });

// Server command
program
  .command('server')
  .description('Start the Fastify server')
  .option('--host <host>', 'Host to bind to', '0.0.0.0')
  .option('--port <port>', 'Port to bind to', '8000')
  .action(async (opts) => {
    process.env.SERVER_HOST = opts.host;
    process.env.SERVER_PORT = opts.port;
    await startServer();
  });

// Register subcommands
registerIssueCommands(program, getClient);
registerUserCommands(program, getClient);
registerProjectCommands(program, getClient);

program.parseAsync(process.argv).catch((err) => {
  log.error('CLI error', { message: err.message });
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
