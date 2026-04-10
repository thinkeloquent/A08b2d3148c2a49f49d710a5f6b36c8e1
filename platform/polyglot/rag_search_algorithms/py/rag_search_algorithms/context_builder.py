"""Context builder for LLM prompts."""


def build_context(docs: list) -> str:
    """Build a formatted context string from search result documents.

    Args:
        docs: List of document objects with .metadata and .page_content attributes.

    Returns:
        Formatted context string with source headers and content.
    """
    context_parts = []
    for i, doc in enumerate(docs, 1):
        parts = []
        meta = doc.metadata
        if "component" in meta:
            parts.append(f"component={meta['component']}")
        if "file_name" in meta:
            parts.append(meta["file_name"])
        header = " | ".join(parts)
        context_parts.append(f"--- Source {i}: {header} ---\n{doc.page_content}")
    return "\n\n".join(context_parts)
