"""Structured output enforcement helpers."""

SCHEMA_LANGUAGE_LABELS = {
    "json_schema": "JSON Schema",
    "zod": "Zod",
    "typescript": "TypeScript types",
    "graphql": "GraphQL schema",
    "pydantic": "Pydantic model",
    "dataclass": "Python dataclass",
    "typeddict": "Python TypedDict",
}


def build_format_instructions(
    output_format: str,
    schema_language: str | None = None,
    schema_text: str | None = None,
) -> str:
    """Build format instruction text to append to a system prompt.

    Args:
        output_format: Desired output format ("markdown", "json", "yaml").
        schema_language: Schema language identifier (e.g. "json_schema", "zod").
        schema_text: Schema definition text.

    Returns:
        Instruction string to append to the system prompt. Empty string if
        output_format is "markdown" (no special instructions needed).
    """
    if output_format == "markdown":
        return ""

    if schema_language and schema_text:
        label = SCHEMA_LANGUAGE_LABELS.get(schema_language, schema_language)
        fmt_label = output_format.upper()
        return (
            f"\n\nYou MUST respond with valid {fmt_label} that conforms to the following "
            f"{label} definition:\n```\n{schema_text}\n```\n"
            f"Output ONLY the {fmt_label}, no markdown fences or commentary."
        )

    if output_format in ("json", "yaml"):
        return (
            f"\n\nYou MUST respond in {output_format.upper()} format. "
            f"Output ONLY valid {output_format.upper()}, no markdown fences or commentary."
        )

    return ""
