import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HEALTH_TIMEOUT_MS } from '../api/health'
import { useHealthCheck } from './useHealthCheck'

describe('health check screen state', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('restores retry availability after a timeout, then reports a successful retry', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'ok', scope: 'development-foundation',
      })))
    vi.stubGlobal('fetch', fetchMock)
    const { status, checking, checkBackend } = useHealthCheck()
    expect(checking.value).toBe(false)

    const firstAttempt = checkBackend()
    expect(checking.value).toBe(true)
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS)
    await firstAttempt
    expect(checking.value).toBe(false)
    expect(status.value).toContain('다시 시도하세요.')

    await checkBackend()
    expect(checking.value).toBe(false)
    expect(status.value).toBe('백엔드 개발 서버 연결 정상')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('restores retry availability and shows a safe message for a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('internal error detail')))
    const { status, checking, checkBackend } = useHealthCheck()

    await checkBackend()
    expect(checking.value).toBe(false)
    expect(status.value).toBe('백엔드 연결 실패 — 개발 서버 실행 여부를 확인하세요.')
    expect(status.value).not.toContain('internal error detail')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not start duplicate requests while a check is pending', async () => {
    const fetchMock = vi.fn().mockImplementation(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const { checking, checkBackend } = useHealthCheck()
    const pending = checkBackend()

    await checkBackend()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(checking.value).toBe(true)
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS)
    await pending
    expect(checking.value).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
