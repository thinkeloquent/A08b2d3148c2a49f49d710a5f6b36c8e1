"""
Component Usage Audit Service

Async orchestrator that executes the full pipeline:
  search -> validate -> fetch -> extract -> report
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

from github_api.sdk.client import GitHubClient

from github_sdk_api_component_usage_audit.analysis.jsx_extractor import extract_jsx_usages
from github_sdk_api_component_usage_audit.config import Config
from github_sdk_api_component_usage_audit.sdk.code_search import search_code
from github_sdk_api_component_usage_audit.sdk.raw_content import fetch_raw_content
from github_sdk_api_component_usage_audit.sdk.repo_meta import fetch_repo_meta

__all__ = ["ComponentUsageAudit"]

logger = logging.getLogger("github_sdk_api_component_usage_audit.services")


class ComponentUsageAudit:
    """Async orchestrator for the component usage audit pipeline."""

    def __init__(self, config: Config) -> None:
        self.config = config
        self.usages: list[dict[str, str]] = []
        self.errors: list[dict[str, Any]] = []
        self._repo_cache: dict[str, dict[str, Any]] = {}
        self.stats = {
            "total_search_results": 0,
            "repos_validated": 0,
            "repos_skipped": 0,
            "files_processed": 0,
            "cancelled": False,
        }

    async def run(self, client: GitHubClient) -> dict[str, Any]:
        """Execute the full audit pipeline.

        Args:
            client: Authenticated GitHubClient instance.

        Returns:
            Report dict with metadata, summary, and usages.
        """
        logger.info(
            "Starting audit for component=%s min_stars=%d max_pages=%d",
            self.config.component_name,
            self.config.min_stars,
            self.config.max_pages,
        )

        await self._process_search_results(client)
        report = self._build_report()

        # Write output file
        output_dir = Path(self.config.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        filename = self.config.filename or f"component-audit-{self.config.component_name}"
        output_path = output_dir / f"{filename}.json"
        output_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        logger.info("Report saved: %s", output_path)

        return report

    async def _process_search_results(self, client: GitHubClient) -> None:
        """Search, validate, fetch, and extract."""
        async for item in search_code(
            client,
            component_name=self.config.component_name,
            max_pages=self.config.max_pages,
            min_file_size=self.config.min_file_size,
        ):
            self.stats["total_search_results"] += 1

            repository = item.get("repository", {})
            owner = repository.get("owner", {}).get("login", "")
            repo = repository.get("name", "")
            file_path = item.get("path", "")

            if not owner or not repo:
                logger.warning("Skipping result with missing owner/repo")
                continue

            # Two-tier validation
            try:
                meta = await fetch_repo_meta(
                    client,
                    owner=owner,
                    repo=repo,
                    min_stars=self.config.min_stars,
                    cache=self._repo_cache,
                )
                if not meta["valid"]:
                    self.stats["repos_skipped"] += 1
                    logger.debug(
                        "Skipped %s/%s (stars=%d, archived=%s)",
                        owner,
                        repo,
                        meta["repo"].get("stargazers_count", 0),
                        meta["repo"].get("archived"),
                    )
                    continue
                self.stats["repos_validated"] += 1
            except Exception as err:
                logger.warning("Failed to validate %s/%s: %s", owner, repo, err)
                self.errors.append({"type": "repo-meta", "owner": owner, "repo": repo, "error": str(err)})
                continue

            # Fetch raw content
            try:
                content = await fetch_raw_content(client, owner=owner, repo=repo, path=file_path)
                self.stats["files_processed"] += 1
            except Exception as err:
                logger.warning("Failed to fetch %s/%s/%s: %s", owner, repo, file_path, err)
                self.errors.append({"type": "raw-content", "owner": owner, "repo": repo, "path": file_path, "error": str(err)})
                continue

            # Extract JSX usages
            snippets = extract_jsx_usages(content, self.config.component_name)
            for snippet in snippets:
                self.usages.append({
                    "repository_name": f"{owner}/{repo}",
                    "file_path": file_path,
                    "code_snippet": snippet,
                })

            if snippets:
                logger.info("Found %d usage(s) in %s/%s/%s", len(snippets), owner, repo, file_path)

    def _build_report(self) -> dict[str, Any]:
        """Construct the final report object."""
        return {
            "metadata": {
                "tool": "github-component-usage-audit",
                "version": "1.0",
                "component_name": self.config.component_name,
            },
            "summary": {
                "total_usages_found": len(self.usages),
                "total_search_results": self.stats["total_search_results"],
                "repos_validated": self.stats["repos_validated"],
                "repos_skipped": self.stats["repos_skipped"],
                "files_processed": self.stats["files_processed"],
                "cancelled": self.stats["cancelled"],
            },
            "usages": self.usages,
        }
