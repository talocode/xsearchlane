import { XSearchLaneError } from '../errors.js'
import type { XSearchCitation, XSearchOptions, XSearchResult } from '../types.js'

interface XaiProviderConfig {
  apiKey: string
  baseUrl: string
  model: string
}

function buildTool(options: XSearchOptions) {
  const tool: Record<string, unknown> = { type: 'x_search' }

  if (options.allowedHandles?.length) {
    tool.allowed_x_handles = options.allowedHandles
      .map((h) => h.replace(/^@/, ''))
      .slice(0, 20)
  }
  if (options.excludedHandles?.length) {
    tool.excluded_x_handles = options.excludedHandles
      .map((h) => h.replace(/^@/, ''))
      .slice(0, 20)
  }
  if (options.fromDate) tool.from_date = options.fromDate
  if (options.toDate) tool.to_date = options.toDate
  if (options.enableImageUnderstanding) tool.enable_image_understanding = true
  if (options.enableVideoUnderstanding) tool.enable_video_understanding = true

  return tool
}

function extractText(payload: any): string {
  if (!payload) return ''
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text
  }

  const parts: string[] = []
  const output = Array.isArray(payload.output) ? payload.output : []
  for (const item of output) {
    if (item?.type === 'message' && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (typeof c?.text === 'string') parts.push(c.text)
        else if (typeof c?.output_text === 'string') parts.push(c.output_text)
      }
    }
    if (typeof item?.content === 'string') parts.push(item.content)
  }

  if (parts.length) return parts.join('\n').trim()
  if (typeof payload.content === 'string') return payload.content
  return ''
}

function extractCitations(payload: any): XSearchCitation[] {
  const citations: XSearchCitation[] = []
  const seen = new Set<string>()

  const push = (c: XSearchCitation) => {
    const key = c.url || c.title || c.snippet || JSON.stringify(c)
    if (!key || seen.has(key)) return
    seen.add(key)
    citations.push(c)
  }

  if (Array.isArray(payload?.citations)) {
    for (const c of payload.citations) {
      if (typeof c === 'string') push({ url: c })
      else if (c && typeof c === 'object') {
        push({
          url: c.url || c.uri,
          title: c.title || c.name,
          snippet: c.snippet || c.text || c.summary,
        })
      }
    }
  }

  if (Array.isArray(payload?.output)) {
    for (const item of payload.output) {
      if (Array.isArray(item?.content)) {
        for (const block of item.content) {
          if (Array.isArray(block?.annotations)) {
            for (const a of block.annotations) {
              push({
                url: a.url || a.uri,
                title: a.title,
                snippet: a.text,
              })
            }
          }
        }
      }
    }
  }

  return citations
}

export async function xaiSearch(
  options: XSearchOptions,
  config: XaiProviderConfig,
): Promise<XSearchResult> {
  if (!config.apiKey) {
    throw new XSearchLaneError('XAI_API_KEY is required for the xai provider', {
      code: 'missing_api_key',
      status: 401,
    })
  }

  const body = {
    model: options.model || config.model,
    input: [
      {
        role: 'user',
        content: options.query,
      },
    ],
    tools: [buildTool(options)],
  }

  const res = await fetch(`${config.baseUrl}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      (payload as any)?.error?.message ||
      (payload as any)?.error ||
      `Upstream X search failed (${res.status})`
    throw new XSearchLaneError(String(message), {
      code: 'upstream_error',
      status: res.status,
    })
  }

  const answer = extractText(payload)
  const citations = extractCitations(payload)
  const usage = (payload as any)?.usage || {}

  return {
    ok: true,
    provider: 'xai',
    query: options.query,
    answer: answer || JSON.stringify(payload),
    citations,
    raw: payload,
    usage: {
      inputTokens: usage.input_tokens ?? usage.prompt_tokens,
      outputTokens: usage.output_tokens ?? usage.completion_tokens,
      reasoningTokens: usage.reasoning_tokens,
      totalTokens: usage.total_tokens,
    },
    meta: {
      model: options.model || config.model,
      tool: 'x_search',
    },
  }
}
