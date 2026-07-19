import { XSearchLaneError } from '../errors.js'
import type { XSearchOptions, XSearchResult } from '../types.js'

interface TalocodeProviderConfig {
  apiKey?: string
  baseUrl: string
}

export async function talocodeSearch(
  options: XSearchOptions,
  config: TalocodeProviderConfig,
): Promise<XSearchResult> {
  if (!config.apiKey) {
    throw new XSearchLaneError('TALOCODE_API_KEY is required for the talocode provider', {
      code: 'missing_api_key',
      status: 401,
    })
  }

  const url = `${config.baseUrl}/v1/xsearchlane/search`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      query: options.query,
      allowedHandles: options.allowedHandles,
      excludedHandles: options.excludedHandles,
      fromDate: options.fromDate,
      toDate: options.toDate,
      enableImageUnderstanding: options.enableImageUnderstanding,
      enableVideoUnderstanding: options.enableVideoUnderstanding,
      limit: options.limit,
    }),
  })

  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      typeof (payload as any)?.error === 'string'
        ? (payload as any).error
        : (payload as any)?.error?.message || `Hosted XSearchLane failed (${res.status})`
    throw new XSearchLaneError(String(message), {
      code: 'hosted_error',
      status: res.status,
    })
  }

  return {
    ok: true,
    provider: 'talocode',
    query: options.query,
    answer: String((payload as any).answer || (payload as any).text || ''),
    citations: Array.isArray((payload as any).citations) ? (payload as any).citations : [],
    raw: payload,
    usage: (payload as any).usage,
    meta: (payload as any).meta,
  }
}
