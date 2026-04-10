import enum


class SpecifierKind(enum.StrEnum):
    DEFAULT = "default"
    NAMED = "named"
    NAMESPACE = "namespace"
    SIDE_EFFECT = "side-effect"
    EXPORT_DEFAULT = "export-default"
    EXPORT_NAMED = "export-named"
    EXPORT_ALL = "export-all"
    EXPORT_NAMESPACE = "export-namespace"


def format_named(name: str, alias: str | None = None) -> str:
    if alias and alias != name:
        return f"named: {name} as {alias}"
    return f"named: {name}"


def format_namespace(name: str, alias: str | None = None) -> str:
    if alias and alias != name:
        return f"namespace: {name} as {alias}"
    return f"namespace: {name}"


def format_export_named(name: str, alias: str | None = None) -> str:
    if alias and alias != name:
        return f"export-named: {name} as {alias}"
    return f"export-named: {name}"
