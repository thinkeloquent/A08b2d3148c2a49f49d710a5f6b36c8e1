"""Setup configuration for openapi-splitter."""

from setuptools import setup, find_packages
from pathlib import Path

# Read the current directory
this_directory = Path(__file__).parent

# Read long description from README if it exists
readme_path = this_directory / "README.md"
long_description = ""
if readme_path.exists():
    long_description = readme_path.read_text(encoding='utf-8')

# Read version from package
version_file = this_directory / "openapi_splitter" / "__init__.py"
version = "1.0.0"  # Default version
if version_file.exists():
    with open(version_file, 'r') as f:
        for line in f:
            if line.startswith('__version__'):
                version = line.split('"')[1]
                break

setup(
    name="openapi-splitter",
    version=version,
    author="OpenAPI Splitter Contributors",
    author_email="support@example.com",
    description="Split large OpenAPI specifications into smaller, manageable files",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/openapi-splitter",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Software Development :: Code Generators",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pyyaml>=6.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0",
            "pytest-cov>=4.0",
            "black>=22.0",
            "flake8>=5.0",
            "mypy>=0.990",
            "pre-commit>=2.20",
        ],
    },
    entry_points={
        "console_scripts": [
            "openapi-splitter=openapi_splitter.cli:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="openapi swagger api specification split cli sdk yaml json",
)