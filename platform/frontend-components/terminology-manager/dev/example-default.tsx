import { useState } from 'react';
import { TerminologyManager } from '../src';
import type { Term } from '../src';

const SAMPLE_TERMS: Term[] = [
  {
    id: 't1',
    term: 'Project Phoenix',
    aliases: ['Phoenix', 'Legacy Migration'],
    definition: 'The internal initiative to migrate our legacy monolithic architecture to distributed microservices.',
    reference_urls: ['https://confluence.internal/docs/project-phoenix', 'https://jira.internal/browse/PHX-101'],
    name: 'project-phoenix',
    description: 'Covers all terminology related to the Phoenix migration initiative including timelines, milestones, and architectural decisions.',
    compatibility: 'Requires access to internal Confluence and Jira instances. VPN required for remote access.',
    metadata: { owner: 'Platform Team', priority: 'P0', quarter: 'Q2 2026' },
    createdAt: '2026-01-15',
    updatedAt: '2026-03-22',
  },
  {
    id: 't2',
    term: 'Golden Path',
    aliases: ['Happy Path', 'GP'],
    definition: 'The recommended, opinionated developer workflow for building and deploying services using our internal platform tooling.',
    reference_urls: ['https://confluence.internal/docs/golden-path'],
    name: 'golden-path',
    description: 'Standard developer onboarding and workflow guide for internal platform usage.',
    compatibility: 'Compatible with all internal CLI tools v2.x+. Node 20+ required.',
    metadata: { owner: 'DevEx Team', priority: 'P1' },
    createdAt: '2025-11-02',
    updatedAt: '2026-02-18',
  },
  {
    id: 't3',
    term: 'Blue/Green Deploy',
    aliases: ['BG Deploy', 'Zero-Downtime Release'],
    definition: 'Our customized blue/green deployment strategy that routes traffic between two identical production environments using weighted DNS.',
    reference_urls: ['https://confluence.internal/docs/deploy-strategy', 'https://runbooks.internal/blue-green'],
    name: 'blue-green-deploy',
    description: 'Deployment pattern documentation for zero-downtime releases across all production services.',
    compatibility: 'Requires Kubernetes 1.28+ and Istio service mesh. AWS EKS only.',
    metadata: { owner: 'SRE', priority: 'P0', quarter: 'Q1 2026' },
    createdAt: '2025-09-10',
    updatedAt: '2026-04-01',
  },
  {
    id: 't4',
    term: 'Data Mesh',
    aliases: ['Domain-Driven Data', 'DM'],
    definition: 'Our organizational approach to analytical data management where domain teams own and serve their data as products.',
    reference_urls: ['https://confluence.internal/docs/data-mesh-overview'],
    name: 'data-mesh',
    description: 'Architecture and governance model for decentralized data ownership across business domains.',
    compatibility: 'Postgres 15+, Redis 7+, AWS S3. Python 3.11+ for SDK.',
    metadata: { owner: 'Data Platform', priority: 'P1' },
    createdAt: '2025-12-05',
    updatedAt: '2026-03-15',
  },
  {
    id: 't5',
    term: 'Guardrails',
    aliases: ['Policy Engine', 'Safety Layer'],
    definition: 'The internal policy enforcement layer that validates LLM agent outputs against company compliance rules before surfacing to end users.',
    reference_urls: ['https://confluence.internal/docs/guardrails-v2', 'https://github.internal/ai-platform/guardrails'],
    name: 'guardrails',
    description: 'LLM output validation and compliance enforcement system for all AI-powered features.',
    compatibility: 'Fastify 4.x backend. Rust validation engine. Requires AI Platform API keys.',
    metadata: { owner: 'AI Platform', priority: 'P0', quarter: 'Q2 2026' },
    createdAt: '2026-02-01',
    updatedAt: '2026-04-05',
  },
];

export default function ExampleDefault() {
  const [terms, setTerms] = useState(SAMPLE_TERMS);

  const handleSave = (term: Term) => {
    setTerms((prev) => {
      const idx = prev.findIndex((x) => x.id === term.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = term;
        return next;
      }
      return [term, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setTerms((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TerminologyManager
      terms={terms}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
