from setuptools import setup, find_packages

setup(
    name="extract-code-from-markdown",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # No external dependencies for now, keeping it lightweight
        # "tqdm", # Uncomment if progress bar is needed later
    ],
    entry_points={
        "console_scripts": [
            "extract-code=extract_code.cli:main",
        ],
    },
    python_requires=">=3.8",
)
