"""Setup configuration for file-compare-diff-snapshot."""

from setuptools import setup, find_packages
from pathlib import Path

this_directory = Path(__file__).parent

version = "1.0.0"
version_file = this_directory / "file_compare_diff_snapshot" / "__init__.py"
if version_file.exists():
    with open(version_file, "r") as f:
        for line in f:
            if line.startswith("__version__"):
                version = line.split('"')[1]
                break

setup(
    name="file-compare-diff-snapshot",
    version=version,
    description="Compare files between directories, hash diffs, and verify snapshot stability",
    packages=find_packages(),
    python_requires=">=3.8",
    extras_require={
        "dev": [
            "pytest>=7.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "file-compare-diff-snapshot=file_compare_diff_snapshot.cli:main",
        ],
    },
    zip_safe=False,
)
