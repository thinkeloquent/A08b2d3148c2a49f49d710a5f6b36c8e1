import pytest

from extract_imports_text_based_notation.extractor import extract_exports

# ---------------------------------------------------------------------------
# Table-driven parametrized tests
# ---------------------------------------------------------------------------

EXPORT_CASES = [
    pytest.param(
        "__all__ = ['foo', 'bar']",
        [("<self>", ["export-named: foo", "export-named: bar"])],
        id="dunder-all-list",
    ),
    pytest.param(
        "def hello(): pass",
        [("<self>", ["export-named: hello"])],
        id="toplevel-function",
    ),
    pytest.param(
        "class MyClass: pass",
        [("<self>", ["export-named: MyClass"])],
        id="toplevel-class",
    ),
    pytest.param(
        "MY_CONST = 42",
        [("<self>", ["export-named: MY_CONST"])],
        id="toplevel-constant",
    ),
    pytest.param(
        "async def process(): pass",
        [("<self>", ["export-named: process"])],
        id="async-function",
    ),
]


@pytest.mark.parametrize("code, expected", EXPORT_CASES)
def test_extract_exports(code: str, expected: list[tuple[str, list[str]]]) -> None:
    result = extract_exports(code)
    assert result == expected


# ---------------------------------------------------------------------------
# Edge-case tests
# ---------------------------------------------------------------------------


def test_private_names_excluded() -> None:
    code = "def _private(): pass\ndef public(): pass"
    result = extract_exports(code)
    assert result == [("<self>", ["export-named: public"])]


def test_dunder_all_takes_precedence() -> None:
    code = (
        "__all__ = ['exported']\n"
        "def exported(): pass\n"
        "def not_exported(): pass\n"
    )
    result = extract_exports(code)
    assert result == [("<self>", ["export-named: exported"])]


def test_empty_module_returns_empty() -> None:
    result = extract_exports("")
    assert result == []


def test_only_private_names_returns_empty() -> None:
    code = "def _a(): pass\n_b = 10\nclass _C: pass"
    result = extract_exports(code)
    assert result == []


def test_annotated_assignment() -> None:
    code = "count: int = 0"
    result = extract_exports(code)
    assert result == [("<self>", ["export-named: count"])]


def test_dunder_all_tuple() -> None:
    code = "__all__ = ('alpha', 'beta')"
    result = extract_exports(code)
    assert result == [("<self>", ["export-named: alpha", "export-named: beta"])]


def test_mixed_toplevel_exports() -> None:
    code = (
        "import os\n"
        "GREETING = 'hello'\n"
        "def greet(): pass\n"
        "class Greeter: pass\n"
        "_hidden = True\n"
    )
    result = extract_exports(code)
    assert result == [
        (
            "<self>",
            [
                "export-named: GREETING",
                "export-named: greet",
                "export-named: Greeter",
            ],
        )
    ]
