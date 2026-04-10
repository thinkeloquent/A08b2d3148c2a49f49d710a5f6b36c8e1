```yaml
audit_events:
  - category: "Intent & Reasoning Audit"
    description: "Tracks the delta between what the user asked and what the Role/Goal interpreted."
    fields:
      - "role_assigned": "Which Role was active (e.g., The Polyglot Architect)?"
      - "goal_priority": "Which Goal was prioritized (e.g., The Parity Matcher)?"
      - "reasoning_trace": "The 'Chain of Thought' or internal monologue before the CRUD action."
      - "prompt_version": "ID of the instruction set used."

  - category: "UX Interaction Audit"
    description: "Captures how the AI output manifested in the UI and how the user responded."
    fields:
      - "component_id": "The React component affected by the AI change."
      - "pixel_delta": "For 'Pixel-Perfect' roles, the visual variance before/after."
      - "user_sentiment_signal": "Explicit (thumbs up/down) or implicit (edit-distance of user correction)."
      - "latency_ux": "Time from user 'Intent' to UI 'Render'."

  - category: "CRUD & Permission Audit"
    description: "The 'Blast Radius' log. Essential for Security & Privacy Gatekeepers."
    fields:
      - "action_type": "[CREATE, READ, UPDATE, DELETE]"
      - "permission_context": "Which permission tier was active (e.g., Sandboxed vs. Production-Safe)?"
      - "pii_scan_status": "Pass/Fail status of the redaction layer before the write."
      - "human_in_the_loop_id": "ID of the human who approved the write (if gated)."
      - "resource_path": "The file path or API endpoint targeted."

  - category: "Financial & Token Audit"
    description: "Tracks the cost efficiency of the Provider."
    fields:
      - "provider_id": "The model used (e.g., gemini-2.0-flash)."
      - "token_usage": "Input vs. Output token count."
      - "estimated_cost_usd": "Calculated cost of the specific interaction."
      - "cache_hit": "Boolean indicating if a prompt/context cache was used."

  - category: "Quality & Parity Audit"
    description: "The verification log for migrations and code generation."
    fields:
      - "test_pass_rate": "Result of the coverage-driven tests generated."
      - "lint_errors_count": "Number of static analysis violations in the AI output."
      - "parity_score": "Percentage of functional logic matched (for migration roles)."
```
