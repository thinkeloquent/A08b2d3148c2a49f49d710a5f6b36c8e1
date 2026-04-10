/**
 * SDK interface for common-exceptions.
 *
 * Provides programmatic access for CLI tools, LLM agents, and developer tooling.
 *
 * @example
 * import { createException, formatForCli, toAgentContext } from '@internal/common-exceptions/sdk';
 *
 * const exc = createException('NOT_FOUND', 'User not found', { userId: '123' });
 * console.log(formatForCli(exc));
 * const context = toAgentContext(exc);
 */

export { createException, parseErrorResponse, isCommonException } from './factory.js';
export { formatForCli, FormatCliOptions, printError } from './cli.js';
export { toAgentContext, AgentErrorContext } from './agent.js';
