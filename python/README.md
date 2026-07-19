# XSearchLane

**Realtime X search for agents** — natural-language answers, handle/date filters, and citations via Talocode Cloud.

Part of **[Talocode](https://talocode.site)** — open tools people trust; hosted power under [docs.talocode.site](https://docs.talocode.site).

| | |
|--|--|
| **Cloud API** | `https://api.talocode.site` → `/v1/xsearchlane/*` |
| **Python** | `pip install talocode-xsearchlane` **(this package)** |
| **Node** | `npm install @talocode/xsearchlane` |
| **MCP** | `npx @talocode/xsearchlane mcp` |
| **Repo** | [github.com/talocode/xsearchlane](https://github.com/talocode/xsearchlane) |
| **License** | MIT |

---

## Why XSearchLane?

Agents need **live social signal**, not only static web pages:

- **Realtime X search** — keyword/semantic questions over posts and threads
- **Filters** — allowed/excluded handles, date ranges, optional media understanding
- **Citations** when the upstream provider returns them
- **Credit metering** on Talocode Cloud (15 search / 40 research)
- **Same contract** — Python SDK, npm SDK, CLI, MCP, and HTTP

Local Node tooling can also call an upstream X search provider directly with `XAI_API_KEY`. This Python package targets the **hosted** Talocode API surface.

---

## Install

```bash
pip install talocode-xsearchlane
```

Requires **Python 3.10+**. Stdlib only (no extra runtime deps).

---

## Quickstart

```python
import os
from xsearchlane import XSearchLaneClient

client = XSearchLaneClient(
    api_key=os.environ["TALOCODE_API_KEY"],
    # base_url defaults to https://api.talocode.site
)

result = client.search(query="developers complaining about AI code review")
print(result.get("answer"))
for c in result.get("citations", []):
    print(c.get("url"), c.get("title"))

brief = client.research(query="AI coding agent pain points")
print(brief.get("answer"))
```

### Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `TALOCODE_API_KEY` | — | Bearer token (required for POST) |
| `TALOCODE_BASE_URL` | `https://api.talocode.site` | API host |

```bash
export TALOCODE_API_KEY=your_key
export TALOCODE_BASE_URL=https://api.talocode.site
```

Auth header:

```
Authorization: Bearer $TALOCODE_API_KEY
```

---

## API surface / credits

| Method | Path | Credits |
|--------|------|---------|
| GET | `/v1/xsearchlane/health` | 0 |
| GET | `/v1/xsearchlane/pricing` | 0 |
| GET | `/v1/xsearchlane/capabilities` | 0 |
| POST | `/v1/xsearchlane/search` | 15 |
| POST | `/v1/xsearchlane/research` | 40 |

### Client methods

```python
client.health()
client.pricing()
client.capabilities()
client.search(
    query=...,
    allowed_handles=None,
    excluded_handles=None,
    from_date=None,  # YYYY-MM-DD
    to_date=None,
    enable_image_understanding=None,
    enable_video_understanding=None,
)
client.research(query=..., allowed_handles=None, from_date=None, to_date=None)
```

- `XSearchLaneError` — raised on HTTP failures (`status`, `code` when present)
- `create_xsearchlane_client(...)` — factory alias

---

## CLI

```bash
xsearchlane health
xsearchlane pricing
xsearchlane capabilities
xsearchlane search --query "AI agent sandbox"
xsearchlane research --query "review bottleneck AI PRs"
xsearchlane search --query "MCP tools" --handles simonw --from 2026-07-01
```

---

## Node / MCP / full product

```bash
npm install -g @talocode/xsearchlane
xsearchlane search --query "..."
xsearchlane mcp
```

OpenCode MCP example: see repo `examples/opencode.json` and `docs/MCP.md`.

Repo: [github.com/talocode/xsearchlane](https://github.com/talocode/xsearchlane)

---

## Related packages

| Package | Install |
|---------|---------|
| XSearchLane (this package) | `pip install talocode-xsearchlane` · `npm i @talocode/xsearchlane` |
| XProLane | `pip install talocode-xprolane` · `npm i @talocode/xprolane` |
| SearchLane | `pip install talocode-searchlane` · `npm i @talocode/searchlane` |
| StackLane | `pip install talocode` |

---

## Talocode ecosystem

| Product | Repo | Notes |
|---------|------|-------|
| [XSearchLane](https://github.com/talocode/xsearchlane) | `talocode/xsearchlane` | **(this package)** realtime X search |
| [XProLane](https://github.com/talocode/xprolane) | `talocode/xprolane` | X Pro setup planner |
| [SearchLane](https://github.com/talocode/searchlane) | `talocode/searchlane` | Agent web search & research |
| [Tera](https://github.com/talocode/tera) | `talocode/tera` | Hosted writing/coding API |
| [Codra](https://github.com/talocode/codra) | `talocode/codra` | Coding agent runtime |
| [StackLane](https://github.com/talocode/stacklane) | `talocode/stacklane` | Cloud control plane |
| [GateLane](https://github.com/talocode/gatelane) | `talocode/gatelane` | Policy / gate tooling |
| [ContextLane](https://github.com/talocode/contextlane) | `talocode/contextlane` | Context infrastructure |
| [ScreenLane](https://github.com/talocode/screenlane) | `talocode/screenlane` | Screen/agent UI tooling |
| [MemoryLane](https://github.com/talocode/memorylane) | `talocode/memorylane` | Memory for agents |
| [Tradia](https://github.com/talocode/tradia) | `talocode/tradia` | Trading tooling |
| [DevTool](https://github.com/talocode/devtool) | `talocode/devtool` | Developer utilities |
| [Agent Browser](https://github.com/talocode/agent-browser) | `talocode/agent-browser` | Browser automation |
| [InvoiceLane](https://github.com/talocode/invoicelane) | `talocode/invoicelane` | Invoicing |
| [GeoLane](https://github.com/talocode/geolane) | `talocode/geolane` | Geo visibility |
| [ClipLoop](https://github.com/talocode/cliploop) | `talocode/cliploop` | Short-form video |

More: [github.com/talocode](https://github.com/talocode) · [talocode.site](https://talocode.site) · [docs.talocode.site](https://docs.talocode.site)

---

## Links

- PyPI: https://pypi.org/project/talocode-xsearchlane/
- npm: https://www.npmjs.com/package/@talocode/xsearchlane
- Source: https://github.com/talocode/xsearchlane
- Docs: https://docs.talocode.site
- Issues: https://github.com/talocode/xsearchlane/issues

## License

MIT © Talocode
