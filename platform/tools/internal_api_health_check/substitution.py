"""Path parameter substitution for :paramName variables."""

from __future__ import annotations

import re

_PARAM_RE = re.compile(r":([A-Za-z_][A-Za-z0-9_]*)")


def substitute(path: str, variables: dict[str, str]) -> str:
    """Replace :paramName placeholders in *path* with values from *variables*.

    The regex correctly handles the ``compare/:base...:head`` pattern because
    each ``:name`` is matched individually.

    Raises ``ValueError`` if any placeholder has no matching variable.
    """
    unresolved: list[str] = []

    def _replace(match: re.Match) -> str:
        name = match.group(1)
        if name in variables:
            return variables[name]
        unresolved.append(name)
        return match.group(0)

    result = _PARAM_RE.sub(_replace, path)

    if unresolved:
        raise ValueError(
            f"Unresolved path variables: {', '.join(unresolved)}. "
            f"Available: {', '.join(sorted(variables)) or '(none)'}"
        )
    return result
