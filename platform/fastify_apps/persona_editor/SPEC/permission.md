Permissions

The allowed scope of what the agent can access or change—its security and compliance boundaries.
Examples: read-only vs write access, allowed data domains (PII/no PII), which endpoints it can call, which files/folders it can touch, rate limits, environment restrictions, approval gates for high-risk actions.
Key idea: permissions define blast radius and enforce least privilege.

```yaml
permissions:
  - name: "The Read-Only Auditor"
    description: "Strictly limited to observation. The agent can ingest code, docs, and logs but is prohibited from making file-system changes or committing code."
    values:
      [
        "no-write-access",
        "read-only-filesystem",
        "log-observation",
        "context-ingestion-only",
      ]

  - name: "The Sandboxed Developer"
    description: "Permitted to write and execute code within a transient, isolated environment (e.g., Docker, E2B). Cannot access production secrets or persistent databases."
    values:
      [
        "isolated-execution",
        "ephemeral-filesystem",
        "outbound-network-block",
        "non-persistent",
      ]

  - name: "The Restricted Repo Agent"
    description: "Has write access to specific sub-directories (e.g., /src/components or /tests). Blocked from touching sensitive config files, CI/CD pipelines, or root-level scripts."
    values:
      [
        "path-based-whitelist",
        "branch-restricted",
        "config-file-lock",
        "src-only-access",
      ]

  - name: "The PII-Blind Processor"
    description: "The agent is allowed to process data only after an anonymization layer has stripped PII/PHI. Any detected sensitive data triggers an immediate process kill."
    values:
      [
        "pii-redaction-enforced",
        "anonymized-data-only",
        "compliance-boundary",
        "automatic-sanitization",
      ]

  - name: "The Gatekeeper-Validated Writer"
    description: "Allowed to suggest changes or trigger builds, but every action requires a manual 'Human-in-the-Loop' (HITL) approval before execution."
    values:
      [
        "human-in-the-loop",
        "approval-gated",
        "staged-execution",
        "manual-override-required",
      ]

  - name: "The Secret-Shielded Integrator"
    description: "Can call specific internal API endpoints via a proxy but never sees the underlying API keys or secrets directly."
    values:
      [
        "proxy-mediated-access",
        "secret-masked",
        "token-limited",
        "identity-opaque",
      ]

  - name: "The Rate-Limited Optimizer"
    description: "Enforces strict token and request quotas to prevent runaway costs or DDoS-like behavior against internal services during 'Test and Learn' cycles."
    values:
      [
        "token-quota-limited",
        "request-throttling",
        "cost-capped",
        "concurrency-restricted",
      ]

  - name: "The Production-Safe Observer"
    description: "Allowed to read production telemetry (logs, metrics) to identify bottlenecks, but has zero access to production infrastructure or user databases."
    values:
      ["telemetry-only", "infra-blind", "read-only-logs", "prod-restricted"]
```
