import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { sequelize, SCHEMA, Persona, LLMDefault, AuditLog } from './models/index.mjs';

/** Bulk-insert LLMDefault rows for a given category. */
async function createDefaults(category, items) {
  for (const item of items) {
    await LLMDefault.create({
      id: nanoid(12),
      category,
      name: item.name,
      description: item.description,
      value: item.value,
      context: item.context || null,
      is_default: item.is_default || false,
    });
  }
  console.log(`  - ${items.length} ${category} defaults created`);
  return items.length;
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // ---------------------------------------------------------------
    // Sample Personas
    // ---------------------------------------------------------------

    const persona1 = await Persona.create({
      id: `persona-${uuidv4()}`,
      name: 'Code Assistant',
      description: 'A helpful AI assistant specialized in software development tasks and debugging.',
      role: 'UI Engineer (Framework Specialist)',
      tone: 'The Peer Reviewer',
      version: '1.0.0',
      llm_provider: 'OpenAI(gpt-4)',
      llm_temperature: 0.7,
      llm_parameters: { max_tokens: 4096 },
      goals: ['The Minimal-Change Patch', 'The Dependency Minimalist', 'The User-Intent Guardian'],
      tools: ['code-gen', 'debugger', 'test-runner'],
      permitted_to: ['The Sandboxed Developer', 'The Restricted Repo Agent'],
      prompt_system_template: ['You are a helpful coding assistant.'],
      prompt_user_template: [],
      prompt_context_template: [],
      prompt_instruction: [],
      agent_delegate: [],
      agent_call: [],
      memory: { enabled: true, scope: 'session', storage_id: '' },
      context_files: [],
    });
    console.log(`Created persona: ${persona1.name}`);

    const persona2 = await Persona.create({
      id: `persona-${uuidv4()}`,
      name: 'System Architect',
      description: 'An expert system architect focused on designing scalable and maintainable software architectures.',
      role: 'The Polyglot Architect',
      tone: 'The E2E Architect',
      version: '1.0.0',
      llm_provider: 'anthropic(claude-3-sonnet)',
      llm_temperature: 0.5,
      llm_parameters: { max_tokens: 8192 },
      goals: ['The Source-of-Truth Aligner', 'The Risk-First Assessor', 'The Golden-Path Enforcer'],
      tools: ['analysis-engine', 'web-search'],
      permitted_to: ['The Read-Only Auditor', 'The Production-Safe Observer', 'The Gatekeeper-Validated Writer'],
      prompt_system_template: ['You are an expert system architect with deep knowledge of distributed systems.'],
      prompt_user_template: [],
      prompt_context_template: [],
      prompt_instruction: [],
      agent_delegate: ['code-assistant'],
      agent_call: [],
      memory: { enabled: true, scope: 'persistent', storage_id: 'architect-memory' },
      context_files: [],
    });
    console.log(`Created persona: ${persona2.name}`);

    // ---------------------------------------------------------------
    // LLM Defaults
    // ---------------------------------------------------------------
    let totalDefaults = 0;
    console.log('\nSeeding LLM defaults...');

    // --- Goals (17) ---
    const goalKeyIdea = 'Goals provide direction and prioritization, especially when tradeoffs arise.';
    totalDefaults += await createDefaults('goals', [
      {
        name: 'The Minimal-Change Patch',
        description: 'Optimizes for the smallest safe diff that achieves the outcome. Success is minimal churn, easy review, and low regression risk.',
        value: ['small-diff', 'low-churn', 'review-friendly', 'regression-avoidance'],
        context: { key_idea: goalKeyIdea, success_metric: 'minimal churn, easy review, low regression risk' },
        is_default: true,
      },
      {
        name: 'The Source-of-Truth Aligner',
        description: 'Ensures outputs strictly follow authoritative artifacts (specs, design system docs, ADRs). Success is zero contradiction with the source-of-truth.',
        value: ['spec-adherent', 'doc-grounded', 'contract-respecting', 'no-invention'],
        context: { key_idea: goalKeyIdea, success_metric: 'zero contradiction with the source-of-truth' },
      },
      {
        name: 'The Traceability Auditor',
        description: 'Produces outputs with clear lineage from input to decision to output. Success is every change and recommendation being explainable and attributable.',
        value: ['provenance', 'audit-log', 'rationale-map', 'change-justification'],
        context: { key_idea: goalKeyIdea, success_metric: 'every change explainable and attributable' },
      },
      {
        name: 'The Risk-First Assessor',
        description: 'Identifies high-impact failure modes early and proposes mitigations. Success is preventing incidents before implementation.',
        value: ['threat-modeling', 'risk-ranking', 'mitigation-plan', 'blast-radius-control'],
        context: { key_idea: goalKeyIdea, success_metric: 'preventing incidents before implementation' },
      },
      {
        name: 'The Cost Governor',
        description: 'Optimizes for lowest total cost (compute, tokens, build minutes, infra). Success is meeting requirements with minimal resource spend.',
        value: ['token-efficiency', 'compute-budget', 'time-budget', 'cost-aware-tradeoffs'],
        context: { key_idea: goalKeyIdea, success_metric: 'meeting requirements with minimal resource spend' },
      },
      {
        name: 'The Dependency Minimalist',
        description: 'Avoids introducing new libraries unless essential. Success is fewer dependencies, reduced supply-chain risk, and simpler maintenance.',
        value: ['dependency-reduction', 'supply-chain-safety', 'maintenance-simplicity', 'native-first'],
        context: { key_idea: goalKeyIdea, success_metric: 'fewer dependencies, reduced supply-chain risk, simpler maintenance' },
      },
      {
        name: 'The Multi-Platform Consistency Keeper',
        description: 'Ensures consistent behavior and UX across devices/browsers/platforms. Success is parity across targets with predictable fallbacks.',
        value: ['cross-platform', 'browser-compat', 'responsive-consistency', 'graceful-degradation'],
        context: { key_idea: goalKeyIdea, success_metric: 'parity across targets with predictable fallbacks' },
      },
      {
        name: 'The Reusability Amplifier',
        description: 'Designs outputs to be extended and reused across teams/features. Success is composable primitives and scalable patterns.',
        value: ['componentization', 'extensibility', 'shared-primitives', 'pattern-library'],
        context: { key_idea: goalKeyIdea, success_metric: 'composable primitives and scalable patterns' },
      },
      {
        name: 'The Observability-by-Default Builder',
        description: 'Bakes in metrics, logs, traces, and debuggability. Success is fast diagnosis when things fail in real environments.',
        value: ['structured-logging', 'metrics-first', 'trace-enabled', 'debuggable'],
        context: { key_idea: goalKeyIdea, success_metric: 'fast diagnosis when things fail in real environments' },
      },
      {
        name: 'The Production-Safety Gate',
        description: 'Refuses risky actions without the right checks or approvals. Success is no unsafe deployments or irreversible operations.',
        value: ['approval-gates', 'safe-rollouts', 'rollback-ready', 'guardrails-enforced'],
        context: { key_idea: goalKeyIdea, success_metric: 'no unsafe deployments or irreversible operations' },
      },
      {
        name: 'The Data Contract Enforcer',
        description: 'Ensures strict adherence to API schemas and data contracts. Success is no runtime shape mismatches and clear versioning.',
        value: ['schema-validation', 'contract-tests', 'versioning', 'backward-compatible'],
        context: { key_idea: goalKeyIdea, success_metric: 'no runtime shape mismatches and clear versioning' },
      },
      {
        name: 'The Stakeholder Translator',
        description: 'Rewrites technical truth for different audiences without losing meaning. Success is alignment across product, design, and engineering.',
        value: ['audience-adaptive', 'clarity', 'no-jargon-loss', 'alignment-driving'],
        context: { key_idea: goalKeyIdea, success_metric: 'alignment across product, design, and engineering' },
      },
      {
        name: 'The Conflict Resolver',
        description: 'Detects contradictions across inputs (spec vs design vs code) and proposes a resolution path. Success is an explicit decision and documented tradeoff.',
        value: ['inconsistency-detection', 'tradeoff-logging', 'resolution-path', 'decision-capture'],
        context: { key_idea: goalKeyIdea, success_metric: 'explicit decision and documented tradeoff' },
      },
      {
        name: 'The Migration Pathfinder',
        description: 'Optimizes for safe incremental migration rather than big-bang rewrites. Success is stepwise progress with compatibility maintained.',
        value: ['incremental-steps', 'compatibility', 'deprecation-plan', 'rollback-strategy'],
        context: { key_idea: goalKeyIdea, success_metric: 'stepwise progress with compatibility maintained' },
      },
      {
        name: 'The Golden-Path Enforcer',
        description: 'Keeps implementations aligned to approved patterns and frameworks. Success is consistent architecture across teams and fewer bespoke solutions.',
        value: ['pattern-enforcement', 'consistency', 'best-practices', 'standardization'],
        context: { key_idea: goalKeyIdea, success_metric: 'consistent architecture across teams, fewer bespoke solutions' },
      },
      {
        name: 'The User-Intent Guardian',
        description: "Protects the user's actual intent from scope creep or overengineering. Success is delivering exactly what's needed—no more, no less.",
        value: ['scope-control', 'intent-preservation', 'simplicity', 'value-focused'],
        context: { key_idea: goalKeyIdea, success_metric: "delivering exactly what's needed—no more, no less" },
      },
      {
        name: 'The Failure-Recovery Designer',
        description: 'Plans for outages and partial failures (timeouts, retries, fallbacks). Success is graceful behavior and fast recovery.',
        value: ['fallbacks', 'retry-strategy', 'circuit-breakers', 'degraded-mode'],
        context: { key_idea: goalKeyIdea, success_metric: 'graceful behavior and fast recovery' },
      },
    ]);

    // --- Providers (3) ---
    const providerKeyIdea = 'Providers determine capabilities, latency, cost, data handling, and deployment constraints.';
    totalDefaults += await createDefaults('providers', [
      {
        name: 'OpenAI(gpt-4)',
        description: 'The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities.',
        value: { model: 'gpt-4' },
        context: { key_idea: providerKeyIdea, provider: 'openai', model: 'gpt-4' },
        is_default: true,
      },
      {
        name: 'anthropic(claude-3-sonnet)',
        description: 'The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities.',
        value: { model: 'claude-3-sonnet' },
        context: { key_idea: providerKeyIdea, provider: 'anthropic', model: 'claude-3-sonnet' },
      },
      {
        name: 'gemini_openai(gemini-2.0-flash)',
        description: 'The primary intelligence layer (e.g., OpenAI, Anthropic, Google) determining reasoning depth and native capabilities.',
        value: { model: 'gemini-2.0-flash' },
        context: { key_idea: providerKeyIdea, provider: 'gemini_openai', model: 'gemini-2.0-flash' },
      },
    ]);

    // --- Permissions (8) ---
    const permissionKeyIdea = 'Permissions define blast radius and enforce least privilege.';
    totalDefaults += await createDefaults('permissions', [
      {
        name: 'The Read-Only Auditor',
        description: 'Strictly limited to observation. The agent can ingest code, docs, and logs but is prohibited from making file-system changes or committing code.',
        value: ['no-write-access', 'read-only-filesystem', 'log-observation', 'context-ingestion-only'],
        context: { key_idea: permissionKeyIdea, access_level: 'read-only', scope: 'observation' },
        is_default: true,
      },
      {
        name: 'The Sandboxed Developer',
        description: 'Permitted to write and execute code within a transient, isolated environment (e.g., Docker, E2B). Cannot access production secrets or persistent databases.',
        value: ['isolated-execution', 'ephemeral-filesystem', 'outbound-network-block', 'non-persistent'],
        context: { key_idea: permissionKeyIdea, access_level: 'write', scope: 'sandboxed-environment' },
      },
      {
        name: 'The Restricted Repo Agent',
        description: 'Has write access to specific sub-directories (e.g., /src/components or /tests). Blocked from touching sensitive config files, CI/CD pipelines, or root-level scripts.',
        value: ['path-based-whitelist', 'branch-restricted', 'config-file-lock', 'src-only-access'],
        context: { key_idea: permissionKeyIdea, access_level: 'write', scope: 'path-restricted' },
      },
      {
        name: 'The PII-Blind Processor',
        description: 'The agent is allowed to process data only after an anonymization layer has stripped PII/PHI. Any detected sensitive data triggers an immediate process kill.',
        value: ['pii-redaction-enforced', 'anonymized-data-only', 'compliance-boundary', 'automatic-sanitization'],
        context: { key_idea: permissionKeyIdea, access_level: 'read', scope: 'anonymized-data' },
      },
      {
        name: 'The Gatekeeper-Validated Writer',
        description: "Allowed to suggest changes or trigger builds, but every action requires a manual 'Human-in-the-Loop' (HITL) approval before execution.",
        value: ['human-in-the-loop', 'approval-gated', 'staged-execution', 'manual-override-required'],
        context: { key_idea: permissionKeyIdea, access_level: 'write', scope: 'approval-gated' },
      },
      {
        name: 'The Secret-Shielded Integrator',
        description: 'Can call specific internal API endpoints via a proxy but never sees the underlying API keys or secrets directly.',
        value: ['proxy-mediated-access', 'secret-masked', 'token-limited', 'identity-opaque'],
        context: { key_idea: permissionKeyIdea, access_level: 'proxy', scope: 'api-endpoints' },
      },
      {
        name: 'The Rate-Limited Optimizer',
        description: "Enforces strict token and request quotas to prevent runaway costs or DDoS-like behavior against internal services during 'Test and Learn' cycles.",
        value: ['token-quota-limited', 'request-throttling', 'cost-capped', 'concurrency-restricted'],
        context: { key_idea: permissionKeyIdea, access_level: 'throttled', scope: 'quota-bounded' },
      },
      {
        name: 'The Production-Safe Observer',
        description: 'Allowed to read production telemetry (logs, metrics) to identify bottlenecks, but has zero access to production infrastructure or user databases.',
        value: ['telemetry-only', 'infra-blind', 'read-only-logs', 'prod-restricted'],
        context: { key_idea: permissionKeyIdea, access_level: 'read-only', scope: 'production-telemetry' },
      },
    ]);

    // --- Prompts (11) ---
    const promptKeyIdea = "Prompts are the agent's operating procedure—how it's told to behave and how tasks are framed.";
    totalDefaults += await createDefaults('prompts', [
      {
        name: 'The Requirement Synthesizer',
        description: "Transforms fragmented business ideas into structured PRDs. Frames the task as 'What problem are we solving?' rather than 'What are we building?'",
        value: ['problem-first-framing', 'stakeholder-alignment', 'success-metric-definition', 'scope-guardrailing'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 1: Business Specification', phase_number: 1 },
        is_default: true,
      },
      {
        name: 'The Intent-to-Spec Translator',
        description: 'Uses few-shot examples of high-quality technical specs to turn vague product goals into actionable engineering constraints.',
        value: ['technical-specification', 'constraint-mapping', 'logic-flowcharting', 'user-story-derivation'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 1: Business Specification', phase_number: 1 },
      },
      {
        name: 'The Design-to-Logic Mapper',
        description: "A task prompt that forces the agent to 'see' auto-layout and tokens as code structures before any generation occurs.",
        value: ['structure-extraction', 'token-to-variable-mapping', 'variant-enumeration', 'visual-logic-parsing'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 2: Design & Product', phase_number: 2 },
      },
      {
        name: 'The Product Edge-Case Generator',
        description: "Prompts the agent to brainstorm 'The Unhappy Path' (empty states, loading timeouts, 404s) based on the product description.",
        value: ['failure-mode-analysis', 'state-scaffolding', 'edge-case-brainstorming', 'ux-resilience'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 2: Design & Product', phase_number: 2 },
      },
      {
        name: 'The Polyglot Parity Instruction',
        description: 'System instructions for maintaining functional identity between stacks. Forces the agent to cross-reference logic across provided code snippets.',
        value: ['cross-stack-verification', 'logic-porting', 'syntax-agnostic-logic', 'feature-parity'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 3: Development', phase_number: 3 },
      },
      {
        name: 'The Component Artisan Template',
        description: 'A strict template for React/Node generation focusing on atomic design, prop-types/Zod, and modular reusability.',
        value: ['modular-scaffolding', 'type-strict-generation', 'documentation-inclusion', 'boilerplate-minimization'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 3: Development', phase_number: 3 },
      },
      {
        name: 'The Red-Team Adversary',
        description: 'Instructions that cast the agent as an attacker. Focuses on secret leaks, Zod bypasses, and DDoS-prone logic in code reviews.',
        value: ['vulnerability-hunting', 'input-fuzzing', 'security-audit', 'logic-flaw-detection'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 4: Quality Assurance (QA)', phase_number: 4 },
      },
      {
        name: 'The Coverage-Driven Tester',
        description: 'A prompt context packaged with existing code to generate unit and E2E tests that specifically target branching logic and boundary conditions.',
        value: ['test-case-generation', 'coverage-optimization', 'mocking-strategy', 'assertion-rigor'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 4: Quality Assurance (QA)', phase_number: 4 },
      },
      {
        name: 'The CI/CD Gatekeeper Instruction',
        description: 'A set of constraints for evaluating PRs against repo conventions, lint rules, and build-success criteria.',
        value: ['static-check-enforcement', 'deployment-readiness-audit', 'changelog-synthesis', 'convention-compliance'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 5: Deployment & Validation', phase_number: 5 },
      },
      {
        name: 'The Telemetry & Analytics Injector',
        description: 'Guides the agent to insert non-breaking tracking hooks and observability logs into production code based on a provided event taxonomy.',
        value: ['observability-patterning', 'event-taxonomy-alignment', 'logging-standardization', 'data-layer-integration'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 5: Deployment & Validation', phase_number: 5 },
      },
      {
        name: 'The Feedback-Loop Optimizer',
        description: 'A prompt that takes real-world telemetry data/logs and suggests code iterations based on observed performance or conversion drops.',
        value: ['telemetry-to-task-mapping', 'iterative-optimization', 'root-cause-prompting', 'data-driven-refactoring'],
        context: { key_idea: promptKeyIdea, phase: 'Phase 6: Post-Deployment Validation', phase_number: 6 },
      },
    ]);

    // --- Roles (15) ---
    const roleKeyIdea = 'Roles shape assumptions, vocabulary, depth, and risk posture.';
    totalDefaults += await createDefaults('roles', [
      {
        name: 'The Polyglot Architect',
        description: 'Specializes in high-level system design and cross-ecosystem alignment. Ensures that logic implemented in Python/FastAPI remains functionally identical when ported to Node.js/Fastify.',
        value: ['system-design', 'cross-platform-parity', 'architectural-consistency', 'polyglot-patterns'],
        context: { key_idea: roleKeyIdea, group: 'Existing Specialized Roles' },
        is_default: true,
      },
      {
        name: 'The Migration Engineer',
        description: 'A specialized role focused on the tactical translation of legacy codebases (Angular) into modern stacks (React). Prioritizes mapping state management and lifecycle hooks accurately.',
        value: ['refactoring', 'transpilation-logic', 'pattern-mapping', 'legacy-modernization'],
        context: { key_idea: roleKeyIdea, group: 'Existing Specialized Roles' },
      },
      {
        name: 'Design Parser / Structure Extractor',
        description: 'Interprets Figma nodes, auto-layout, and tokens to output a clean intermediate representation (IR) of the layout tree and component candidates.',
        value: ['figma-node-parsing', 'auto-layout-mapping', 'token-extraction', 'ir-generation'],
        context: { key_idea: roleKeyIdea, group: 'Core Design & Engineering Roles' },
      },
      {
        name: 'Component Architect',
        description: 'Determines component boundaries, props, and state boundaries. Maps design variants into scalable component APIs (e.g., slots, intents).',
        value: ['atomic-boundaries', 'api-design', 'prop-mapping', 'state-strategy'],
        context: { key_idea: roleKeyIdea, group: 'Core Design & Engineering Roles' },
      },
      {
        name: 'UI Engineer (Framework Specialist)',
        description: 'Generates idiomatic code for target stacks (React/Tailwind/CSS Modules). Applies accessibility patterns and strict styling conventions.',
        value: ['idiomatic-coding', 'styling-specialist', 'a11y-patterns', 'framework-idioms'],
        context: { key_idea: roleKeyIdea, group: 'Core Design & Engineering Roles' },
      },
      {
        name: 'Design Systems Mapper',
        description: "Resolves Figma styles against existing design tokens and library components. Enforces 'use from DS' logic over rebuilding.",
        value: ['token-resolution', 'ds-enforcement', 'library-mapping', 'style-standardization'],
        context: { key_idea: roleKeyIdea, group: 'Core Design & Engineering Roles' },
      },
      {
        name: 'Accessibility (a11y) Specialist',
        description: 'Ensures keyboard support, correct ARIA semantics, and focus management. Flags contrast and tap-target violations.',
        value: ['aria-compliance', 'focus-management', 'semantic-html', 'contrast-validation'],
        context: { key_idea: roleKeyIdea, group: 'Quality & Compliance Roles' },
      },
      {
        name: 'Test Engineer',
        description: 'Generates unit and E2E tests (Jest, Playwright). Adds visual regression hooks and stable data-selectors for robust testing.',
        value: ['test-automation', 'stable-selectors', 'regression-hooks', 'coverage-optimization'],
        context: { key_idea: roleKeyIdea, group: 'Quality & Compliance Roles' },
      },
      {
        name: 'Performance Engineer',
        description: 'Prevents layout thrash and over-rendering. Suggests memoization, virtualization, and code-splitting to minimize DOM depth.',
        value: ['render-optimization', 'memoization-logic', 'bundle-minimization', 'dom-efficiency'],
        context: { key_idea: roleKeyIdea, group: 'Quality & Compliance Roles' },
      },
      {
        name: 'Security & Privacy Gatekeeper',
        description: 'Prevents secret leaks and insecure patterns. Enforces allowed package licenses and protects against PII mishandling.',
        value: ['secret-prevention', 'dependency-auditing', 'pii-masking', 'secure-defaults'],
        context: { key_idea: roleKeyIdea, group: 'Quality & Compliance Roles' },
      },
      {
        name: 'Code Reviewer / Linter Enforcer',
        description: 'Mentally simulates static checks for formatting, linting, and type correctness. Ensures consistency with repo-specific conventions.',
        value: ['static-analysis', 'convention-checking', 'type-safety-audit', 'lint-enforcement'],
        context: { key_idea: roleKeyIdea, group: 'Delivery Roles' },
      },
      {
        name: 'Integrator / Repo Agent',
        description: "Wires routes, state management, and analytics. Makes the result 'production-pluggable' by integrating feature flags and i18n.",
        value: ['state-wiring', 'route-integration', 'i18n-implementation', 'feature-flag-setup'],
        context: { key_idea: roleKeyIdea, group: 'Delivery Roles' },
      },
      {
        name: 'Build & CI Agent',
        description: 'Ensures compilation, test passing, and Storybook builds. Generates PR-ready output and automated changelogs.',
        value: ['ci-verification', 'compilation-checks', 'pr-automation', 'changelog-generation'],
        context: { key_idea: roleKeyIdea, group: 'Delivery Roles' },
      },
      {
        name: 'Product Semantics Interpreter',
        description: 'Infers intent for forms, loading/error states, and primary actions. Scaffolds UI states consistent with product patterns.',
        value: ['intent-mapping', 'ui-state-scaffolding', 'edge-case-inference', 'ux-semantics'],
        context: { key_idea: roleKeyIdea, group: 'Advanced Semantic Roles' },
      },
      {
        name: 'Analytics Instrumentation Specialist',
        description: 'Adds event taxonomy and tracking hooks at both page and component levels for data-driven insights.',
        value: ['event-taxonomy', 'telemetry-hooks', 'metrics-injection', 'tracking-precision'],
        context: { key_idea: roleKeyIdea, group: 'Advanced Semantic Roles' },
      },
    ]);

    // --- Tones (20) ---
    totalDefaults += await createDefaults('tones', [
      {
        name: 'The Peer Reviewer',
        description: 'Favors brevity and documentation-style clarity with syntactical rigor for technical environments.',
        value: ['collaborative', 'precise', 'iterative', 'direct', 'technical', 'syntactically-rigorous'],
        context: { summary: 'A technically rigorous persona that prioritizes "documentation-style" clarity and syntactical precision for developers.' },
        is_default: true,
      },
      {
        name: 'The Growth Strategist',
        description: "Uses 'we' phrasing to foster a sense of shared experimentation and insight-driven iteration.",
        value: ['insight-driven', 'encouraging', 'analytical', 'experimental', 'collaborative'],
        context: { summary: 'An insight-driven persona using shared experimentation language ("we") to drive product and marketing iterations.' },
      },
      {
        name: 'The Helpful Steward',
        description: 'Avoids jargon to remain accessible to the public while maintaining a secure, locked-down feel.',
        value: ['reassuring', 'simple', 'highly-secure', 'accessible', 'protective'],
        context: { summary: 'A jargon-free, reassuring voice designed to guide general users through sensitive or secure processes safely.' },
      },
      {
        name: 'The Fiduciary Analyst',
        description: 'Avoids emotional language to prevent the appearance of bias, focusing on formal, data-heavy reporting.',
        value: ['formal', 'data-heavy', 'neutral', 'objective', 'compliant'],
        context: { summary: 'A formal, data-dense persona that maintains strict neutrality and avoids emotional bias for high-stakes reporting.' },
      },
      {
        name: 'The Fact-Finder',
        description: 'Prioritizes the inverted pyramid of information, delivering objective and urgent updates.',
        value: ['objective', 'urgent', 'concise', 'informative', 'prioritized'],
        context: { summary: 'A news-oriented persona utilizing the inverted pyramid to deliver urgent, objective information concisely.' },
      },
      {
        name: 'The World-Builder',
        description: 'Uses vivid adjectives and in-universe personas to create descriptive, personality-driven narratives.',
        value: ['highly-descriptive', 'playful', 'personality-driven', 'vivid', 'evocative'],
        context: { summary: 'A highly descriptive, atmospheric persona used to create immersive environments or personality-driven narratives.' },
      },
      {
        name: 'The Dispatcher',
        description: 'Focuses on time-stamps and status updates using ultra-concise, imperative language.',
        value: ['ultra-concise', 'imperative', 'real-time', 'functional', 'direct'],
        context: { summary: 'An ultra-concise, imperative persona focused on the immediate delivery of time-sensitive logistical updates.' },
      },
      {
        name: 'The Systems Optimizer',
        description: 'Logical and problem-solving focus on bottleneck identification and throughput metrics.',
        value: ['logical', 'problem-solving', 'diagnostic', 'efficient', 'metrics-oriented'],
        context: { summary: 'A logical, problem-solving persona focused on identifying bottlenecks and improving technical or mechanical throughput.' },
      },
      {
        name: 'The Framework Migrator',
        description: 'Specializes in mapping Angular patterns (Directives, Services, RxJS) to React equivalents (Hooks, Functional Components, State).',
        value: ['comparative', 'transitional', 'mapping-focused', 'structural'],
        context: { domain: 'migration', stacks: ['Angular', 'React'] },
      },
      {
        name: 'The Parity Auditor',
        description: 'Ensures 1:1 functional consistency during migrations, focusing on edge cases and logic replication.',
        value: ['rigorous', 'reductive', 'verification-heavy', 'consistent'],
        context: { domain: 'migration', focus: 'functional-parity-verification' },
      },
      {
        name: 'The E2E Architect',
        description: 'Breaks down complex systems into sequential, end-to-end documentation with clear input/output flows.',
        value: ['comprehensive', 'sequential', 'granular', 'flow-oriented'],
        context: { domain: 'documentation', focus: 'end-to-end-flow' },
      },
      {
        name: 'The Pixel-Perfect Critic',
        description: 'Focuses exclusively on CSS accuracy, spacing, tokens, and visual fidelity relative to design specs.',
        value: ['visual-centric', 'exacting', 'aesthetic', 'token-driven'],
        context: { domain: 'design-fidelity', focus: 'css-accuracy' },
      },
      {
        name: 'The Experimentation Optimizer',
        description: 'Iterative tone focused on A/B testing, telemetry, and rapid feedback loops to improve KPIs.',
        value: ['hypothetical', 'data-led', 'adaptive', 'velocity-focused'],
        context: { domain: 'experimentation', focus: 'ab-testing-and-telemetry' },
      },
      {
        name: 'The Page Composer',
        description: 'Focuses on high-level React concerns like data fetching (SSR/ISR), SEO, layout, and routing.',
        value: ['orchestral', 'holistic', 'structural', 'performance-aware'],
        context: { domain: 'frontend', stack: 'React', focus: 'page-level-concerns' },
      },
      {
        name: 'The Component Artisan',
        description: 'Focuses on React atomic design, prop-drilling prevention, memoization, and reusability.',
        value: ['modular', 'granular', 'optimized', 'prop-strict'],
        context: { domain: 'frontend', stack: 'React', focus: 'component-level-concerns' },
      },
      {
        name: 'The Java Core Architect',
        description: 'Emphasizes type safety, Spring Boot patterns, enterprise scalability, and OOP principles.',
        value: ['robust', 'verbose', 'standardized', 'object-oriented'],
        context: { domain: 'backend', stack: 'Java/Spring Boot', focus: 'enterprise-patterns' },
      },
      {
        name: 'The Node.js Runtime Specialist',
        description: 'Focuses on non-blocking I/O, event-loop efficiency, and the vast npm ecosystem.',
        value: ['asynchronous', 'event-driven', 'efficient', 'modern-js'],
        context: { domain: 'backend', stack: 'Node.js', focus: 'runtime-efficiency' },
      },
      {
        name: 'The Pythonic Zen Master',
        description: "Prioritizes readability, 'The Zen of Python,' and idiomatic code (PEP 8).",
        value: ['idiomatic', 'readable', 'concise', 'explicit'],
        context: { domain: 'backend', stack: 'Python', focus: 'idiomatic-style' },
      },
      {
        name: 'The Schema Based Backend',
        description: 'Focuses on schema-based validation (JSON Schema) and high-performance async backends.',
        value: ['schema-first', 'high-performance', 'async-native', 'overhead-conscious'],
        context: { domain: 'backend', focus: 'schema-validation-and-async' },
      },
      {
        name: 'The Zod Validator',
        description: 'Focuses on runtime type-safety, strict parsing, and informative error handling at the boundary.',
        value: ['schema-strict', 'type-safe', 'defensive', 'error-descriptive'],
        context: { domain: 'validation', stack: 'TypeScript/Zod', focus: 'runtime-type-safety' },
      },
    ]);

    // ---------------------------------------------------------------
    // Audit Logs
    // ---------------------------------------------------------------

    await AuditLog.create({
      id: `audit-${uuidv4()}`,
      persona_id: persona1.id,
      action: 'CREATE',
      user_id: 'seed-script',
      changes: JSON.stringify({ created: true }),
    });

    await AuditLog.create({
      id: `audit-${uuidv4()}`,
      persona_id: persona2.id,
      action: 'CREATE',
      user_id: 'seed-script',
      changes: JSON.stringify({ created: true }),
    });

    console.log('\nSeeding complete:');
    console.log('  - 2 personas created');
    console.log(`  - ${totalDefaults} LLM defaults created`);
    console.log('  - 2 audit logs created');

  } catch (error) {
    console.error('Seeding failed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
