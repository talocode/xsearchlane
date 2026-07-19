#!/usr/bin/env node
import { VERSION } from './config.js'
import {
  getCapabilities,
  getPricing,
  health,
  resolveProvider,
  runXResearch,
  runXSearch,
} from './engine.js'

function usage(): never {
  console.error(`XSearchLane — Realtime X search for agents

Usage:
  xsearchlane search --query "..." [--handles a,b] [--exclude c,d] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
  xsearchlane research --query "..."
  xsearchlane health
  xsearchlane doctor
  xsearchlane pricing
  xsearchlane capabilities
  xsearchlane mcp
  xsearchlane --help

Env:
  XAI_API_KEY              direct upstream X search
  TALOCODE_API_KEY         hosted Talocode API
  XSEARCHLANE_PROVIDER     auto | xai | talocode | mock
`)
  process.exit(1)
}

function doctor() {
  const hasXaiKey = Boolean(process.env.XAI_API_KEY)
  const hasTalocodeKey = Boolean(process.env.TALOCODE_API_KEY)
  return {
    ok: true,
    service: 'xsearchlane',
    version: VERSION,
    node: process.version,
    providerEnv: process.env.XSEARCHLANE_PROVIDER || 'auto',
    resolvedProvider: resolveProvider(),
    hasXaiKey,
    hasTalocodeKey,
    xaiBaseUrl: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
    talocodeBaseUrl: process.env.TALOCODE_BASE_URL || 'https://api.talocode.site',
    xaiModel: process.env.XAI_MODEL || 'grok-4.5',
    tips: [
      hasXaiKey || hasTalocodeKey
        ? 'Live provider key detected'
        : 'No provider key — searches will use mock mode',
      'MCP: node dist/mcp/server.js or xsearchlane mcp',
      'Hosted routes: POST /v1/xsearchlane/search (15cr), /research (40cr)',
    ],
  }
}

function parseArgs() {
  const args = process.argv.slice(2)
  if (!args.length || args[0] === '--help' || args[0] === '-h') usage()
  const command = args[0]
  const out: Record<string, string> = { command }
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      const val = args[i + 1]
      if (val && !val.startsWith('--')) {
        out[key] = val
        i++
      } else out[key] = 'true'
    }
  }
  return out
}

function splitList(value?: string): string[] | undefined {
  if (!value) return undefined
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

async function main() {
  try {
    const a = parseArgs()
    const q = a.query || a.q || ''

    switch (a.command) {
      case 'search': {
        if (!q) throw new Error('--query is required')
        const result = await runXSearch({
          query: q,
          allowedHandles: splitList(a.handles || a.handle),
          excludedHandles: splitList(a.exclude || a.excluded),
          fromDate: a.from || a.fromDate,
          toDate: a.to || a.toDate,
          enableImageUnderstanding: a.images === 'true',
          enableVideoUnderstanding: a.videos === 'true',
        })
        process.stdout.write(JSON.stringify(result, null, 2) + '\n')
        break
      }
      case 'research': {
        if (!q) throw new Error('--query is required')
        const result = await runXResearch({ query: q })
        process.stdout.write(JSON.stringify(result, null, 2) + '\n')
        break
      }
      case 'health':
        process.stdout.write(JSON.stringify(health(), null, 2) + '\n')
        break
      case 'doctor':
        process.stdout.write(JSON.stringify(doctor(), null, 2) + '\n')
        break
      case 'pricing':
        process.stdout.write(JSON.stringify(getPricing(), null, 2) + '\n')
        break
      case 'capabilities':
        process.stdout.write(JSON.stringify(getCapabilities(), null, 2) + '\n')
        break
      case 'mcp': {
        await import('./mcp/server.js')
        break
      }
      default:
        usage()
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
}

export { main }

const isDirect =
  process.argv[1] &&
  (process.argv[1].endsWith('/cli.js') ||
    process.argv[1].endsWith('\\cli.js') ||
    process.argv[1].endsWith('/xsearchlane.js') ||
    process.argv[1].endsWith('xsearchlane'))

if (isDirect) {
  main()
}
