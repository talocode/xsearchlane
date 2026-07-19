"""CLI entry: python -m xsearchlane / xsearchlane"""

from __future__ import annotations

import argparse
import json
import sys

from . import __version__
from .client import XSearchLaneClient, XSearchLaneError


def _print(data: object) -> None:
    sys.stdout.write(json.dumps(data, indent=2) + "\n")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="xsearchlane",
        description="XSearchLane — realtime X search for agents (hosted Talocode API)",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command")

    p_search = sub.add_parser("search", help="POST /v1/xsearchlane/search")
    p_search.add_argument("--query", "-q", required=True)
    p_search.add_argument("--handles", help="Comma-separated allowed handles")
    p_search.add_argument("--exclude", help="Comma-separated excluded handles")
    p_search.add_argument("--from", dest="from_date")
    p_search.add_argument("--to", dest="to_date")

    p_research = sub.add_parser("research", help="POST /v1/xsearchlane/research")
    p_research.add_argument("--query", "-q", required=True)
    p_research.add_argument("--handles", help="Comma-separated allowed handles")
    p_research.add_argument("--from", dest="from_date")
    p_research.add_argument("--to", dest="to_date")

    sub.add_parser("health", help="GET /v1/xsearchlane/health")
    sub.add_parser("pricing", help="GET /v1/xsearchlane/pricing")
    sub.add_parser("capabilities", help="GET /v1/xsearchlane/capabilities")

    args = parser.parse_args(argv)
    if not args.command:
        parser.print_help()
        return 1

    client = XSearchLaneClient()
    try:
        if args.command == "health":
            _print(client.health())
        elif args.command == "pricing":
            _print(client.pricing())
        elif args.command == "capabilities":
            _print(client.capabilities())
        elif args.command == "search":
            handles = (
                [h.strip() for h in args.handles.split(",") if h.strip()]
                if args.handles
                else None
            )
            exclude = (
                [h.strip() for h in args.exclude.split(",") if h.strip()]
                if getattr(args, "exclude", None)
                else None
            )
            _print(
                client.search(
                    query=args.query,
                    allowed_handles=handles,
                    excluded_handles=exclude,
                    from_date=args.from_date,
                    to_date=args.to_date,
                )
            )
        elif args.command == "research":
            handles = (
                [h.strip() for h in args.handles.split(",") if h.strip()]
                if args.handles
                else None
            )
            _print(
                client.research(
                    query=args.query,
                    allowed_handles=handles,
                    from_date=args.from_date,
                    to_date=args.to_date,
                )
            )
        else:
            parser.print_help()
            return 1
    except XSearchLaneError as e:
        sys.stderr.write(f"Error: {e}\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
