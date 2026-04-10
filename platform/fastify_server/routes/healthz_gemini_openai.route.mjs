/**
 * Gemini OpenAI Integration Routes
 *
 * Exposes all Gemini OpenAI-compatible functionality as API endpoints.
 * Based on integration examples from how-to-get-started/2.fetch/
 *
 * Endpoints:
 * - /healthz/gemini-openai/chat - Basic chat completion
 * - /healthz/gemini-openai/structure - Structured output with JSON schema
 * - /healthz/gemini-openai/streaming - Streaming chat completion
 * - /healthz/gemini-openai/sse - Server-Sent Events streaming
 * - /healthz/gemini-openai/tool-calls - Function calling (tool calls)
 * - /healthz/gemini-openai/schema-mapping - JSON schema validation
 * - /healthz/gemini-openai/pool - Connection pool demonstration
 * - /healthz/gemini-openai/proxy-pool - Proxy pool demonstration
 * - /healthz/gemini-openai/stream-format - Stream format demonstration
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { resolveGeminiEnv } from "@internal/env-resolver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "../..");

const _geminiEnv = resolveGeminiEnv();

// =============================================================================
// CONSTANTS
// =============================================================================

// Model configurations
const MODELS = {
  flash: "gemini-2.0-flash",
  pro: "gemini-2.0-pro-exp-02-05",
};
const DEFAULT_MODEL = "flash";

// Common system prompt used across all endpoints
const SYSTEM_PROMPT =
  "You are a helpful AI assistant powered by Gemini. Be concise, accurate, and helpful.";

// Gemini OpenAI-compatible endpoints
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const CHAT_ENDPOINT = `${BASE_URL}/chat/completions`;
const MODELS_ENDPOINT = `${BASE_URL}/models`;

// Default settings
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TIMEOUT = 60000;

// =============================================================================
// HELPERS
// =============================================================================

function getApiKey() {
  return _geminiEnv.apiKey;
}

function getModel(modelType) {
  return MODELS[modelType] || MODELS[DEFAULT_MODEL];
}

function getHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function extractJSON(content) {
  if (!content) return null;

  // Try direct parse
  try {
    return JSON.parse(content);
  } catch (e) {
    // Continue
  }

  // Try markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // Try finding JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue
    }
  }

  return null;
}

function validateSchema(data, schema) {
  const errors = [];

  if (schema.type === "object" && typeof data !== "object") {
    return { valid: false, errors: ["Expected object"] };
  }

  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        if (propSchema.type === "string" && typeof value !== "string") {
          errors.push(`${key} should be string`);
        }
        if (propSchema.type === "number" && typeof value !== "number") {
          errors.push(`${key} should be number`);
        }
        if (propSchema.type === "boolean" && typeof value !== "boolean") {
          errors.push(`${key} should be boolean`);
        }
        if (propSchema.type === "array" && !Array.isArray(value)) {
          errors.push(`${key} should be array`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// HTTP CLIENT
// =============================================================================

let requestModule = null;

async function getRequest() {
  if (!requestModule) {
    const mod = await import(
      join(ROOT_DIR, "packages_mjs/fetch_undici/dist/index.js")
    );
    requestModule = mod.request;
  }
  return requestModule;
}

async function chatCompletion(messages, options = {}) {
  const request = await getRequest();
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const payload = {
    model: options.model || MODELS[DEFAULT_MODEL],
    messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
    stream: options.stream || false,
    ...options,
  };

  const { statusCode, body } = await request(CHAT_ENDPOINT, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
  });

  const text = await body.text();

  if (statusCode >= 400) {
    throw new Error(`${statusCode}: ${text}`);
  }

  return JSON.parse(text);
}

async function* streamChatCompletion(messages, options = {}) {
  const request = await getRequest();
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const payload = {
    model: options.model || MODELS[DEFAULT_MODEL],
    messages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.max_tokens ?? DEFAULT_MAX_TOKENS,
    stream: true,
    ...options,
  };

  const { statusCode, body } = await request(CHAT_ENDPOINT, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
  });

  if (statusCode >= 400) {
    const text = await body.text();
    throw new Error(`${statusCode}: ${text}`);
  }

  let buffer = "";
  for await (const chunk of body) {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          return;
        }
        if (data) {
          yield data;
        }
      }
    }
  }
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const weatherTool = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state, e.g., San Francisco, CA",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit",
        },
      },
      required: ["location"],
    },
  },
};

const calculatorTool = {
  type: "function",
  function: {
    name: "calculate",
    description: "Perform a mathematical calculation",
    parameters: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The mathematical expression to evaluate",
        },
      },
      required: ["expression"],
    },
  },
};

function executeWeather(args) {
  const { location, unit = "celsius" } = args;
  return {
    location,
    temperature: unit === "celsius" ? 22 : 72,
    unit,
    conditions: "sunny",
    humidity: 45,
  };
}

function tokenizeMath(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (expr[i] === " ") { i++; continue; }
    if ("+-*/()".includes(expr[i])) {
      tokens.push(expr[i++]);
    } else if (/[0-9.]/.test(expr[i])) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      tokens.push(num);
    } else {
      throw new Error(`Unexpected character: ${expr[i]}`);
    }
  }
  return tokens;
}

function safeEvalMath(expression) {
  const tokens = tokenizeMath(expression);
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr() {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = consume();
      const right = parseFactor();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseFactor() {
    if (peek() === "(") {
      consume();
      const val = parseExpr();
      if (peek() !== ")") throw new Error("Missing closing parenthesis");
      consume();
      return val;
    }
    if (peek() === "-") { consume(); return -parseFactor(); }
    if (peek() === "+") { consume(); return parseFactor(); }
    const token = consume();
    if (token === undefined) throw new Error("Unexpected end of expression");
    const num = parseFloat(token);
    if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
    return num;
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error("Unexpected token after expression");
  return result;
}

function executeCalculate(args) {
  const { expression } = args;
  try {
    const result = safeEvalMath(expression);
    return { expression, result };
  } catch (e) {
    return { expression, error: "Invalid expression" };
  }
}

// =============================================================================
// ROUTE MOUNTING
// =============================================================================

export async function mount(server) {
  // -------------------------------------------------------------------------
  // Health Check
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai", async (request, reply) => {
    const apiKey = getApiKey();
    return {
      status: apiKey ? "healthy" : "unhealthy",
      api_key_configured: Boolean(apiKey),
      models: MODELS,
      default_model: DEFAULT_MODEL,
      system_prompt: SYSTEM_PROMPT,
      endpoints: {
        chat: "/healthz/gemini-openai/chat",
        structure: "/healthz/gemini-openai/structure",
        streaming: "/healthz/gemini-openai/streaming",
        sse: "/healthz/gemini-openai/sse",
        tool_calls: "/healthz/gemini-openai/tool-calls",
        schema_mapping: "/healthz/gemini-openai/schema-mapping",
        pool: "/healthz/gemini-openai/pool",
        proxy_pool: "/healthz/gemini-openai/proxy-pool",
        stream_format: "/healthz/gemini-openai/stream-format",
      },
    };
  });

  // -------------------------------------------------------------------------
  // Basic Chat Completion
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/chat", async (request, reply) => {
    try {
      const {
        prompt = "What is the capital of France? Reply in one word.",
        model = DEFAULT_MODEL,
        temperature = DEFAULT_TEMPERATURE,
        max_tokens = DEFAULT_MAX_TOKENS,
        use_system_prompt = "true",
      } = request.query;

      const messages = [];
      if (use_system_prompt === "true") {
        messages.push({ role: "system", content: SYSTEM_PROMPT });
      }
      messages.push({ role: "user", content: prompt });

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: parseFloat(temperature),
        max_tokens: parseInt(max_tokens, 10),
      });

      return {
        success: true,
        model: response.model,
        content: response.choices[0].message.content,
        finish_reason: response.choices[0].finish_reason,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  server.post("/healthz/gemini-openai/chat", async (request, reply) => {
    try {
      const { model = DEFAULT_MODEL } = request.query;
      const { messages, temperature, max_tokens } = request.body || {};

      if (!messages || !Array.isArray(messages)) {
        return { success: false, error: "messages array is required" };
      }

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: max_tokens ?? DEFAULT_MAX_TOKENS,
      });

      return {
        success: true,
        model: response.model,
        content: response.choices[0].message.content,
        finish_reason: response.choices[0].finish_reason,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Structured Output
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/structure", async (request, reply) => {
    try {
      const {
        prompt = "Generate a sample weather report for Boston.",
        model = DEFAULT_MODEL,
      } = request.query;

      const schema = {
        type: "object",
        properties: {
          city: { type: "string" },
          tempF: { type: "number" },
          summary: { type: "string" },
        },
        required: ["city", "tempF", "summary"],
        additionalProperties: false,
      };

      const messages = [
        { role: "system", content: "Return ONLY valid JSON matching the schema." },
        { role: "user", content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "WeatherReport",
            schema,
            strict: true,
          },
        },
      });

      const content = response.choices[0].message.content;
      const parsed = extractJSON(content);

      return {
        success: true,
        model: response.model,
        raw_content: content,
        parsed,
        schema,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Streaming
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/streaming", async (request, reply) => {
    try {
      const {
        prompt = "Write a haiku about programming.",
        model = DEFAULT_MODEL,
        temperature = "0.8",
      } = request.query;

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];

      const chunks = [];
      let fullContent = "";
      let usage = null;

      for await (const data of streamChatCompletion(messages, {
        model: getModel(model),
        temperature: parseFloat(temperature),
      })) {
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
            chunks.push(content);
          }
          if (parsed.usage) {
            usage = parsed.usage;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }

      return {
        success: true,
        content: fullContent,
        chunk_count: chunks.length,
        usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Server-Sent Events
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/sse", async (request, reply) => {
    const {
      prompt = "Count from 1 to 5, one number per line.",
      model = DEFAULT_MODEL,
    } = request.query;

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];

      for await (const data of streamChatCompletion(messages, {
        model: getModel(model),
      })) {
        reply.raw.write(`data: ${data}\n\n`);
      }

      reply.raw.write("data: [DONE]\n\n");
    } catch (error) {
      reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }

    reply.raw.end();
  });

  // -------------------------------------------------------------------------
  // Tool Calls
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/tool-calls", async (request, reply) => {
    try {
      const {
        prompt = "What is the weather in Tokyo?",
        model = DEFAULT_MODEL,
      } = request.query;

      const messages = [
        {
          role: "system",
          content:
            "You are a helpful assistant. Use the provided tools when appropriate.",
        },
        { role: "user", content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: 0,
        tools: [weatherTool, calculatorTool],
        tool_choice: "auto",
      });

      const choice = response.choices[0];
      const toolCalls = choice.message.tool_calls;

      const result = {
        success: true,
        model: response.model,
        finish_reason: choice.finish_reason,
        tool_calls: [],
        content: choice.message.content,
      };

      if (toolCalls) {
        for (const toolCall of toolCalls) {
          const funcName = toolCall.function.name;
          const funcArgs = JSON.parse(toolCall.function.arguments);

          let toolResult;
          if (funcName === "get_weather") {
            toolResult = executeWeather(funcArgs);
          } else if (funcName === "calculate") {
            toolResult = executeCalculate(funcArgs);
          } else {
            toolResult = { error: `Unknown function: ${funcName}` };
          }

          result.tool_calls.push({
            id: toolCall.id,
            function: funcName,
            arguments: funcArgs,
            result: toolResult,
          });
        }
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Schema Mapping
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/schema-mapping", async (request, reply) => {
    try {
      const {
        prompt = "Generate a user profile with name, email, and age in JSON format.",
        model = DEFAULT_MODEL,
      } = request.query;

      const userSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "email", "age"],
      };

      const messages = [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown, no explanation.",
        },
        { role: "user", content: prompt },
      ];

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      const parsed = extractJSON(content);
      const validation = parsed
        ? validateSchema(parsed, userSchema)
        : { valid: false, errors: ["Failed to parse JSON"] };

      return {
        success: true,
        model: response.model,
        raw_content: content,
        parsed,
        schema: userSchema,
        validation,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Connection Pool
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/pool", async (request, reply) => {
    try {
      const {
        prompt = "What is 2+2?",
        model = DEFAULT_MODEL,
        parallel = "3",
      } = request.query;

      const parallelCount = Math.min(Math.max(parseInt(parallel, 10) || 3, 1), 5);

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];

      const tasks = Array(parallelCount)
        .fill(null)
        .map(() =>
          chatCompletion(messages, {
            model: getModel(model),
            max_tokens: 50,
          })
        );

      const results = await Promise.allSettled(tasks);

      const responses = results.map((r, i) => {
        if (r.status === "rejected") {
          return { index: i, error: r.reason?.message || String(r.reason) };
        }
        return {
          index: i,
          content: r.value.choices[0].message.content,
          model: r.value.model,
        };
      });

      return {
        success: true,
        parallel_requests: parallelCount,
        responses,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Proxy Pool
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/proxy-pool", async (request, reply) => {
    try {
      const { prompt = "Say hello!", model = DEFAULT_MODEL } = request.query;

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }

      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];

      // Use standard request (proxy handling would be done at dispatcher level)
      const response = await chatCompletion(messages, {
        model: getModel(model),
      });

      return {
        success: true,
        proxy_configured: Boolean(proxyUrl),
        proxy_url: proxyUrl ? proxyUrl.slice(0, 20) + "..." : null,
        model: response.model,
        content: response.choices[0].message.content,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Stream Format
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/stream-format", async (request, reply) => {
    try {
      const {
        prompt = "Say Hi in one word.",
        model = DEFAULT_MODEL,
      } = request.query;

      const messages = [{ role: "user", content: prompt }];

      const chunks = [];
      const accumulated = {
        id: null,
        model: null,
        role: null,
        content: "",
        finishReason: null,
        usage: null,
      };

      for await (const data of streamChatCompletion(messages, {
        model: getModel(model),
        max_tokens: 50,
      })) {
        try {
          const parsed = JSON.parse(data);
          const chunkInfo = { raw_length: data.length };

          if (parsed.id) {
            accumulated.id = parsed.id;
            chunkInfo.id = parsed.id;
          }
          if (parsed.model) {
            accumulated.model = parsed.model;
            chunkInfo.model = parsed.model;
          }

          const choice = parsed.choices?.[0] || {};
          const delta = choice.delta || {};

          if (delta.role) {
            accumulated.role = delta.role;
            chunkInfo.role = delta.role;
          }
          if (delta.content) {
            accumulated.content += delta.content;
            chunkInfo.content = delta.content;
          }
          if (choice.finish_reason) {
            accumulated.finishReason = choice.finish_reason;
            chunkInfo.finish_reason = choice.finish_reason;
          }
          if (parsed.usage) {
            accumulated.usage = parsed.usage;
            chunkInfo.usage = parsed.usage;
          }

          chunks.push(chunkInfo);
        } catch (e) {
          chunks.push({ error: "parse_error", raw: data.slice(0, 100) });
        }
      }

      return {
        success: true,
        chunk_count: chunks.length,
        chunks,
        accumulated,
        format_info: {
          content_type: "text/event-stream",
          chunk_format: 'data: {"choices":[{"delta":{"content":"..."}}]}',
          end_marker: "data: [DONE]",
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Multi-turn Conversation
  // -------------------------------------------------------------------------
  server.post("/healthz/gemini-openai/conversation", async (request, reply) => {
    try {
      const { model = DEFAULT_MODEL } = request.query;
      const { messages, temperature, max_tokens } = request.body || {};

      if (!messages || !Array.isArray(messages)) {
        return { success: false, error: "messages array is required" };
      }

      // Prepend system prompt if not present
      const allMessages =
        messages[0]?.role === "system"
          ? messages
          : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

      const response = await chatCompletion(allMessages, {
        model: getModel(model),
        temperature: temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: max_tokens ?? DEFAULT_MAX_TOKENS,
      });

      return {
        success: true,
        model: response.model,
        assistant_message: response.choices[0].message,
        finish_reason: response.choices[0].finish_reason,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // JSON Mode
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/json-mode", async (request, reply) => {
    try {
      const {
        prompt = "Return a JSON object with keys: name, age, city",
        model = DEFAULT_MODEL,
      } = request.query;

      const messages = [{ role: "user", content: prompt }];

      const response = await chatCompletion(messages, {
        model: getModel(model),
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      const parsed = extractJSON(content);

      return {
        success: true,
        model: response.model,
        raw_content: content,
        parsed,
        usage: response.usage,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // -------------------------------------------------------------------------
  // Models List
  // -------------------------------------------------------------------------
  server.get("/healthz/gemini-openai/models", async (request, reply) => {
    try {
      const requestFn = await getRequest();
      const apiKey = getApiKey();

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }

      const { statusCode, body } = await requestFn(MODELS_ENDPOINT, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      const text = await body.text();

      if (statusCode >= 400) {
        throw new Error(`${statusCode}: ${text}`);
      }

      const data = JSON.parse(text);

      return {
        success: true,
        available_models: MODELS,
        openai_compatible_models: data.data?.slice(0, 10) || [],
        total_count: data.data?.length || 0,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
