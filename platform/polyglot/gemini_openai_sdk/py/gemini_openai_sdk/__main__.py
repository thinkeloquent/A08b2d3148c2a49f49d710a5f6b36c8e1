"""
Main entry point for running as module.

Usage:
    python -m gemini_openai_sdk chat "Hello"
"""

import sys

from .cli import main

if __name__ == "__main__":
    sys.exit(main())
