#!/usr/bin/env node
/**
 * Gemini OpenAI SDK CLI Entry Point
 *
 * Binary executable for the gemini-openai-sdk package.
 *
 * Usage:
 *   gemini-openai <command> [options] [prompt]
 *
 * Commands:
 *   chat        Send a chat message
 *   stream      Stream a response
 *   structure   Get structured JSON
 *   tool-call   Function calling
 *   json        JSON mode
 *   health      Health check
 *   config      Show configuration
 *   validate    Validate environment
 *
 * Run with --help for full usage information.
 */

import { run } from '../cli.mjs';

// Run CLI with command line arguments
run(process.argv.slice(2));
