import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getCapabilities,
  getPricing,
  health,
  resolveProvider,
  runXResearch,
  runXSearch,
} from '../src/engine.js'

describe('xsearchlane engine', () => {
  it('defaults to mock without keys', () => {
    const prevX = process.env.XAI_API_KEY
    const prevT = process.env.TALOCODE_API_KEY
    const prevP = process.env.XSEARCHLANE_PROVIDER
    delete process.env.XAI_API_KEY
    delete process.env.TALOCODE_API_KEY
    process.env.XSEARCHLANE_PROVIDER = 'auto'
    assert.equal(resolveProvider(), 'mock')
    if (prevX) process.env.XAI_API_KEY = prevX
    else delete process.env.XAI_API_KEY
    if (prevT) process.env.TALOCODE_API_KEY = prevT
    else delete process.env.TALOCODE_API_KEY
    if (prevP) process.env.XSEARCHLANE_PROVIDER = prevP
    else delete process.env.XSEARCHLANE_PROVIDER
  })

  it('runs mock search', async () => {
    const result = await runXSearch(
      { query: 'AI coding agents review bottleneck' },
      { provider: 'mock' },
    )
    assert.equal(result.ok, true)
    assert.equal(result.provider, 'mock')
    assert.match(result.answer, /Mock X search/)
    assert.ok(result.citations.length >= 1)
  })

  it('runs mock research', async () => {
    const result = await runXResearch(
      { query: 'developer pain points agents' },
      { provider: 'mock' },
    )
    assert.equal(result.ok, true)
    assert.equal(result.meta?.mode, 'research')
  })

  it('rejects empty query', async () => {
    await assert.rejects(() => runXSearch({ query: '  ' }, { provider: 'mock' }), /query is required/)
  })

  it('exposes health pricing capabilities', () => {
    const h = health()
    assert.equal(h.ok, true)
    assert.equal(h.service, 'xsearchlane')
    assert.ok(getPricing().routes['POST /v1/xsearchlane/search'])
    assert.ok(getCapabilities().tools.includes('xsearchlane_search'))
  })
})
