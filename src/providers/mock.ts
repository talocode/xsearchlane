import type { XSearchOptions, XSearchResult } from '../types.js'

export async function mockSearch(options: XSearchOptions): Promise<XSearchResult> {
  const q = options.query.trim()
  const handles = options.allowedHandles?.length
    ? ` (handles: ${options.allowedHandles.map((h) => `@${h.replace(/^@/, '')}`).join(', ')})`
    : ''

  return {
    ok: true,
    provider: 'mock',
    query: q,
    answer: [
      `Mock X search for: "${q}"${handles}.`,
      'No live provider key detected. Set XAI_API_KEY for realtime X search, or TALOCODE_API_KEY for hosted XSearchLane.',
      'Sample themes agents often surface: context loss, review bottlenecks, agent sandbox safety, and unpredictable AI spend.',
    ].join(' '),
    citations: [
      {
        title: 'Mock citation — developer pain themes',
        url: 'https://x.com/search?q=' + encodeURIComponent(q),
        snippet: 'Placeholder result for offline development and tests.',
      },
    ],
    meta: {
      mock: true,
      fromDate: options.fromDate,
      toDate: options.toDate,
      excludedHandles: options.excludedHandles,
    },
  }
}
