# Stacklane XSearchLane patch (local-only)

**Status:** Implemented in this workspace’s Stacklane tree. **Not deployed.** That tree has **no `.git`** here, so nothing was committed or pushed to the real Stacklane remote.

## Changed files (apply to real Stacklane repo)

| File | Change |
|------|--------|
| `apps/api/src/services/xsearchlane.ts` | **New** service: mock + optional upstream X search, pricing, capabilities |
| `apps/api/src/server.ts` | **New** route block `/v1/xsearchlane/*` (auth + credit charge) |
| `apps/api/src/mcp/schemas.ts` | **New** MCP input schemas |
| `apps/api/src/mcp/tools.ts` | **New** MCP tool map entries |
| `apps/api/src/mcp/__tests__/mcp.test.ts` | **New** route assertions for xsearchlane tools |
| `apps/api/tests/xsearchlane.test.ts` | **New** unit tests |

## Routes added

| Method | Path | Credits | Auth |
|--------|------|---------|------|
| GET | `/v1/xsearchlane/health` | 0 | API key |
| GET | `/v1/xsearchlane/pricing` | 0 | API key |
| GET | `/v1/xsearchlane/capabilities` | 0 | API key |
| POST | `/v1/xsearchlane/search` | **15** (explicit `credits` on charge) | API key |
| POST | `/v1/xsearchlane/research` | **40** (explicit `credits` on charge) | API key |

Auth: `Authorization: Bearer $TALOCODE_API_KEY` or `X-Api-Key`.

## MCP tools added

| Tool | Route | Credits |
|------|-------|---------|
| `xsearchlane_health` | GET `/v1/xsearchlane/health` | — |
| `xsearchlane_pricing` | GET `/v1/xsearchlane/pricing` | — |
| `xsearchlane_capabilities` | GET `/v1/xsearchlane/capabilities` | — |
| `xsearchlane_search` | POST `/v1/xsearchlane/search` | 15 |
| `xsearchlane_research` | POST `/v1/xsearchlane/research` | 40 |

## Tests added

- `apps/api/tests/xsearchlane.test.ts` — mock search, empty query, research mode, pricing
- MCP test: `xsearchlane tools reference correct routes`

Local validation (this workspace): **66** tests pass including MCP suite + xsearchlane.

## Host env for live X

On the API host (not required for mock):

```bash
XAI_API_KEY=...
# optional
XAI_BASE_URL=https://api.x.ai/v1
XAI_MODEL=grok-4.5
XSEARCHLANE_PROVIDER=auto   # or mock | xai
```

## Deploy steps (real Stacklane repo)

1. Copy the six files above into the canonical Stacklane monorepo (or cherry-pick equivalent diff).
2. Optionally register `xsearchlane.search` / `xsearchlane.research` in `@stacklane/config` pricing table if your deploy requires `getPricingForAction` (current patch uses **explicit `credits`** on `chargeCredits`, so it works without config package updates).
3. Run:
   ```bash
   cd apps/api
   npm test   # or: npx tsx --test tests/xsearchlane.test.ts src/mcp/__tests__/mcp.test.ts
   ```
4. Commit on a **feature branch**, open PR, deploy API (Netlify / your pipeline).
5. Smoke:
   ```bash
   curl -sS -H "Authorization: Bearer $TALOCODE_API_KEY" \
     https://api.talocode.site/v1/xsearchlane/health
   curl -sS -X POST -H "Authorization: Bearer $TALOCODE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query":"AI agents"}' \
     https://api.talocode.site/v1/xsearchlane/search
   ```
6. Confirm wallet debit: 15cr search / 40cr research.

## Do not claim

- Hosted `api.talocode.site/v1/xsearchlane/*` is **not live** until the real Stacklane deploy ships this patch.
