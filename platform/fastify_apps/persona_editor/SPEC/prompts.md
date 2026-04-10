Prompts

The instruction set and context packaging that shapes the agent’s reasoning and outputs.
Includes: system instructions, developer instructions, task prompts, few-shot examples, constraints, templates, retrieval snippets, and tool-use guidance.
Key idea: prompts are the agent’s operating procedure—how it’s told to behave and how tasks are framed.

```yaml
prompts:
  # --- Phase 1: Business Specification ---
  - name: "The Requirement Synthesizer"
    description: "Transforms fragmented business ideas into structured PRDs. Frames the task as 'What problem are we solving?' rather than 'What are we building?'"
    values:
      [
        "problem-first-framing",
        "stakeholder-alignment",
        "success-metric-definition",
        "scope-guardrailing",
      ]

  - name: "The Intent-to-Spec Translator"
    description: "Uses few-shot examples of high-quality technical specs to turn vague product goals into actionable engineering constraints."
    values:
      [
        "technical-specification",
        "constraint-mapping",
        "logic-flowcharting",
        "user-story-derivation",
      ]

  # --- Phase 2: Design & Product ---
  - name: "The Design-to-Logic Mapper"
    description: "A task prompt that forces the agent to 'see' auto-layout and tokens as code structures before any generation occurs."
    values:
      [
        "structure-extraction",
        "token-to-variable-mapping",
        "variant-enumeration",
        "visual-logic-parsing",
      ]

  - name: "The Product Edge-Case Generator"
    description: "Prompts the agent to brainstorm 'The Unhappy Path' (empty states, loading timeouts, 404s) based on the product description."
    values:
      [
        "failure-mode-analysis",
        "state-scaffolding",
        "edge-case-brainstorming",
        "ux-resilience",
      ]

  # --- Phase 3: Development ---
  - name: "The Polyglot Parity Instruction"
    description: "System instructions for maintaining functional identity between stacks. Forces the agent to cross-reference logic across provided code snippets."
    values:
      [
        "cross-stack-verification",
        "logic-porting",
        "syntax-agnostic-logic",
        "feature-parity",
      ]

  - name: "The Component Artisan Template"
    description: "A strict template for React/Node generation focusing on atomic design, prop-types/Zod, and modular reusability."
    values:
      [
        "modular-scaffolding",
        "type-strict-generation",
        "documentation-inclusion",
        "boilerplate-minimization",
      ]

  # --- Phase 4: Quality Assurance (QA) ---
  - name: "The Red-Team Adversary"
    description: "Instructions that cast the agent as an attacker. Focuses on secret leaks, Zod bypasses, and DDoS-prone logic in code reviews."
    values:
      [
        "vulnerability-hunting",
        "input-fuzzing",
        "security-audit",
        "logic-flaw-detection",
      ]

  - name: "The Coverage-Driven Tester"
    description: "A prompt context packaged with existing code to generate unit and E2E tests that specifically target branching logic and boundary conditions."
    values:
      [
        "test-case-generation",
        "coverage-optimization",
        "mocking-strategy",
        "assertion-rigor",
      ]

  # --- Phase 5: Deployment & Validation ---
  - name: "The CI/CD Gatekeeper Instruction"
    description: "A set of constraints for evaluating PRs against repo conventions, lint rules, and build-success criteria."
    values:
      [
        "static-check-enforcement",
        "deployment-readiness-audit",
        "changelog-synthesis",
        "convention-compliance",
      ]

  - name: "The Telemetry & Analytics Injector"
    description: "Guides the agent to insert non-breaking tracking hooks and observability logs into production code based on a provided event taxonomy."
    values:
      [
        "observability-patterning",
        "event-taxonomy-alignment",
        "logging-standardization",
        "data-layer-integration",
      ]

  # --- Phase 6: Post-Deployment Validation ---
  - name: "The Feedback-Loop Optimizer"
    description: "A prompt that takes real-world telemetry data/logs and suggests code iterations based on observed performance or conversion drops."
    values:
      [
        "telemetry-to-task-mapping",
        "iterative-optimization",
        "root-cause-prompting",
        "data-driven-refactoring",
      ]
```
