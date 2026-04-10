Providers

The underlying model and infrastructure vendors that power the agent, plus any external services it relies on.
Examples: OpenAI / Anthropic / Google / open-source local model; embedding provider; vector DB; hosted tool gateways; observability/logging stack.
Key idea: providers determine capabilities, latency, cost, data handling, and deployment constraints.

```yaml
providers:
  - name: "OpenAI(gpt-4)"
    description: "The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities."
    values:
      model: gpt-4
  - name: "anthropic(claude-3-sonnet)"
    description: "The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities."
    values:
      model: claude-3-sonnet
  - name: "gemini_openai(gemini-2.0-flash)"
    description: "The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities."
    values:
      model: gemini-2.0-flash
```
