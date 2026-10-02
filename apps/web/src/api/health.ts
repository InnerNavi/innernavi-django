export interface HealthStatus {
  status: string
  scope: string
}

export const HEALTH_TIMEOUT_MS = 5_000

export class HealthTimeoutError extends Error {
  constructor() {
    super(`백엔드 응답이 ${HEALTH_TIMEOUT_MS / 1_000}초 동안 없어 연결 확인을 종료했습니다. 다시 시도하세요.`)
    this.name = 'HealthTimeoutError'
  }
}

export function isFoundationHealth(value: unknown): value is HealthStatus {
  if (typeof value !== 'object' || value === null) return false
  const data = value as Record<string, unknown>
  return data.status === 'ok' && data.scope === 'development-foundation'
}

export async function fetchHealth(): Promise<HealthStatus> {
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      // Settle the caller even if a test double or transport ignores cancellation.
      reject(new HealthTimeoutError())
      controller.abort()
    }, HEALTH_TIMEOUT_MS)
  })

  const request = (async () => {
    const response = await fetch('/api/v1/health/live', { signal: controller.signal })
    if (!response.ok) throw new Error('백엔드 연결에 실패했습니다.')
    const data: unknown = await response.json()
    if (!isFoundationHealth(data)) throw new Error('예상하지 않은 상태 응답입니다.')
    return data
  })()

  try {
    // The deadline covers both response headers and JSON body consumption.
    return await Promise.race([request, deadline])
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}
