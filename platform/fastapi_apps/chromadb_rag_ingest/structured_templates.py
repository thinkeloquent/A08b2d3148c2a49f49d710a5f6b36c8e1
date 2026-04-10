"""Predefined structured output templates for LLM responses.

Each template defines a JSON Schema that constrains LLM output.
OpenAI/Gemini use native response_format enforcement; Anthropic
falls back to prompt-based schema instructions.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class StructuredTemplate:
    id: str
    name: str
    description: str
    schema: dict = field(repr=False)


TEMPLATES: list[StructuredTemplate] = [
    StructuredTemplate(
        id="component-analysis",
        name="Component Analysis",
        description="Structured breakdown of a UI component",
        schema={
            "type": "object",
            "properties": {
                "component_name": {"type": "string"},
                "description": {"type": "string"},
                "props": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "type": {"type": "string"},
                            "required": {"type": "boolean"},
                            "description": {"type": "string"},
                        },
                        "required": ["name", "type", "required", "description"],
                        "additionalProperties": False,
                    },
                },
                "usage_examples": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "related_components": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": [
                "component_name",
                "description",
                "props",
                "usage_examples",
                "related_components",
            ],
            "additionalProperties": False,
        },
    ),
    StructuredTemplate(
        id="code-review",
        name="Code Review",
        description="Code review with issues, severity, and suggestions",
        schema={
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "issues": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "severity": {
                                "type": "string",
                                "enum": ["critical", "warning", "info"],
                            },
                            "description": {"type": "string"},
                            "location": {"type": "string"},
                            "suggestion": {"type": "string"},
                        },
                        "required": ["severity", "description", "location", "suggestion"],
                        "additionalProperties": False,
                    },
                },
                "overall_quality": {
                    "type": "string",
                    "enum": ["excellent", "good", "acceptable", "needs_improvement", "poor"],
                },
            },
            "required": ["summary", "issues", "overall_quality"],
            "additionalProperties": False,
        },
    ),
    StructuredTemplate(
        id="api-documentation",
        name="API Documentation",
        description="Structured API endpoint documentation",
        schema={
            "type": "object",
            "properties": {
                "endpoint": {"type": "string"},
                "method": {"type": "string"},
                "description": {"type": "string"},
                "parameters": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "type": {"type": "string"},
                            "required": {"type": "boolean"},
                            "description": {"type": "string"},
                        },
                        "required": ["name", "type", "required", "description"],
                        "additionalProperties": False,
                    },
                },
                "response_schema": {"type": "object"},
                "examples": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": [
                "endpoint",
                "method",
                "description",
                "parameters",
                "response_schema",
                "examples",
            ],
            "additionalProperties": False,
        },
    ),
    StructuredTemplate(
        id="comparison-table",
        name="Comparison Table",
        description="Side-by-side comparison with pros, cons, and recommendation",
        schema={
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "description": {"type": "string"},
                            "pros": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "cons": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                        "required": ["name", "description", "pros", "cons"],
                        "additionalProperties": False,
                    },
                },
                "recommendation": {"type": "string"},
            },
            "required": ["items", "recommendation"],
            "additionalProperties": False,
        },
    ),
    StructuredTemplate(
        id="step-by-step-guide",
        name="Step-by-step Guide",
        description="Ordered instructions with prerequisites and code examples",
        schema={
            "type": "object",
            "properties": {
                "title": {"type": "string"},
                "prerequisites": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "steps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "step_number": {"type": "integer"},
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "code_example": {"type": "string"},
                        },
                        "required": ["step_number", "title", "description", "code_example"],
                        "additionalProperties": False,
                    },
                },
            },
            "required": ["title", "prerequisites", "steps"],
            "additionalProperties": False,
        },
    ),
    StructuredTemplate(
        id="react17-component",
        name="React 17 Component",
        description="React 17 component output with breakdown analysis and generated code",
        schema={
            "type": "object",
            "properties": {
                "component_name": {"type": "string"},
                "description": {"type": "string"},
                "analysis": {
                    "type": "object",
                    "properties": {
                        "purpose": {"type": "string"},
                        "state_management": {"type": "string"},
                        "lifecycle_methods": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "props_interface": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "type": {"type": "string"},
                                    "required": {"type": "boolean"},
                                    "description": {"type": "string"},
                                },
                                "required": ["name", "type", "required", "description"],
                                "additionalProperties": False,
                            },
                        },
                        "dependencies": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "accessibility_notes": {"type": "string"},
                    },
                    "required": [
                        "purpose",
                        "state_management",
                        "lifecycle_methods",
                        "props_interface",
                        "dependencies",
                        "accessibility_notes",
                    ],
                    "additionalProperties": False,
                },
                "dependencies": {
                    "type": "object",
                    "properties": {
                        "packages": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "version": {"type": "string"},
                                    "reason": {"type": "string"},
                                },
                                "required": ["name", "version", "reason"],
                                "additionalProperties": False,
                            },
                        },
                        "peer_dependencies": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "version": {"type": "string"},
                                },
                                "required": ["name", "version"],
                                "additionalProperties": False,
                            },
                        },
                        "internal_imports": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "module": {"type": "string"},
                                    "imports": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                    },
                                },
                                "required": ["module", "imports"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": ["packages", "peer_dependencies", "internal_imports"],
                    "additionalProperties": False,
                },
                "generated_code": {"type": "string"},
                "usage_example": {"type": "string"},
                "notes": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": [
                "component_name",
                "description",
                "analysis",
                "dependencies",
                "generated_code",
                "usage_example",
                "notes",
            ],
            "additionalProperties": False,
        },
    ),
]

TEMPLATES_BY_ID: dict[str, StructuredTemplate] = {t.id: t for t in TEMPLATES}
