"""Basic usage example for extract_imports_text_based_notation."""

from extract_imports_text_based_notation import extract_exports, extract_imports

# -------------------------------------------------------------------------
# Extract imports
# -------------------------------------------------------------------------

source_with_imports = """\
import os
import sys as system
from pathlib import Path, PurePath
from collections import defaultdict as dd
from . import sibling
from os import *
"""

print("=== Imports ===")
for module, specifiers in extract_imports(source_with_imports):
    print(f"  {module}")
    for spec in specifiers:
        print(f"    - {spec}")

# -------------------------------------------------------------------------
# Extract exports
# -------------------------------------------------------------------------

source_with_exports = """\
__all__ = ['MyClass', 'helper']

class MyClass:
    pass

def helper():
    pass

def _internal():
    pass
"""

print("\n=== Exports (with __all__) ===")
for module, specifiers in extract_exports(source_with_exports):
    print(f"  {module}")
    for spec in specifiers:
        print(f"    - {spec}")

# -------------------------------------------------------------------------
# Exports without __all__ (top-level scan fallback)
# -------------------------------------------------------------------------

source_no_all = """\
CONSTANT = 42

def public_func():
    pass

class PublicClass:
    pass

def _private():
    pass
"""

print("\n=== Exports (top-level scan) ===")
for module, specifiers in extract_exports(source_no_all):
    print(f"  {module}")
    for spec in specifiers:
        print(f"    - {spec}")
