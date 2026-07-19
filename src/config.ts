import type { XSearchLaneConfig, XSearchProviderName } from './types.js'

export const VERSION = '0.1.1'
export const SERVICE = 'xsearchlane'

export function loadConfig(overrides: XSearchLaneConfig = {}): Required<
  Pick<
    XSearchLaneConfig,
    'provider' | 'xaiBaseUrl' | 'xaiModel' | 'talocodeBaseUrl'
  >
> &
  XSearchLaneConfig {
  const provider = (overrides.provider ||
    process.env.XSEARCHLANE_PROVIDER ||
    'auto') as XSearchProviderName

  return {
    provider,
    xaiApiKey: overrides.xaiApiKey || process.env.XAI_API_KEY,
    xaiBaseUrl: (
      overrides.xaiBaseUrl ||
      process.env.XAI_BASE_URL ||
      'https://api.x.ai/v1'
    ).replace(/\/+$/, ''),
    xaiModel: overrides.xaiModel || process.env.XAI_MODEL || 'grok-4.5',
    talocodeApiKey: overrides.talocodeApiKey || process.env.TALOCODE_API_KEY,
    talocodeBaseUrl: (
      overrides.talocodeBaseUrl ||
      process.env.TALOCODE_BASE_URL ||
      'https://api.talocode.site'
    ).replace(/\/+$/, ''),
  }
}

export function getPricing() {
  return {
    service: SERVICE,
    version: VERSION,
    currency: 'credits',
    routes: {
      'POST /v1/xsearchlane/search': 15,
      'POST /v1/xsearchlane/research': 40,
      'GET /v1/xsearchlane/health': 0,
      'GET /v1/xsearchlane/pricing': 0,
      'GET /v1/xsearchlane/capabilities': 0,
    },
    notes: [
      'Local MCP/CLI can call the upstream X search provider directly with XAI_API_KEY.',
      'Hosted Talocode usage meters credits under /v1/xsearchlane/*.',
    ],
  }
}

export function getCapabilities() {
  return {
    service: SERVICE,
    version: VERSION,
    modes: ['mcp', 'cli', 'sdk', 'http'],
    providers: ['xai', 'talocode', 'mock'],
    tools: [
      'xsearchlane_search',
      'xsearchlane_research',
      'xsearchlane_health',
      'xsearchlane_capabilities',
      'xsearchlane_pricing',
    ],
    features: {
      keywordSearch: true,
      semanticSearch: true,
      handleFilters: true,
      dateRange: true,
      imageUnderstanding: true,
      videoUnderstanding: true,
      citations: true,
    },
  }
}
