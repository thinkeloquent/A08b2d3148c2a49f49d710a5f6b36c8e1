"""
Pytest configuration and fixtures for computed-url-builder tests.
"""

import pytest

from computed_url_builder import create_null_logger, create_url_builder


@pytest.fixture
def null_logger():
    """Provide a null logger for silent tests."""
    return create_null_logger()


@pytest.fixture
def basic_builder(null_logger):
    """Provide a basic URL builder with dev/prod environments."""
    return create_url_builder(
        {
            "dev": "https://dev.api.example.com",
            "prod": "https://api.example.com",
        },
        "/v1/users",
        logger=null_logger,
    )


@pytest.fixture
def array_builder(null_logger):
    """Provide a URL builder with array-based URLs."""
    return create_url_builder(
        {
            "dev": ["https://dev.api.example.com", "/v2/special/endpoint"],
            "prod": ["https://api.example.com", "/v2/special/endpoint"],
        },
        logger=null_logger,
    )


@pytest.fixture
def mixed_builder(null_logger):
    """Provide a URL builder with mixed string and array URLs."""
    return create_url_builder(
        {
            "dev": "https://dev.api.example.com",
            "special": ["https://special.api.example.com", "/custom/path"],
        },
        "/v1",
        logger=null_logger,
    )


@pytest.fixture
def empty_builder(null_logger):
    """Provide an empty URL builder."""
    return create_url_builder(logger=null_logger)
