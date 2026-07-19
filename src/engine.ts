import { getCapabilities, getPricing, loadConfig, SERVICE, VERSION } from './config.js'
import { XSearchLaneError } from './errors.js'
import { mockSearch } from './providers/mock.js'
import { talocodeSearch } from './providers/talocode.js'
import { xaiSearch } from './providers/xai.js'
import type { XSearchLaneConfig, XSearchOptions, XSearchResult } from './types.js'

function normalizeOptions(input: XSearchOptions): XSearchOptions {
  const query = (input.query || '').trim()
  if (!query) {
    throw new XSearchLaneError('query is required', { code: 'invalid_input', status: 400 })
  }
  return {
    ...input,
    query,
    allowedHandles: input.allowedHandles?.map((h) => h.replace(/^@/, '')).filter(Boolean),
    excludedHandles: input.excludedHandles?.map((h) => h.replace(/^@/, '')).filter(Boolean),
  }
}

export function resolveProvider(config = loadConfig()): 'xai' | 'talocode' | 'mock' {
  if (config.provider === 'mock') return 'mock'
  if (config.provider === 'xai') return 'xai'
  if (config.provider === 'talocode') return 'talocode'

  if (config.xaiApiKey) return 'xai'
  if (config.talocodeApiKey) return 'talocode'
  return 'mock'
}

export async function runXSearch(
  input: XSearchOptions,
  overrides: XSearchLaneConfig = {},
): Promise<XSearchResult> {
  const options = normalizeOptions(input)
  const config = loadConfig(overrides)
  const provider = resolveProvider(config)

  if (provider === 'xai') {
    return xaiSearch(options, {
      apiKey: config.xaiApiKey || '',
      baseUrl: config.xaiBaseUrl!,
      model: config.xaiModel!,
    })
  }

  if (provider === 'talocode') {
    return talocodeSearch(options, {
      apiKey: config.talocodeApiKey,
      baseUrl: config.talocodeBaseUrl!,
    })
  }

  return mockSearch(options)
}

export async function runXResearch(
  input: XSearchOptions,
  overrides: XSearchLaneConfig = {},
): Promise<XSearchResult> {
  const base = normalizeOptions(input)
  const researchQuery = [
    `Research recent posts on X about: ${base.query}`,
    'Summarize recurring developer/builder pain points, product requests, and strong engagement themes.',
    'Return concrete claims with citations when possible.',
  ].join(' ')

  const result = await runXSearch({ ...base, query: researchQuery }, overrides)
  return {
    ...result,
    query: base.query,
    meta: {
      ...(result.meta || {}),
      mode: 'research',
      expandedQuery: researchQuery,
    },
  }
}

export function health() {
  const config = loadConfig()
  return {
    ok: true,
    service: SERVICE,
    version: VERSION,
    provider: resolveProvider(config),
    hasXaiKey: Boolean(config.xaiApiKey),
    hasTalocodeKey: Boolean(config.talocodeApiKey),
  }
}

export { getCapabilities, getPricing }
