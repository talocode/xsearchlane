#!/usr/bin/env node
import {
  getCapabilities,
  getPricing,
  health,
  runXResearch,
  runXSearch,
} from '../engine.js'
import { VERSION } from '../config.js'

const TOOLS = [
  {
    name: 'xsearchlane_search',
    description:
      'Realtime search on X (posts, users, threads). Returns an answer with citations when available.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' as const, description: 'Search query or natural language question' },
        allowedHandles: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Only include posts from these handles (max 20)',
        },
        excludedHandles: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Exclude posts from these handles (max 20)',
        },
        fromDate: { type: 'string' as const, description: 'Start date YYYY-MM-DD' },
        toDate: { type: 'string' as const, description: 'End date YYYY-MM-DD' },
        enableImageUnderstanding: { type: 'boolean' as const },
        enableVideoUnderstanding: { type: 'boolean' as const },
      },
      required: ['query'],
    },
  },
  {
    name: 'xsearchlane_research',
    description:
      'Deeper X research brief: themes, pain points, and engagement signals with citations.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' as const },
        allowedHandles: {
          type: 'array' as const,
          items: { type: 'string' as const },
        },
        fromDate: { type: 'string' as const },
        toDate: { type: 'string' as const },
      },
      required: ['query'],
    },
  },
  {
    name: 'xsearchlane_health',
    description: 'Health check and active provider status',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'xsearchlane_capabilities',
    description: 'List XSearchLane capabilities and tools',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'xsearchlane_pricing',
    description: 'Hosted credit pricing for /v1/xsearchlane/*',
    inputSchema: { type: 'object' as const, properties: {} },
  },
]

async function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'xsearchlane_search':
      return runXSearch({
        query: String(args.query || ''),
        allowedHandles: args.allowedHandles as string[] | undefined,
        excludedHandles: args.excludedHandles as string[] | undefined,
        fromDate: args.fromDate as string | undefined,
        toDate: args.toDate as string | undefined,
        enableImageUnderstanding: Boolean(args.enableImageUnderstanding),
        enableVideoUnderstanding: Boolean(args.enableVideoUnderstanding),
      })
    case 'xsearchlane_research':
      return runXResearch({
        query: String(args.query || ''),
        allowedHandles: args.allowedHandles as string[] | undefined,
        fromDate: args.fromDate as string | undefined,
        toDate: args.toDate as string | undefined,
      })
    case 'xsearchlane_health':
      return health()
    case 'xsearchlane_capabilities':
      return getCapabilities()
    case 'xsearchlane_pricing':
      return getPricing()
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

let buffer = ''

process.stdin.setEncoding('utf-8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  const lines = buffer.split('\n')
  buffer = lines.pop() || ''
  for (const line of lines) {
    if (line.trim()) void handleLine(line.trim())
  }
})

process.stdin.on('end', () => {
  if (buffer.trim()) void handleLine(buffer.trim())
})

async function handleLine(line: string) {
  let msg: any
  try {
    msg = JSON.parse(line)
  } catch {
    process.stderr.write(`Invalid JSON: ${line}\n`)
    return
  }

  if (msg.jsonrpc !== '2.0') return

  if (msg.method === 'initialize') {
    respond(msg.id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'xsearchlane', version: VERSION },
    })
  } else if (msg.method === 'notifications/initialized') {
    return
  } else if (msg.method === 'tools/list') {
    respond(msg.id, { tools: TOOLS })
  } else if (msg.method === 'tools/call') {
    const { name, arguments: args } = msg.params || {}
    try {
      const result = await handleToolCall(name, args || {})
      respond(msg.id, {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      respond(msg.id, {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      })
    }
  } else if (msg.method === 'ping') {
    respond(msg.id, {})
  }
}

function respond(id: number | string | undefined, result: unknown) {
  if (id === undefined) return
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n')
}

process.stderr.write('XSearchLane MCP server started\n')
