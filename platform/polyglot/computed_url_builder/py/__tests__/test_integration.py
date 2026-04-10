"""
Integration tests for realistic usage scenarios.
"""

import pytest

from computed_url_builder import create_null_logger, create_url_builder


class TestIntegration:
    """Integration tests for realistic API scenarios."""

    def test_realistic_api_scenario(self, null_logger):
        """Should work in realistic API scenario."""
        api = create_url_builder(
            {
                "dev": "https://dev.api.example.com",
                "staging": "https://staging.api.example.com",
                "prod": "https://api.example.com",
            },
            "/api/v1",
            logger=null_logger,
        )

        dev_url = api.build("dev")
        staging_url = api.build("staging")
        prod_url = api.build("prod")

        assert dev_url == "https://dev.api.example.com/api/v1"
        assert staging_url == "https://staging.api.example.com/api/v1"
        assert prod_url == "https://api.example.com/api/v1"

    def test_array_based_urls(self, null_logger):
        """Should work with array-based URLs."""
        api = create_url_builder(
            {"custom": ["https://custom.api.example.com", "/special/v2/endpoint"]},
            logger=null_logger,
        )

        url = api.build("custom")

        assert url == "https://custom.api.example.com/special/v2/endpoint"

    def test_complete_workflow(self, null_logger):
        """Should support complete workflow: build URL, serialize."""
        api = create_url_builder(
            {
                "dev": "https://dev.api.example.com",
                "prod": "https://api.example.com",
            },
            "/api/v1",
            logger=null_logger,
        )

        # Build URL
        url = api.build("dev")
        assert url == "https://dev.api.example.com/api/v1"

        # Add endpoint
        full_url = url + "/users"
        assert full_url == "https://dev.api.example.com/api/v1/users"

        # Serialize for debugging
        state = api.to_dict()
        assert "env" in state
        assert "base_path" in state

    def test_environment_switching(self, null_logger):
        """Should support switching between environments."""
        api = create_url_builder(
            {
                "dev": "https://dev.api.example.com",
                "staging": "https://staging.api.example.com",
                "prod": "https://api.example.com",
            },
            "/api/v1",
            logger=null_logger,
        )

        # Simulate environment switching
        environments = ["dev", "staging", "prod"]
        expected_hosts = [
            "https://dev.api.example.com",
            "https://staging.api.example.com",
            "https://api.example.com",
        ]

        for env, expected_host in zip(environments, expected_hosts, strict=False):
            url = api.build(env)
            assert url == f"{expected_host}/api/v1"
