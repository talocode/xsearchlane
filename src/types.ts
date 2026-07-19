export type XSearchProviderName = 'auto' | 'xai' | 'talocode' | 'mock'

export interface XSearchOptions {
  query: string
  allowedHandles?: string[]
  excludedHandles?: string[]
  fromDate?: string
  toDate?: string
  enableImageUnderstanding?: boolean
  enableVideoUnderstanding?: boolean
  model?: string
  limit?: number
}

export interface XSearchCitation {
  url?: string
  title?: string
  snippet?: string
}

export interface XSearchResult {
  ok: boolean
  provider: XSearchProviderName | string
  query: string
  answer: string
  citations: XSearchCitation[]
  raw?: unknown
  usage?: {
    inputTokens?: number
    outputTokens?: number
    reasoningTokens?: number
    totalTokens?: number
  }
  meta?: Record<string, unknown>
}

export interface XSearchLaneConfig {
  provider?: XSearchProviderName
  xaiApiKey?: string
  xaiBaseUrl?: string
  xaiModel?: string
  talocodeApiKey?: string
  talocodeBaseUrl?: string
}
