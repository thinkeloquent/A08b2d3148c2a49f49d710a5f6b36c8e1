import ast

from .logger import create as create_logger
from .specifier import format_export_named, format_named, format_namespace

PACKAGE_NAME = "extract_imports_text_based_notation"


class ImportExtractor:
    def __init__(self, logger=None):
        self._logger = logger or create_logger(PACKAGE_NAME, "extractor.py")

    def extract_imports(self, code: str) -> list[tuple[str, list[str]]]:
        """Extract import statements from Python source code.

        Returns a list of (module, [specifier, ...]) tuples.

        Raises:
            SyntaxError: If the source code cannot be parsed.
        """
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            raise SyntaxError(str(e)) from e

        results: list[tuple[str, list[str]]] = []
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.Import):
                # import os -> ("os", ["namespace: os"])
                # import os as o -> ("os", ["namespace: os as o"])
                for alias in node.names:
                    spec = format_namespace(alias.name, alias.asname)
                    results.append((alias.name, [spec]))
            elif isinstance(node, ast.ImportFrom):
                # Build module name with relative dots
                dots = "." * (node.level or 0)
                module = dots + (node.module or "")
                if not module:
                    module = dots if dots else ""

                # from X import * -> ("X", ["namespace: *"])
                if node.names and node.names[0].name == "*":
                    results.append((module, ["namespace: *"]))
                else:
                    # from X import a, b -> ("X", ["named: a", "named: b"])
                    specs: list[str] = []
                    for alias in node.names:
                        specs.append(format_named(alias.name, alias.asname))
                    results.append((module, specs))

        return self.format(results)

    def extract_exports(self, code: str) -> list[tuple[str, list[str]]]:
        """Extract exported names from Python source code.

        If ``__all__`` is defined, only those names are reported.
        Otherwise all top-level public names are collected.

        Returns a list of (``"<self>"``, [specifier, ...]) tuples.

        Raises:
            SyntaxError: If the source code cannot be parsed.
        """
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            raise SyntaxError(str(e)) from e

        # Try __all__ first
        all_exports = self._extract_all_exports(tree)
        if all_exports is not None:
            return self.format(all_exports)

        # Fallback to top-level public names
        return self.format(self._extract_toplevel_exports(tree))

    def _extract_all_exports(self, tree: ast.Module) -> list[tuple[str, list[str]]] | None:
        """Detect ``__all__`` assignment and extract list elements."""
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "__all__":
                        if isinstance(node.value, ast.List | ast.Tuple):
                            specs: list[str] = []
                            for elt in node.value.elts:
                                if isinstance(elt, ast.Constant) and isinstance(elt.value, str):
                                    specs.append(format_export_named(elt.value))
                            return [("<self>", specs)]
        return None

    def _extract_toplevel_exports(self, tree: ast.Module) -> list[tuple[str, list[str]]]:
        """Detect top-level public names (fallback when no ``__all__``)."""
        specs: list[str] = []
        for node in ast.iter_child_nodes(tree):
            names: list[str] = []
            if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
                names = [node.name]
            elif isinstance(node, ast.ClassDef):
                names = [node.name]
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        names.append(target.id)
            elif isinstance(node, ast.AnnAssign):
                if isinstance(node.target, ast.Name):
                    names = [node.target.id]

            for name in names:
                if not name.startswith("_"):
                    specs.append(format_export_named(name))

        if not specs:
            return []
        return [("<self>", specs)]

    def format(self, results: list[tuple[str, list[str]]]) -> list[tuple[str, list[str]]]:
        """Identity format method. Override in subclass for custom output."""
        return results


def extract_imports(code: str) -> list[tuple[str, list[str]]]:
    """Convenience function to extract imports."""
    return ImportExtractor().extract_imports(code)


def extract_exports(code: str) -> list[tuple[str, list[str]]]:
    """Convenience function to extract exports."""
    return ImportExtractor().extract_exports(code)
