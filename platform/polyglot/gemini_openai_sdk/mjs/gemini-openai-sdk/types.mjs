/**
 * Types Module - Response Types and Factories
 *
 * Defines response structures for the SDK.
 * All field names use snake_case for API consistency.
 */

/**
 * Create usage stats object
 * @param {object} data - Raw usage data
 * @returns {object} Normalized usage stats
 */
export function createUsageStats(data = {}) {
  return {
    prompt_tokens: data.prompt_tokens || 0,
    completion_tokens: data.completion_tokens || 0,
    total_tokens: data.total_tokens || 0,
  };
}

/**
 * Create chat message object
 * @param {string} role - Message role
 * @param {string} content - Message content
 * @param {object} [options] - Additional options
 * @returns {object} Chat message
 */
export function createChatMessage(role, content, options = {}) {
  const message = { role, content };
  if (options.name) message.name = options.name;
  if (options.tool_call_id) message.tool_call_id = options.tool_call_id;
  return message;
}

/**
 * Create tool call object
 * @param {string} id - Tool call ID
 * @param {string} functionName - Function name
 * @param {object} args - Function arguments
 * @returns {object} Tool call
 */
export function createToolCall(id, functionName, args) {
  return {
    id,
    function: functionName,
    arguments: args,
  };
}

/**
 * Create tool result object
 * @param {string} toolCallId - Tool call ID
 * @param {string} functionName - Function name
 * @param {object} args - Arguments used
 * @param {object} result - Execution result
 * @returns {object} Tool result
 */
export function createToolResult(toolCallId, functionName, args, result) {
  return {
    id: toolCallId,
    function: functionName,
    arguments: args,
    result,
  };
}

/**
 * Create stream chunk object
 * @param {object} data - Chunk data
 * @returns {object} Stream chunk
 */
export function createStreamChunk(data = {}) {
  const chunk = {};
  if (data.content !== undefined) chunk.content = data.content;
  if (data.role !== undefined) chunk.role = data.role;
  if (data.finish_reason !== undefined) chunk.finish_reason = data.finish_reason;
  if (data.id !== undefined) chunk.id = data.id;
  if (data.model !== undefined) chunk.model = data.model;
  return chunk;
}

/**
 * Create standardized chat response
 * @param {object} options - Response options
 * @returns {object} Chat response
 */
export function createChatResponse(options = {}) {
  const response = {
    success: options.success ?? true,
  };

  // Core fields
  if (options.content !== undefined) response.content = options.content;
  if (options.model !== undefined) response.model = options.model;
  if (options.finish_reason !== undefined) response.finish_reason = options.finish_reason;
  if (options.usage !== undefined) response.usage = options.usage;
  if (options.error !== undefined) response.error = options.error;

  // Extended fields
  if (options.parsed !== undefined) response.parsed = options.parsed;
  if (options.schema !== undefined) response.schema = options.schema;
  if (options.validation !== undefined) response.validation = options.validation;
  if (options.tool_calls !== undefined) response.tool_calls = options.tool_calls;
  if (options.chunk_count !== undefined) response.chunk_count = options.chunk_count;
  if (options.chunks !== undefined) response.chunks = options.chunks;
  if (options.accumulated !== undefined) response.accumulated = options.accumulated;
  if (options.format_info !== undefined) response.format_info = options.format_info;
  if (options.assistant_message !== undefined) response.assistant_message = options.assistant_message;
  if (options.execution_time_ms !== undefined) response.execution_time_ms = options.execution_time_ms;

  return response;
}

/**
 * Create error response
 * @param {string} error - Error message
 * @param {number} [executionTimeMs] - Execution time
 * @returns {object} Error response
 */
export function createErrorResponse(error, executionTimeMs = null) {
  const response = {
    success: false,
    error,
  };
  if (executionTimeMs !== null) {
    response.execution_time_ms = executionTimeMs;
  }
  return response;
}

/**
 * Create response from API response
 * @param {object} apiResponse - Raw API response
 * @param {number} [executionTimeMs] - Execution time
 * @returns {object} Normalized response
 */
export function createResponseFromApi(apiResponse, executionTimeMs = null) {
  try {
    const choice = apiResponse.choices?.[0] || {};
    const message = choice.message || {};
    const usageData = apiResponse.usage || {};

    return createChatResponse({
      success: true,
      content: message.content,
      model: apiResponse.model,
      finish_reason: choice.finish_reason,
      usage: createUsageStats(usageData),
      execution_time_ms: executionTimeMs,
    });
  } catch (err) {
    return createErrorResponse(err.message, executionTimeMs);
  }
}

export default {
  createUsageStats,
  createChatMessage,
  createToolCall,
  createToolResult,
  createStreamChunk,
  createChatResponse,
  createErrorResponse,
  createResponseFromApi,
};
