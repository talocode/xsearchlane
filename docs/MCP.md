# XSearchLane MCP

stdio JSON-RPC MCP server for realtime X search.

## Run

```bash
export XAI_API_KEY=...
npx @talocode/xsearchlane mcp
# or
node dist/mcp/server.js
```

## OpenCode

`opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "xsearchlane": {
      "type": "local",
      "command": ["npx", "-y", "@talocode/xsearchlane", "mcp"],
      "environment": {
        "XAI_API_KEY": "{env:XAI_API_KEY}"
      }
    }
  }
}
```

Or from a local checkout:

```json
{
  "mcp": {
    "xsearchlane": {
      "type": "local",
      "command": ["node", "/absolute/path/to/xsearchlane/dist/mcp/server.js"],
      "environment": {
        "XAI_API_KEY": "{env:XAI_API_KEY}",
        "XSEARCHLANE_PROVIDER": "auto"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `xsearchlane_search` | Realtime X search with optional handle/date filters |
| `xsearchlane_research` | Research-style brief over recent X discussion |
| `xsearchlane_health` | Provider + key status |
| `xsearchlane_capabilities` | Feature matrix |
| `xsearchlane_pricing` | Hosted credit table |

## Protocol

Line-delimited JSON-RPC 2.0 over stdio:

- `initialize`
- `tools/list`
- `tools/call`
- `ping`
