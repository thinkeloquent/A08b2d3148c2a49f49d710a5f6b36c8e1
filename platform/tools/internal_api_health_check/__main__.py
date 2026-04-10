"""Entry point: python -m tools.internal_api_health_check"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from .cli import build_parser, parse_vars
from .config_loader import load_config
from .reporter import format_json_stdout, print_console, print_dry_run, write_json, write_pass_fail_logs
from .runner import build_dry_run, run_suites


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    # Load config
    try:
        servers, suites, variables, prefix = load_config(
            config_dir=args.config_dir,
            suite_filter=args.suites,
        )
    except FileNotFoundError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2

    if not suites:
        print("No test suites found.", file=sys.stderr)
        return 2

    # Apply CLI variable overrides
    cli_vars = parse_vars(args.vars)
    variables.update(cli_vars)

    # Filter servers
    if args.servers:
        servers = [s for s in servers if s.name in args.servers]
        if not servers:
            print(f"No matching servers: {args.servers}", file=sys.stderr)
            return 2

    # Override base URL
    if args.base_url:
        for s in servers:
            s.base_url = args.base_url

    # Dry run
    if args.dry_run:
        entries = build_dry_run(servers, suites, variables, prefix)
        print_dry_run(entries)
        return 0

    # Run tests
    summary = asyncio.run(
        run_suites(
            servers=servers,
            suites=suites,
            variables=variables,
            prefix=prefix,
            concurrency=args.concurrency,
            global_timeout=args.timeout,
        )
    )

    # Write pass/fail logs
    log_dir = Path(__file__).resolve().parent.parent.parent / "logs"
    write_pass_fail_logs(summary, log_dir)

    # Output
    if args.output_file:
        write_json(summary, args.output_file)
    if args.output == "json" and not args.output_file:
        format_json_stdout(summary)
    else:
        print_console(summary, verbose=args.verbose)

    # Exit code: 0=all pass, 1=failures, 2=errors
    if summary.errors > 0:
        return 2
    if summary.failed > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
