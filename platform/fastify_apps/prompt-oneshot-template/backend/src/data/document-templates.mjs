/**
 * Built-in document type templates based on industry-standard requirement document formats.
 *
 * Each template uses mustache/edge syntax compatible with the AiopsPromptOneshotTemplate component:
 *   {{ variable }}     — HTML-escaped interpolation
 *   {{{ variable }}}   — unescaped interpolation
 *   @if(variable) ... @end — conditional blocks
 */

export const documentTemplates = [
  {
    id: "2bb6f227-1da7-46cc-9c39-c0a97f7faa4b",
    name: "Product Requirements Document (PRD)",
    category: "requirements",
    description: "Product vision, features, user scenarios, and success metrics",
    templateName: "PRD_Template.edge",
    version: "v1.0",
    template: `# Product Requirements Document (PRD)
## {{ productName }}

**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}
**Status:** {{ status }}

---

## 1. Purpose & Vision

{{ productVision }}

## 2. Goals & KPIs

@if(primaryGoal)
### Primary Goal
{{ primaryGoal }}
@end

### Success Metrics
{{ successMetrics }}

## 3. Target Users

{{ targetUsers }}

@if(userPersona)
### User Persona
{{ userPersona }}
@end

## 4. Features

### Core Features
{{{ coreFeatures }}}

@if(futureFeatures)
### Future Considerations
{{{ futureFeatures }}}
@end

## 5. User Scenarios

{{{ userScenarios }}}

## 6. Constraints

@if(technicalConstraints)
### Technical Constraints
{{ technicalConstraints }}
@end

@if(timelineConstraints)
### Timeline Constraints
{{ timelineConstraints }}
@end

## 7. Dependencies

{{ dependencies }}

## 8. Timeline & Milestones

{{ timeline }}
`,
    mockData: {
      productName: "AIOps Template Manager",
      version: "1.0.0",
      author: "Product Team",
      date: "2026-04-02",
      status: "Draft",
      productVision: "Enable engineering teams to standardize and automate the creation of requirement documents using AI-powered templates.",
      primaryGoal: "Reduce document creation time by 60% while maintaining quality standards",
      successMetrics: "- Time to create first draft < 15 minutes\\n- Template adoption rate > 80%\\n- User satisfaction score > 4.2/5",
      targetUsers: "Engineering leads, product managers, and technical writers who regularly create requirement documents.",
      userPersona: "Sarah, a senior engineering lead who manages 3 teams and needs to create consistent PRDs for each sprint.",
      coreFeatures: "- Template authoring workspace with live preview\\n- Variable extraction and interpolation\\n- JSON/YAML import for bulk data\\n- Version management with auto-increment",
      futureFeatures: "- AI-assisted template generation\\n- Team collaboration and sharing\\n- Template marketplace",
      userScenarios: "1. Engineer opens workspace, selects PRD template\\n2. Fills in project-specific variables\\n3. Previews resolved document in real-time\\n4. Exports final document for review",
      technicalConstraints: "Must run in modern browsers (Chrome 90+, Firefox 88+, Safari 14+)",
      timelineConstraints: "MVP by end of Q2 2026",
      dependencies: "- AiopsPromptOneshotTemplate component library\\n- Fastify backend for template storage",
      timeline: "- Week 1-2: Template engine and editor\\n- Week 3-4: Variable management\\n- Week 5-6: Import/Export and versioning",
    },
  },
  {
    id: "7aa561ca-fd66-4c4b-81ef-9f46326913c5",
    name: "Software Requirements Specification (SRS)",
    category: "requirements",
    description: "Formal functional and non-functional requirements for software systems",
    templateName: "SRS_Template.edge",
    version: "v1.0",
    template: `# Software Requirements Specification (SRS)
## {{ systemName }}

**Document ID:** {{ documentId }}
**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}

---

## 1. Introduction

### 1.1 Purpose
{{ purpose }}

### 1.2 Scope
{{ scope }}

### 1.3 Definitions & Acronyms
{{ definitions }}

## 2. Overall Description

### 2.1 Product Perspective
{{ productPerspective }}

### 2.2 Operating Environment
{{ operatingEnvironment }}

### 2.3 Assumptions & Dependencies
{{ assumptions }}

## 3. Functional Requirements

{{{ functionalRequirements }}}

## 4. Non-Functional Requirements

### 4.1 Performance
{{ performanceReqs }}

### 4.2 Security
{{ securityReqs }}

### 4.3 Reliability
{{ reliabilityReqs }}

@if(usabilityReqs)
### 4.4 Usability
{{ usabilityReqs }}
@end

## 5. External Interfaces

### 5.1 User Interfaces
{{ userInterfaces }}

### 5.2 API Interfaces
{{ apiInterfaces }}

## 6. Constraints
{{ constraints }}

## 7. Acceptance Criteria
{{{ acceptanceCriteria }}}
`,
    mockData: {
      systemName: "Template Management System",
      documentId: "SRS-TMS-001",
      version: "1.0.0",
      author: "Architecture Team",
      date: "2026-04-02",
      purpose: "Define the functional and non-functional requirements for the Template Management System (TMS).",
      scope: "The TMS provides a web-based interface for creating, editing, previewing, and managing document templates with variable interpolation.",
      definitions: "- **Template**: A document with placeholder variables\\n- **Variable**: A named token that gets replaced with actual values\\n- **Resolution**: The process of replacing variables with values",
      productPerspective: "The TMS is a self-contained web application that operates as a Fastify plugin within the MTA-V800 platform.",
      operatingEnvironment: "Node.js 18+, modern web browsers, PostgreSQL 14+",
      assumptions: "- Users have basic knowledge of template syntax\\n- Network connectivity is available\\n- Authentication is handled by the platform",
      functionalRequirements: "**FR-001**: The system SHALL allow users to create templates with mustache-style variables\\n**FR-002**: The system SHALL extract variables automatically from template content\\n**FR-003**: The system SHALL resolve templates with provided variable values in real-time\\n**FR-004**: The system SHALL support importing variables from JSON and YAML formats\\n**FR-005**: The system SHALL track template versions with auto-increment",
      performanceReqs: "Template resolution SHALL complete within 100ms for templates up to 10,000 characters.",
      securityReqs: "All template data SHALL be validated and sanitized before storage.",
      reliabilityReqs: "The system SHALL maintain 99.9% uptime during business hours.",
      usabilityReqs: "The editor SHALL provide syntax highlighting and line numbers for templates.",
      userInterfaces: "Web-based single-page application with split-view editor and preview panes.",
      apiInterfaces: "RESTful API with JSON request/response bodies. Endpoints for CRUD operations on templates.",
      constraints: "- Must integrate with existing Fastify server architecture\\n- Must use ESM modules exclusively\\n- Template size limited to 100KB",
      acceptanceCriteria: "- [ ] Templates can be created, read, updated, and deleted via API\\n- [ ] Variable extraction works for mustache and edge syntax\\n- [ ] Live preview updates within 200ms of input change\\n- [ ] JSON/YAML import correctly populates variables",
    },
  },
  {
    id: "06ef0675-7655-46cd-8d44-436347435940",
    name: "High-Level Design (HLD)",
    category: "design",
    description: "Architecture overview with major systems, service boundaries, and data flow",
    templateName: "HLD_Template.edge",
    version: "v1.0",
    template: `# High-Level Design Document
## {{ systemName }}

**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}

---

## 1. Overview

{{ overview }}

## 2. Architecture

### 2.1 Major Systems
{{{ majorSystems }}}

### 2.2 Service Boundaries
{{ serviceBoundaries }}

### 2.3 Data Flow
{{ dataFlow }}

## 3. Integrations

{{ integrations }}

## 4. Infrastructure

{{ infrastructure }}

@if(scalingStrategy)
## 5. Scaling Strategy
{{ scalingStrategy }}
@end

## 6. Risks & Mitigations

{{{ risks }}}

## 7. Rollout Plan

{{ rolloutPlan }}
`,
    mockData: {
      systemName: "Template Management Platform",
      version: "1.0.0",
      author: "Architecture Team",
      date: "2026-04-02",
      overview: "The Template Management Platform provides a centralized workspace for authoring, managing, and resolving document templates across engineering teams.",
      majorSystems: "1. **Template Editor** — Browser-based editor with syntax highlighting\\n2. **Template Engine** — Server-side resolution and variable extraction\\n3. **Storage Layer** — PostgreSQL-backed persistence\\n4. **API Gateway** — Fastify REST endpoints",
      serviceBoundaries: "The platform runs as a Fastify plugin within the MTA-V800 server, sharing the database connection pool and authentication middleware.",
      dataFlow: "User edits template → Frontend extracts variables → User provides values → Template engine resolves → Preview renders in real-time",
      integrations: "- MTA-V800 Fastify server (host platform)\\n- PostgreSQL database (shared connection)\\n- Static App Loader (frontend serving)",
      infrastructure: "Single-server deployment as part of the MTA-V800 monolith. Frontend built with Vite and served via static-app-loader.",
      scalingStrategy: "Horizontal scaling via the platform's existing load balancer. Template resolution is stateless and CPU-bound.",
      risks: "| Risk | Impact | Mitigation |\\n|------|--------|------------|\\n| Large templates cause slow resolution | Medium | Implement size limits and chunked processing |\\n| Variable injection attacks | High | Sanitize all variable values before interpolation |",
      rolloutPlan: "1. Deploy backend API endpoints\\n2. Build and deploy frontend\\n3. Register lifecycle hook\\n4. Enable for pilot team\\n5. General availability",
    },
  },
  {
    id: "1dc28c1f-76ec-4ec1-b301-80bf46e98902",
    name: "Low-Level Design (LLD)",
    category: "design",
    description: "Implementation details with modules, functions, schemas, and API contracts",
    templateName: "LLD_Template.edge",
    version: "v1.0",
    template: `# Low-Level Design Document
## {{ moduleName }}

**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}
**Parent HLD:** {{ parentHld }}

---

## 1. Module Overview

{{ moduleOverview }}

## 2. Components

{{{ components }}}

## 3. Data Schema

\`\`\`
{{{ dataSchema }}}
\`\`\`

## 4. API Contracts

{{{ apiContracts }}}

## 5. Sequence Logic

{{ sequenceLogic }}

## 6. Validation Rules

{{{ validationRules }}}

@if(errorHandling)
## 7. Error Handling
{{{ errorHandling }}}
@end
`,
    mockData: {
      moduleName: "Template Engine Module",
      version: "1.0.0",
      author: "Engineering Team",
      date: "2026-04-02",
      parentHld: "HLD-TMP-001",
      moduleOverview: "The Template Engine module handles variable extraction, template resolution, and syntax highlighting for the template authoring workspace.",
      components: "- **extractVariables(template)** — Regex-based extraction of variable names from mustache and edge syntax\\n- **resolveTemplate(template, data)** — Processes conditionals and interpolates variables\\n- **highlightSyntax(text)** — Returns HTML-highlighted lines for the editor\\n- **parseSimpleYaml(yaml)** — Flat YAML parser for variable import",
      dataSchema: "Template {\\n  id: UUID (PK)\\n  name: VARCHAR(255)\\n  category: VARCHAR(100)\\n  template_content: TEXT\\n  mock_data: JSONB\\n  version: VARCHAR(20)\\n  created_at: TIMESTAMP\\n  updated_at: TIMESTAMP\\n}",
      apiContracts: "**GET /api/prompt-oneshot-template/templates**\\nReturns: Array of template summaries\\n\\n**GET /api/prompt-oneshot-template/templates/:id**\\nReturns: Full template with content and mock data\\n\\n**POST /api/prompt-oneshot-template/templates**\\nBody: { name, category, template, mockData }\\nReturns: Created template",
      sequenceLogic: "1. User loads template → GET /templates/:id\\n2. Frontend calls extractVariables() on template content\\n3. User modifies variables → resolveTemplate() called on each keystroke\\n4. User saves → POST/PUT to backend",
      validationRules: "- Template name: required, 1-255 characters\\n- Category: required, must be one of: requirements, design, specification, operational\\n- Template content: required, max 100KB\\n- Version: semver format (vX.Y)",
      errorHandling: "- Missing template: 404 Not Found\\n- Invalid template syntax: 400 Bad Request with parse error details\\n- Template too large: 413 Payload Too Large",
    },
  },
  {
    id: "e316fe40-0d84-465e-87d0-a6f3852b4dc1",
    name: "Architecture Decision Record (ADR)",
    category: "design",
    description: "Captures a single important technical decision with context and consequences",
    templateName: "ADR_Template.edge",
    version: "v1.0",
    template: `# ADR-{{ adrNumber }}: {{ title }}

**Date:** {{ date }}
**Status:** {{ status }}
**Deciders:** {{ deciders }}

---

## Context

{{ context }}

## Decision

{{ decision }}

## Alternatives Considered

{{{ alternatives }}}

## Tradeoffs

{{{ tradeoffs }}}

## Consequences

### Positive
{{{ positiveConsequences }}}

### Negative
{{{ negativeConsequences }}}

@if(relatedDecisions)
## Related Decisions
{{ relatedDecisions }}
@end
`,
    mockData: {
      adrNumber: "042",
      title: "Use Mustache/Edge Syntax for Template Variables",
      date: "2026-04-02",
      status: "Accepted",
      deciders: "Engineering Lead, Architecture Team",
      context: "We need a template variable syntax that is familiar to developers, supports conditionals, and is safe against injection attacks.",
      decision: "We will use a combination of Mustache ({{ }}) and Edge (@if/@end) syntax for template variables. Double-mustache escapes HTML; triple-mustache ({{{ }}}) allows raw output.",
      alternatives: "1. **Handlebars** — Full-featured but heavyweight for our needs\\n2. **EJS** — Allows arbitrary JS execution, security risk\\n3. **Jinja2** — Python-centric, not ideal for JS ecosystem\\n4. **Custom syntax** — Higher learning curve, no ecosystem support",
      tradeoffs: "- Mustache/Edge is widely known but less powerful than Handlebars\\n- No loops or helpers, but keeps templates simple and predictable\\n- HTML escaping by default reduces XSS risk",
      positiveConsequences: "- Familiar syntax reduces onboarding time\\n- Built-in HTML escaping improves security\\n- Simple regex-based parsing, no external dependencies",
      negativeConsequences: "- No loop support limits complex templates\\n- Custom @if syntax is non-standard\\n- May need to extend syntax in the future",
      relatedDecisions: "ADR-038: Template Storage Architecture",
    },
  },
  {
    id: "d3841a8a-9534-4768-9f4d-b51b56b27383",
    name: "API Specification",
    category: "specification",
    description: "Service interface definition with endpoints, models, auth, and status codes",
    templateName: "API_Spec_Template.edge",
    version: "v1.0",
    template: `# API Specification
## {{ serviceName }}

**Base URL:** {{ baseUrl }}
**Version:** {{ apiVersion }}
**Auth:** {{ authMethod }}

---

## Overview

{{ overview }}

## Authentication

{{ authDetails }}

## Endpoints

{{{ endpoints }}}

## Request/Response Models

{{{ models }}}

## Status Codes

| Code | Description |
|------|-------------|
{{{ statusCodes }}}

@if(rateLimits)
## Rate Limits
{{ rateLimits }}
@end

## Examples

{{{ examples }}}
`,
    mockData: {
      serviceName: "Template Management API",
      baseUrl: "/api/prompt-oneshot-template",
      apiVersion: "v1",
      authMethod: "Bearer Token (platform auth)",
      overview: "RESTful API for managing document templates. Supports CRUD operations, template resolution, and variable extraction.",
      authDetails: "Authentication is handled by the platform middleware. All requests must include a valid Bearer token in the Authorization header.",
      endpoints: "### GET /templates\\nList all templates with optional filtering by category.\\n\\n### GET /templates/:id\\nRetrieve a single template with full content and mock data.\\n\\n### POST /templates\\nCreate a new template.\\n\\n### PUT /templates/:id\\nUpdate an existing template. Auto-increments version.\\n\\n### DELETE /templates/:id\\nSoft-delete a template.",
      models: "### Template\\n```json\\n{\\n  \"id\": \"uuid\",\\n  \"name\": \"string\",\\n  \"category\": \"string\",\\n  \"template\": \"string\",\\n  \"mockData\": \"object\",\\n  \"version\": \"string\"\\n}\\n```",
      statusCodes: "| 200 | Success |\\n| 201 | Created |\\n| 204 | Deleted |\\n| 400 | Bad Request |\\n| 404 | Not Found |\\n| 413 | Payload Too Large |\\n| 503 | Service Unavailable |",
      rateLimits: "100 requests per minute per user. Bulk operations count as a single request.",
      examples: "### Create Template\\n```bash\\ncurl -X POST /api/prompt-oneshot-template/templates \\\\\\n  -H 'Content-Type: application/json' \\\\\\n  -d '{\"name\": \"My PRD\", \"category\": \"requirements\", \"template\": \"# {{ title }}\"}'\\n```",
    },
  },
  {
    id: "ac8ef205-b011-4310-9f1d-a3cfd6323ffd",
    name: "Test Design Spec",
    category: "specification",
    description: "Validation strategy with unit, integration, E2E coverage and acceptance criteria",
    templateName: "Test_Design_Template.edge",
    version: "v1.0",
    template: `# Test Design Specification
## {{ featureName }}

**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}

---

## 1. Test Scope

{{ testScope }}

## 2. Unit Tests

{{{ unitTests }}}

## 3. Integration Tests

{{{ integrationTests }}}

@if(e2eTests)
## 4. E2E Tests

{{{ e2eTests }}}
@end

## 5. Performance Testing

{{ performanceTesting }}

## 6. Acceptance Criteria

{{{ acceptanceCriteria }}}

## 7. Test Data Requirements

{{ testDataNeeds }}
`,
    mockData: {
      featureName: "Template Engine",
      version: "1.0.0",
      author: "QA Team",
      date: "2026-04-02",
      testScope: "All template engine functions including variable extraction, template resolution, syntax highlighting, and YAML parsing.",
      unitTests: "- extractVariables() correctly identifies {{ }}, {{{ }}}, and @if() tokens\\n- resolveTemplate() interpolates all variable types\\n- resolveTemplate() handles missing variables gracefully\\n- highlightSyntax() produces correct HTML for each syntax category\\n- parseSimpleYaml() handles quoted values, comments, and empty lines",
      integrationTests: "- Template CRUD via REST API returns correct status codes\\n- Template resolution endpoint processes variables end-to-end\\n- Frontend component renders and syncs with backend state",
      e2eTests: "- User creates a template, adds variables, previews, and saves\\n- User imports JSON variables and verifies template resolution\\n- User switches between editor and split view modes",
      performanceTesting: "- Template resolution with 50+ variables completes under 100ms\\n- Editor remains responsive with templates up to 10,000 lines",
      acceptanceCriteria: "- [ ] All unit tests pass with >90% coverage\\n- [ ] Integration tests pass against running server\\n- [ ] E2E tests pass in Chrome and Firefox\\n- [ ] No performance regressions detected",
      testDataNeeds: "- Sample templates for each document type (PRD, SRS, HLD, LLD, ADR)\\n- Variable sets with edge cases (empty strings, long values, special characters)\\n- Malformed YAML/JSON inputs for error handling tests",
    },
  },
  {
    id: "beae599d-419e-4228-9d17-45ff29417fbb",
    name: "Data Design Spec",
    category: "design",
    description: "Data modeling with entities, relationships, schemas, and storage choices",
    templateName: "Data_Design_Template.edge",
    version: "v1.0",
    template: `# Data Design Specification
## {{ systemName }}

**Version:** {{ version }}
**Author:** {{ author }}
**Date:** {{ date }}

---

## 1. Entities

{{{ entities }}}

## 2. Relationships

{{{ relationships }}}

## 3. Schema Definition

\`\`\`sql
{{{ schemaDefinition }}}
\`\`\`

## 4. Indexing Strategy

{{ indexingStrategy }}

## 5. Storage Choice

{{ storageChoice }}

@if(retentionPolicy)
## 6. Retention Policy
{{ retentionPolicy }}
@end

@if(migrationImpact)
## 7. Migration Impact
{{ migrationImpact }}
@end
`,
    mockData: {
      systemName: "Template Management System",
      version: "1.0.0",
      author: "Data Architecture Team",
      date: "2026-04-02",
      entities: "- **Template** — Core entity storing template content and metadata\\n- **TemplateVersion** — Version history for each template\\n- **TemplateCategory** — Classification taxonomy for templates",
      relationships: "- Template 1:N TemplateVersion (one template has many versions)\\n- Template N:1 TemplateCategory (many templates belong to one category)",
      schemaDefinition: "CREATE TABLE pot_templates (\\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\n  name VARCHAR(255) NOT NULL,\\n  category VARCHAR(100) NOT NULL,\\n  template_content TEXT NOT NULL,\\n  mock_data JSONB DEFAULT '{}',\\n  version VARCHAR(20) DEFAULT 'v1.0',\\n  created_at TIMESTAMPTZ DEFAULT NOW(),\\n  updated_at TIMESTAMPTZ DEFAULT NOW()\\n);",
      indexingStrategy: "- Primary key index on id (automatic)\\n- Index on category for filtered queries\\n- GIN index on mock_data for JSON path queries",
      storageChoice: "PostgreSQL with JSONB for flexible mock data storage. Template content stored as TEXT to avoid size limitations of VARCHAR.",
      retentionPolicy: "Template versions retained for 1 year. Soft-deleted templates purged after 90 days.",
      migrationImpact: "New table creation only — no impact on existing schema. Requires running setup.mjs before first use.",
    },
  },
];

/**
 * Get all templates (summary only, without full content)
 */
export function getTemplateSummaries() {
  return documentTemplates.map(({ id, name, category, description, version }) => ({
    id,
    name,
    category,
    description,
    version,
  }));
}

/**
 * Get a single template by ID
 */
export function getTemplateById(id) {
  return documentTemplates.find((t) => t.id === id) || null;
}

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(category) {
  return documentTemplates.filter((t) => t.category === category);
}
