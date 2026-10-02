<script setup lang="ts">
import { useHealthCheck } from './composables/useHealthCheck'

const { status, checking, checkBackend } = useHealthCheck()
</script>

<template>
  <main>
    <p class="eyebrow">LOCAL DEVELOPMENT FOUNDATION</p>
    <h1>InnerNavi</h1>
    <p>Python·Django·Vue 개발 기반입니다.</p>
    <p>회원가입, 지도 처리, 실내 길찾기는 아직 구현되지 않았습니다.</p>
    <button :disabled="checking" @click="checkBackend">백엔드 연결 확인</button>
    <p role="status" aria-live="polite">{{ status }}</p>
  </main>
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; color: #18352d; background: #f3f7f4; }
main { max-width: 720px; margin: 8vh auto; padding: 32px; }
h1 { font-size: clamp(2.5rem, 8vw, 4rem); margin: 16px 0; }
p { line-height: 1.7; }
.eyebrow { font-size: 0.75rem; letter-spacing: 0.12em; }
button { background: #18352d; color: white; border: 0; border-radius: 8px; padding: 14px 20px; cursor: pointer; font: inherit; }
button:disabled { opacity: 0.6; }
button:focus-visible { outline: 3px solid #bd6c19; outline-offset: 4px; }
</style>
