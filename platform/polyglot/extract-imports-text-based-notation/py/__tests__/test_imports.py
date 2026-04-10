import pytest

from extract_imports_text_based_notation.extractor import extract_imports

# ---------------------------------------------------------------------------
# Table-driven parametrized tests
# ---------------------------------------------------------------------------

IMPORT_CASES = [
    pytest.param(
        "import os",
        [("os", ["namespace: os"])],
        id="simple-import",
    ),
    pytest.param(
        "import os as o",
        [("os", ["namespace: os as o"])],
        id="import-with-alias",
    ),
    pytest.param(
        "from os import path",
        [("os", ["named: path"])],
        id="from-import-name",
    ),
    pytest.param(
        "from os import path as p",
        [("os", ["named: path as p"])],
        id="from-import-name-alias",
    ),
    pytest.param(
        "from os import *",
        [("os", ["namespace: *"])],
        id="from-import-star",
    ),
    pytest.param(
        "from . import sibling",
        [(".", ["named: sibling"])],
        id="relative-import-dot",
    ),
    pytest.param(
        "from ..pkg import mod",
        [("..pkg", ["named: mod"])],
        id="relative-import-dotdot",
    ),
    pytest.param(
        "import os, sys",
        [("os", ["namespace: os"]), ("sys", ["namespace: sys"])],
        id="multi-import",
    ),
    pytest.param(
        "from os import path, getcwd",
        [("os", ["named: path", "named: getcwd"])],
        id="from-import-multi-names",
    ),
]


@pytest.mark.parametrize("code, expected", IMPORT_CASES)
def test_extract_imports(code: str, expected: list[tuple[str, list[str]]]) -> None:
    result = extract_imports(code)
    assert result == expected


# ---------------------------------------------------------------------------
# Edge-case tests
# ---------------------------------------------------------------------------


def test_syntax_error_raises() -> None:
    with pytest.raises(SyntaxError):
        extract_imports("from import")


def test_multiple_statements() -> None:
    code = "import os\nfrom sys import argv\nimport json as j"
    result = extract_imports(code)
    assert result == [
        ("os", ["namespace: os"]),
        ("sys", ["named: argv"]),
        ("json", ["namespace: json as j"]),
    ]


def test_empty_source() -> None:
    result = extract_imports("")
    assert result == []


def test_no_imports() -> None:
    result = extract_imports("x = 1\nprint(x)")
    assert result == []
