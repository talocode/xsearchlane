import { XSearchLaneError } from './errors.js'
import type { XSearchOptions, XSearchResult } from './types.js'

export class XSearchLaneClient {
  private apiKey: string | undefined
  private baseUrl: string

  constructor(options: { apiKey?: string; baseUrl?: string } = {}) {
    this.apiKey = options.apiKey || process.env.TALOCODE_API_KEY
    this.baseUrl = (
      options.baseUrl ||
      process.env.TALOCODE_BASE_URL ||
      'https://api.talocode.site'
    ).replace(/\/+$/, '')
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string | { message?: string; code?: string }
        code?: string
      }
      const message =
        typeof data.error === 'string'
          ? data.error
          : data.error?.message || `Request failed (${response.status})`
      const code = typeof data.error === 'object' ? data.error?.code : data.code
      throw new XSearchLaneError(message, { code, status: response.status })
    }

    return (await response.json()) as T
  }

  health() {
    return this.request<{ ok: boolean; service: string; version: string }>(
      'GET',
      '/v1/xsearchlane/health',
    )
  }

  pricing() {
    return this.request<Record<string, unknown>>('GET', '/v1/xsearchlane/pricing')
  }

  capabilities() {
    return this.request<Record<string, unknown>>('GET', '/v1/xsearchlane/capabilities')
  }

  search(input: XSearchOptions) {
    return this.request<XSearchResult>('POST', '/v1/xsearchlane/search', input)
  }

  research(input: XSearchOptions) {
    return this.request<XSearchResult>('POST', '/v1/xsearchlane/research', input)
  }
}
