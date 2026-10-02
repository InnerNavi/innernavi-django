import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchHealth, HEALTH_TIMEOUT_MS, HealthTimeoutError, isFoundationHealth } from './health'

describe('development health contract', () => {
  it('accepts the foundation response', () => {
    expect(isFoundationHealth({ status: 'ok', scope: 'development-foundation' })).toBe(true)
  })
  it('rejects unavailable or unrelated responses', () => {
    expect(isFoundationHealth(null)).toBe(false)
    expect(isFoundationHealth({ status: 'unavailable', scope: 'development-foundation' })).toBe(false)
    expect(isFoundationHealth({ status: 'ok', scope: 'mvp-ready' })).toBe(false)
  })
})

describe('bounded health request', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns a valid response and clears the deadline', async () => {
    const expected = { status: 'ok', scope: 'development-foundation' }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(expected)))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchHealth()).resolves.toEqual(expected)
    const options = fetchMock.mock.calls[0]![1] as RequestInit
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/v1/health/live')
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(options.signal!.aborted).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects at the deadline even when the transport ignores abort', async () => {
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const result = fetchHealth()
    const assertion = expect(result).rejects.toBeInstanceOf(HealthTimeoutError)
    const options = fetchMock.mock.calls[0]![1] as RequestInit

    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS - 1)
    expect(options.signal!.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await assertion
    expect(options.signal!.aborted).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('also times out if headers arrive but the JSON body never completes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => new Promise(() => {}),
    })
    vi.stubGlobal('fetch', fetchMock)
    const assertion = expect(fetchHealth()).rejects.toBeInstanceOf(HealthTimeoutError)

    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS)
    await assertion
    const options = fetchMock.mock.calls[0]![1] as RequestInit
    expect(options.signal!.aborted).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('reports an HTTP error immediately and does not leave a timer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchHealth()).rejects.toThrow('백엔드 연결에 실패했습니다.')
    expect(vi.getTimerCount()).toBe(0)
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS)
    const options = fetchMock.mock.calls[0]![1] as RequestInit
    expect(options.signal!.aborted).toBe(false)
  })

  it('preserves a network error and clears the deadline', async () => {
    const networkError = new TypeError('network unavailable')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError))

    await expect(fetchHealth()).rejects.toBe(networkError)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects malformed JSON and clears the deadline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{invalid json')))

    await expect(fetchHealth()).rejects.toBeInstanceOf(SyntaxError)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects an unrelated health payload and clears the deadline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', scope: 'mvp-ready' })),
    ))

    await expect(fetchHealth()).rejects.toThrow('예상하지 않은 상태 응답입니다.')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('can retry successfully after a timeout without reusing an aborted signal', async () => {
    const expected = { status: 'ok', scope: 'development-foundation' }
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce(new Response(JSON.stringify(expected)))
    vi.stubGlobal('fetch', fetchMock)
    const assertion = expect(fetchHealth()).rejects.toBeInstanceOf(HealthTimeoutError)
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS)
    await assertion

    await expect(fetchHealth()).resolves.toEqual(expected)
    const first = fetchMock.mock.calls[0]![1] as RequestInit
    const second = fetchMock.mock.calls[1]![1] as RequestInit
    expect(first.signal!.aborted).toBe(true)
    expect(second.signal!.aborted).toBe(false)
    expect(second.signal).not.toBe(first.signal)
    expect(vi.getTimerCount()).toBe(0)
  })
})
