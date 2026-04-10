"""Command-line interface for JIRA API operations."""

from __future__ import annotations

from typing import Optional

import typer
from rich import print as rprint
from rich.console import Console
from rich.table import Table

from jira_api.config import JiraConfig, get_config, save_config
from jira_api.core.client import JiraClient
from jira_api.exceptions import JiraAPIError
from jira_api.logger import create_logger
from jira_api.services.issue_service import IssueService
from jira_api.services.project_service import ProjectService
from jira_api.services.user_service import UserService

log = create_logger("jira-api", __file__)
app = typer.Typer(help="JIRA API Command Line Interface")
console = Console()

issue_app = typer.Typer(help="Issue operations")
user_app = typer.Typer(help="User operations")
project_app = typer.Typer(help="Project operations")
app.add_typer(issue_app, name="issue")
app.add_typer(user_app, name="user")
app.add_typer(project_app, name="project")


def get_client() -> JiraClient:
    config = get_config()
    if not config:
        rprint("[red]Error: JIRA configuration not found.[/red]")
        rprint("Run 'jira-api configure' to set up your credentials.")
        raise typer.Exit(1)
    return JiraClient(
        base_url=config.base_url,
        email=config.email,
        api_token=config.api_token,
    )


@app.command()
def configure() -> None:
    """Configure JIRA API credentials interactively."""
    from rich.prompt import Prompt

    rprint("[bold]JIRA API Configuration[/bold]")
    base_url = Prompt.ask("JIRA base URL (e.g., https://company.atlassian.net)")
    email = Prompt.ask("Your email address")
    api_token = Prompt.ask("API token", password=True)

    config = JiraConfig(base_url=base_url, email=email, api_token=api_token)
    save_config(config)
    rprint("[green]Configuration saved successfully![/green]")


@app.command()
def server(
    host: str = typer.Option("0.0.0.0", "--host"),
    port: int = typer.Option(8000, "--port"),
    reload: bool = typer.Option(False, "--reload"),
) -> None:
    """Start the FastAPI server."""
    import uvicorn

    from jira_api.server import app as fastapi_app

    rprint(f"[green]Starting JIRA API server on {host}:{port}[/green]")
    uvicorn.run(fastapi_app, host=host, port=port, reload=reload)


# ── Issue Commands ───────────────────────────────────────────────────────


@issue_app.command("get")
def get_issue(
    key: str = typer.Argument(..., help="Issue key (e.g., PROJ-123)"),
    json_output: bool = typer.Option(False, "--json"),
) -> None:
    """Get details of an issue."""
    try:
        with get_client() as client:
            issue = IssueService(client).get_issue(key)
        if json_output:
            print(issue.model_dump_json(indent=2))
        else:
            _display_issue(issue)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@issue_app.command("create")
def create_issue(
    project: str = typer.Option(..., "--project", "-p"),
    summary: str = typer.Option(..., "--summary", "-s"),
    issue_type: str = typer.Option(..., "--type", "-t"),
    description: str | None = typer.Option(None, "--description", "-d"),
    assignee: str | None = typer.Option(None, "--assignee", "-a"),
    labels: str | None = typer.Option(None, "--labels", "-l"),
) -> None:
    """Create a new issue."""
    try:
        with get_client() as client:
            svc = IssueService(client)
            project_obj = ProjectService(client).get_project(project)
            label_list = [l.strip() for l in labels.split(",")] if labels else []
            issue = svc.create_issue(
                project_id=project_obj.id,
                summary=summary,
                issue_type_id=issue_type,
                description=description,
                assignee_email=assignee,
                labels=label_list,
            )
        rprint(f"[green]Issue created: {issue.key}[/green]")
        _display_issue(issue)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@issue_app.command("update")
def update_issue(
    key: str = typer.Argument(...),
    summary: str | None = typer.Option(None, "--summary", "-s"),
    add_labels: str | None = typer.Option(None, "--add-labels"),
    remove_labels: str | None = typer.Option(None, "--remove-labels"),
) -> None:
    """Update an existing issue."""
    if not any([summary, add_labels, remove_labels]):
        rprint("[red]Error: At least one update option must be provided[/red]")
        raise typer.Exit(1)
    try:
        with get_client() as client:
            svc = IssueService(client)
            if summary:
                svc.update_issue_summary(key, summary)
                rprint(f"[green]Updated summary for {key}[/green]")
            if add_labels:
                labels = [l.strip() for l in add_labels.split(",")]
                svc.add_labels_to_issue(key, labels)
                rprint(f"[green]Added labels to {key}[/green]")
            if remove_labels:
                labels = [l.strip() for l in remove_labels.split(",")]
                svc.remove_labels_from_issue(key, labels)
                rprint(f"[green]Removed labels from {key}[/green]")
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@issue_app.command("assign")
def assign_issue(
    key: str = typer.Argument(...),
    email: str = typer.Argument(...),
) -> None:
    """Assign an issue to a user."""
    try:
        with get_client() as client:
            IssueService(client).assign_issue_by_email(key, email)
        rprint(f"[green]Assigned {key} to {email}[/green]")
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@issue_app.command("transitions")
def get_transitions(key: str = typer.Argument(...)) -> None:
    """List available transitions."""
    try:
        with get_client() as client:
            transitions = IssueService(client).get_available_transitions(key)
        if not transitions:
            rprint(f"[yellow]No transitions available for {key}[/yellow]")
            return
        table = Table(title=f"Transitions for {key}")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("To Status", style="yellow")
        for t in transitions:
            table.add_row(t.id, t.name, t.to.name)
        console.print(table)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@issue_app.command("transition")
def transition_issue(
    key: str = typer.Argument(...),
    name: str = typer.Argument(...),
    comment: str | None = typer.Option(None, "--comment", "-c"),
    resolution: str | None = typer.Option(None, "--resolution", "-r"),
) -> None:
    """Transition an issue."""
    try:
        with get_client() as client:
            IssueService(client).transition_issue_by_name(key, name, comment, resolution)
        rprint(f"[green]Transitioned {key} using '{name}'[/green]")
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


# ── User Commands ────────────────────────────────────────────────────────


@user_app.command("search")
def search_users(
    query: str = typer.Argument(...),
    max_results: int = typer.Option(50, "--max", "-m"),
) -> None:
    """Search for users."""
    try:
        with get_client() as client:
            users = UserService(client).search_users(query, max_results)
        if not users:
            rprint(f"[yellow]No users found matching '{query}'[/yellow]")
            return
        table = Table(title=f"Users matching '{query}'")
        table.add_column("Display Name", style="green")
        table.add_column("Email", style="cyan")
        table.add_column("Account ID", style="yellow")
        for u in users:
            table.add_row(u.display_name, u.email_address or "N/A", u.account_id)
        console.print(table)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@user_app.command("get")
def get_user(identifier: str = typer.Argument(...)) -> None:
    """Get a user by account ID or email."""
    try:
        with get_client() as client:
            user = UserService(client).get_user_by_identifier(identifier)
        if not user:
            rprint(f"[yellow]User '{identifier}' not found[/yellow]")
            return
        table = Table(title=f"User: {identifier}")
        table.add_column("Field", style="cyan")
        table.add_column("Value")
        table.add_row("Display Name", user.display_name)
        table.add_row("Email", user.email_address or "N/A")
        table.add_row("Account ID", user.account_id)
        table.add_row("Active", "Yes" if user.active else "No")
        console.print(table)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


# ── Project Commands ─────────────────────────────────────────────────────


@project_app.command("get")
def get_project(
    key: str = typer.Argument(...),
    versions: bool = typer.Option(False, "--versions"),
) -> None:
    """Get project details."""
    try:
        with get_client() as client:
            project = ProjectService(client).get_project(key)
        table = Table(title=f"Project: {key}")
        table.add_column("Field", style="cyan")
        table.add_column("Value")
        table.add_row("Key", project.key)
        table.add_row("Name", project.name)
        table.add_row("ID", project.id)
        if project.description:
            table.add_row("Description", project.description)
        console.print(table)

        if versions:
            with get_client() as client:
                pvs = ProjectService(client).get_project_versions(key)
            if pvs:
                vt = Table(title=f"Versions for {key}")
                vt.add_column("Name", style="green")
                vt.add_column("Released", style="cyan")
                vt.add_column("Description")
                for v in pvs:
                    vt.add_row(v.name, "Yes" if v.released else "No", v.description or "")
                console.print(vt)
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


@project_app.command("create-version")
def create_version(
    project_key: str = typer.Argument(...),
    name: str = typer.Argument(...),
    description: str | None = typer.Option(None, "--description", "-d"),
) -> None:
    """Create a new version."""
    try:
        with get_client() as client:
            ProjectService(client).create_version(project_key, name, description)
        rprint(f"[green]Version '{name}' created for project {project_key}[/green]")
    except JiraAPIError as e:
        rprint(f"[red]Error: {e}[/red]")
        raise typer.Exit(1)


# ── Helpers ──────────────────────────────────────────────────────────────


def _display_issue(issue) -> None:
    table = Table(title=f"Issue: {issue.key}")
    table.add_column("Field", style="cyan")
    table.add_column("Value")
    table.add_row("Key", issue.key)
    table.add_row("Summary", issue.fields.summary)
    table.add_row("Status", issue.fields.status.name)
    table.add_row("Type", issue.fields.issue_type.name)
    table.add_row("Project", f"{issue.fields.project.name} ({issue.fields.project.key})")
    table.add_row("Assignee", issue.fields.assignee.display_name if issue.fields.assignee else "Unassigned")
    if issue.fields.labels:
        table.add_row("Labels", ", ".join(issue.fields.labels))
    console.print(table)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
