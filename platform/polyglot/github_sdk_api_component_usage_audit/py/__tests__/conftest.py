"""Test configuration — add polyglot dependencies to sys.path."""

import sys
from pathlib import Path

# __file__ = .../polyglot/github_sdk_api_component_usage_audit/py/__tests__/conftest.py
# Navigate up to the polyglot/ directory, then reference sibling modules.
_polyglot = Path(__file__).parent.parent.parent.parent  # polyglot/
_github_api_path = _polyglot / "github_api" / "py"
_packages_py_path = _polyglot.parent / "packages_py"

for _p in (_github_api_path, _packages_py_path):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))
