#!/usr/bin/env node

/**
 * @module cli
 * @description Command-line interface for Confluence Data Center REST API operations.
 *
 * Provides quick access to Confluence content, spaces, search, and server
 * information from the terminal.
 *
 * Usage:
 *   confluence-api health
 *   confluence-api get-content 12345 --expand body.storage
 *   confluence-api search 'type = "page" AND space = "DEV"' --limit 10
 *   confluence-api get-spaces --limit 50
 *   confluence-api server-info
 */

import { Command } from 'commander';
import { ConfluenceFetchClient } from './client/ConfluenceFetchClient.mjs';
import { loadConfigFromEnv } from './config.mjs';

const program = new Command();

program
  .name('confluence-api')
  .description('Confluence Data Center REST API CLI')
  .version('1.0.0');

/**
 * Create a ConfluenceFetchClient from environment variables.
 * @returns {ConfluenceFetchClient}
 */
function createClient() {
  const config = loadConfigFromEnv();
  if (!config.baseUrl || !config.username || !config.apiToken) {
    console.error('Error: Confluence configuration not found.');
    console.error('Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN environment variables.');
    process.exit(1);
  }
  return new ConfluenceFetchClient({
    baseUrl: config.baseUrl,
    username: config.username,
    apiToken: config.apiToken,
  });
}

program
  .command('health')
  .description('Check connectivity to the Confluence server')
  .action(async () => {
    try {
      const client = createClient();
      const info = await client.get('/rest/api/server-information');
      console.log('Connected to Confluence');
      console.log(`  Base URL: ${info.baseUrl ?? 'N/A'}`);
      console.log(`  Version:  ${info.version ?? 'N/A'}`);
      console.log(`  Title:    ${info.title ?? 'N/A'}`);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('get-content')
  .description('Retrieve a piece of content by ID')
  .argument('<contentId>', 'Content ID to retrieve')
  .option('-e, --expand <expand>', 'Comma-separated fields to expand')
  .option('--json', 'Output raw JSON', false)
  .action(async (contentId, opts) => {
    try {
      const client = createClient();
      const params = {};
      if (opts.expand) params.expand = opts.expand;
      const result = await client.get(`/rest/api/content/${contentId}`, {
        queryParams: Object.keys(params).length > 0 ? params : undefined,
      });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Content: ${contentId}`);
        console.log(`  ID:      ${result.id ?? 'N/A'}`);
        console.log(`  Title:   ${result.title ?? 'N/A'}`);
        console.log(`  Type:    ${result.type ?? 'N/A'}`);
        console.log(`  Status:  ${result.status ?? 'N/A'}`);
        console.log(`  Space:   ${result.space?.name ?? 'N/A'} (${result.space?.key ?? 'N/A'})`);
        console.log(`  Version: ${result.version?.number ?? 'N/A'}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('search')
  .description('Search Confluence content using CQL')
  .argument('<cql>', 'CQL query string')
  .option('-l, --limit <limit>', 'Maximum results', '25')
  .option('-s, --start <start>', 'Start index', '0')
  .option('-e, --expand <expand>', 'Fields to expand')
  .option('--json', 'Output raw JSON', false)
  .action(async (cql, opts) => {
    try {
      const client = createClient();
      const params = {
        cql,
        start: opts.start,
        limit: opts.limit,
      };
      if (opts.expand) params.expand = opts.expand;
      const result = await client.get('/rest/api/search', { queryParams: params });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const results = result.results ?? [];
        if (results.length === 0) {
          console.log(`No results found for: ${cql}`);
          return;
        }

        console.log(`Search results for: ${cql}`);
        console.log('---');
        for (const item of results) {
          const content = item.content ?? item;
          const spaceKey = content.space?.key ?? 'N/A';
          console.log(`  [${content.type ?? '?'}] ${content.title ?? 'N/A'} (space: ${spaceKey})`);
        }

        const total = result.totalSize ?? result.size ?? results.length;
        console.log(`\nShowing ${results.length} of ${total} results`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('get-spaces')
  .description('List Confluence spaces')
  .option('-l, --limit <limit>', 'Maximum results', '25')
  .option('-s, --start <start>', 'Start index', '0')
  .option('-t, --type <type>', 'Space type filter (global, personal)')
  .option('--json', 'Output raw JSON', false)
  .action(async (opts) => {
    try {
      const client = createClient();
      const params = { start: opts.start, limit: opts.limit };
      if (opts.type) params.type = opts.type;
      const result = await client.get('/rest/api/space', { queryParams: params });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        const spaces = result.results ?? [];
        if (spaces.length === 0) {
          console.log('No spaces found');
          return;
        }

        console.log('Confluence Spaces');
        console.log('---');
        for (const space of spaces) {
          console.log(`  [${space.key ?? '?'}] ${space.name ?? 'N/A'} (type: ${space.type ?? 'N/A'}, status: ${space.status ?? 'N/A'})`);
        }

        const total = result.totalSize ?? result.size ?? spaces.length;
        console.log(`\nShowing ${spaces.length} of ${total} spaces`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('server-info')
  .description('Display Confluence server information')
  .option('--json', 'Output raw JSON', false)
  .action(async (opts) => {
    try {
      const client = createClient();
      const info = await client.get('/rest/api/server-information');

      if (opts.json) {
        console.log(JSON.stringify(info, null, 2));
      } else {
        console.log('Confluence Server Information');
        console.log(`  Base URL:     ${info.baseUrl ?? 'N/A'}`);
        console.log(`  Title:        ${info.title ?? 'N/A'}`);
        console.log(`  Version:      ${info.version ?? 'N/A'}`);
        console.log(`  Build Number: ${info.buildNumber ?? 'N/A'}`);
        console.log(`  Build Date:   ${info.buildDate ?? 'N/A'}`);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
