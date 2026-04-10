"""
Command-line interface for Confluence Data Center REST API operations.

Provides quick access to Confluence content, spaces, search, and server
information from the terminal. Uses the SDK client to communicate with
the REST proxy server.

Usage:
    confluence-api health
    confluence-api get-content 12345 --expand body.storage
    confluence-api search 'type = "page" AND space = "DEV"' --limit 10
    confluence-api get-spaces --limit 50
    confluence-api server-info
"""

from __future__ import annotations

import json
import sys
from typing import Optional

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

from confluence_api.config import load_config_from_env
from confluence_api.core.client import ConfluenceClient
from confluence_api.exceptions import ConfluenceAPIError
from confluence_api.logger import create_logger
from confluence_api.services.content_service import ContentService
from confluence_api.services.search_service import SearchService

log = create_logger("confluence-api", __file__)
app = typer.Typer(name="confluence-api", help="Confluence Data Center REST API CLI")
console = Console()


def _get_client() -> ConfluenceClient:
    """Resolve credentials and create a ConfluenceClient."""
    cfg = load_config_from_env()
    base_url = cfg.get("base_url")
    username = cfg.get("username")
    api_token = cfg.get("api_token")

    if not base_url or not username or not api_token:
        rprint("[red]Error: Confluence configuration not found.[/red]")
        rprint("Set CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN environment variables.")
        raise typer.Exit(1)

    return ConfluenceClient(base_url=base_url, username=username, api_token=api_token)


@app.command()
def health() -> None:
    """Check connectivity to the Confluence server."""
    try:
        with _get_client() as client:
            info = client.get("server-information")
        rprint("[green]Connected to Confluence[/green]")
        rprint(f"  Base URL: {info.get('baseUrl', 'N/A')}")
        rprint(f"  Version:  {info.get('version', 'N/A')}")
        rprint(f"  Title:    {info.get('title', 'N/A')}")
    except ConfluenceAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command("get-content")
def get_content(
    content_id: str = typer.Argument(..., help="Content ID to retrieve"),
    expand: str | None = typer.Option(None, "--expand", "-e", help="Comma-separated fields to expand"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Retrieve a piece of content by ID."""
    try:
        with _get_client() as client:
            svc = ContentService(client)
            result = svc.get_content(content_id, expand=expand)

        if json_output:
            print(json.dumps(result, indent=2))
        else:
            table = Table(title=f"Content: {content_id}")
            table.add_column("Field", style="cyan")
            table.add_column("Value")
            table.add_row("ID", result.get("id", "N/A"))
            table.add_row("Title", result.get("title", "N/A"))
            table.add_row("Type", result.get("type", "N/A"))
            table.add_row("Status", result.get("status", "N/A"))
            space = result.get("space", {})
            table.add_row("Space", f"{space.get('name', 'N/A')} ({space.get('key', 'N/A')})")
            version = result.get("version", {})
            table.add_row("Version", str(version.get("number", "N/A")))
            console.print(table)
    except ConfluenceAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def search(
    cql: str = typer.Argument(..., help="CQL query string"),
    limit: int = typer.Option(25, "--limit", "-l", help="Maximum results"),
    start: int = typer.Option(0, "--start", "-s", help="Start index"),
    expand: str | None = typer.Option(None, "--expand", "-e", help="Fields to expand"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Search Confluence content using CQL."""
    try:
        with _get_client() as client:
            svc = SearchService(client)
            result = svc.search(cql=cql, expand=expand, start=start, limit=limit)

        if json_output:
            print(json.dumps(result, indent=2))
        else:
            results_list = result.get("results", [])
            if not results_list:
                rprint(f"[yellow]No results found for: {cql}[/yellow]")
                return

            table = Table(title=f"Search results for: {cql}")
            table.add_column("Title", style="green")
            table.add_column("Type", style="cyan")
            table.add_column("Space", style="yellow")
            table.add_column("URL", style="blue")

            for item in results_list:
                content = item.get("content", item)
                title = content.get("title", "N/A")
                content_type = content.get("type", "N/A")
                space = content.get("space", {})
                space_key = space.get("key", "N/A") if isinstance(space, dict) else "N/A"
                url = item.get("url", content.get("_links", {}).get("webui", "N/A"))
                table.add_row(title, content_type, space_key, str(url))

            console.print(table)
            total = result.get("totalSize", result.get("size", len(results_list)))
            rprint(f"\nShowing {len(results_list)} of {total} results")
    except ConfluenceAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command("get-spaces")
def get_spaces(
    limit: int = typer.Option(25, "--limit", "-l", help="Maximum results"),
    start: int = typer.Option(0, "--start", "-s", help="Start index"),
    type: str | None = typer.Option(None, "--type", "-t", help="Space type filter (global, personal)"),
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """List Confluence spaces."""
    try:
        with _get_client() as client:
            params = {"start": start, "limit": limit}
            if type is not None:
                params["type"] = type
            result = client.get("space", params=params)

        if json_output:
            print(json.dumps(result, indent=2))
        else:
            spaces = result.get("results", [])
            if not spaces:
                rprint("[yellow]No spaces found[/yellow]")
                return

            table = Table(title="Confluence Spaces")
            table.add_column("Key", style="cyan")
            table.add_column("Name", style="green")
            table.add_column("Type", style="yellow")
            table.add_column("Status", style="blue")

            for space in spaces:
                table.add_row(
                    space.get("key", "N/A"),
                    space.get("name", "N/A"),
                    space.get("type", "N/A"),
                    space.get("status", "N/A"),
                )

            console.print(table)
            total = result.get("totalSize", result.get("size", len(spaces)))
            rprint(f"\nShowing {len(spaces)} of {total} spaces")
    except ConfluenceAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@app.command("server-info")
def server_info(
    json_output: bool = typer.Option(False, "--json", help="Output raw JSON"),
) -> None:
    """Display Confluence server information."""
    try:
        with _get_client() as client:
            info = client.get("server-information")

        if json_output:
            print(json.dumps(info, indent=2))
        else:
            table = Table(title="Confluence Server Information")
            table.add_column("Field", style="cyan")
            table.add_column("Value")
            table.add_row("Base URL", info.get("baseUrl", "N/A"))
            table.add_row("Title", info.get("title", "N/A"))
            table.add_row("Version", info.get("version", "N/A"))
            table.add_row("Build Number", str(info.get("buildNumber", "N/A")))
            table.add_row("Build Date", info.get("buildDate", "N/A"))
            console.print(table)
    except ConfluenceAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


def main() -> None:
    """Entry point for the CLI."""
    app()


if __name__ == "__main__":
    main()
