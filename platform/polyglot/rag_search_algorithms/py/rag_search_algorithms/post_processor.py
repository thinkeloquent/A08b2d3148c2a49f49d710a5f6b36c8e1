"""Post-processing pipeline for search results."""

from typing import Optional

from .code_text_separator import separate_code_text_regex
from .component_detector import detect_components_metadata, detect_components_parse


def post_process_results(
    results: list,
    code_mode: str = "regex",
    component_mode: str = "metadata",
    import_packages: Optional[list[str]] = None,
) -> dict:
    """Post-process hybrid search results: code/text separation + component detection.

    Args:
        results: List of (document, score) tuples.
        code_mode: Code separation mode ("regex" for heuristic separation).
        component_mode: Component detection mode ("metadata" or "parse").
        import_packages: Package names for import pattern matching.

    Returns:
        Dict with "components" (list[str]) and "results" (list[dict]).
    """
    components = (
        detect_components_parse(results, import_packages=import_packages)
        if component_mode == "parse"
        else detect_components_metadata(results)
    )

    truncated_contents = [doc.page_content[:500] for doc, _score in results]
    file_names = [doc.metadata.get("file_name", "") for doc, _score in results]

    separations = [
        separate_code_text_regex(c, fn)
        for c, fn in zip(truncated_contents, file_names)
    ]

    processed = []
    for i, (doc, score) in enumerate(results):
        sep = separations[i] if i < len(separations) else {"code_parts": [], "text_parts": []}
        processed.append({
            "content": truncated_contents[i],
            "code_parts": sep["code_parts"],
            "text_parts": sep["text_parts"],
            "metadata": doc.metadata,
            "score": score,
        })

    return {"components": components, "results": processed}
