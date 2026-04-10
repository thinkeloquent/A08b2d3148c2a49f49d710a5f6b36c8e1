"""Extract JSON from LLM responses."""

import json
import re


def extract_json(text: str) -> str:
    """Extract JSON from LLM response, stripping markdown fences if present.

    Args:
        text: Raw LLM response text that may contain JSON wrapped in markdown fences.

    Returns:
        Cleaned JSON string. Returns original text if no valid JSON found.
    """
    stripped = text.strip()
    # Remove markdown code fences
    if stripped.startswith("```"):
        lines = stripped.split("\n")
        # Drop first line (```json) and last line (```)
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines).strip()
    # Validate it's parseable JSON
    try:
        json.loads(stripped)
        return stripped
    except json.JSONDecodeError:
        # Try to find a JSON object in the text
        match = re.search(r'\{[\s\S]*\}', stripped)
        if match:
            try:
                json.loads(match.group())
                return match.group()
            except json.JSONDecodeError:
                pass
        return text
