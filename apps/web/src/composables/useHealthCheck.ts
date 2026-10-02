import { ref } from 'vue'
import { fetchHealth, HealthTimeoutError } from '../api/health'

export function useHealthCheck() {
  const status = ref('연결 확인 전')
  const checking = ref(false)

  async function checkBackend() {
    if (checking.value) return
    checking.value = true
    try {
      await fetchHealth()
      status.value = '백엔드 개발 서버 연결 정상'
    } catch (error) {
      status.value = error instanceof HealthTimeoutError
        ? error.message
        : '백엔드 연결 실패 — 개발 서버 실행 여부를 확인하세요.'
    } finally {
      checking.value = false
    }
  }

  return { status, checking, checkBackend }
}
